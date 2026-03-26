import { useState, useEffect, useRef, useCallback } from "react";
import { X, Mail, User, ArrowRight, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  sendOtp,
  verifyOtp,
  isRegisteredUser,
  registerOrLoginUser,
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_COOLDOWN,
} from "../services/emailService";

// ─── Types ────────────────────────────────────────────────────

type Step = "email" | "otp";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { email: string; name: string }) => void;
  isDarkMode?: boolean;
  translations: {
    loginTitle: string;
    registerTitle: string;
    email: string;
    name: string;
    loginButton: string;
    registerButtonModal: string;
    noAccount: string;
    haveAccount: string;
    // OTP
    otpSent?: string;
    otpEnterCode?: string;
    otpResend?: string;
    otpExpires?: string;
    otpInvalid?: string;
    otpExpired?: string;
    otpTooMany?: string;
    otpVerify?: string;
    otpBack?: string;
    otpNewUser?: string;
    otpSending?: string;
  };
}

// ─── OTP Input Component ──────────────────────────────────────

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  isDarkMode: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

function OtpDigitInput({ value, onChange, isDarkMode, disabled, hasError }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").slice(0, 6).split("");

  const handleChange = (idx: number, char: string) => {
    const sanitized = char.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[idx] = sanitized;
    onChange(next.join("").trim());
    if (sanitized && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[idx]) {
        next[idx] = "";
        onChange(next.join(""));
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        next[idx - 1] = "";
        onChange(next.join(""));
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) inputs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, "").slice(0, 6));
      setTimeout(() => inputs.current[Math.min(pasted.length, 5)]?.focus(), 0);
    }
    e.preventDefault();
  };

  const borderClass = hasError
    ? "border-red-500 bg-red-500/10"
    : isDarkMode
    ? "border-[#2a2a2a] bg-[#1a1a1a] text-white focus:border-blue-500"
    : "border-gray-300 bg-white text-gray-900 focus:border-[#022179]";

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl
            transition-all outline-none focus:ring-2 focus:ring-blue-500/30
            disabled:opacity-40 ${borderClass}`}
        />
      ))}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────

function useCountdown(seconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!active) return;
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, active]);

  return remaining;
}

// ─── Main Modal ───────────────────────────────────────────────

export function AuthModal({
  isOpen,
  onClose,
  onLogin,
  isDarkMode = false,
  translations: t,
}: AuthModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const expiryCount = useCountdown(OTP_EXPIRY_SECONDS, step === "otp");
  const resendCount = useCountdown(OTP_RESEND_COOLDOWN, resendCooldown > 0);

  // Resend cooldown
  useEffect(() => {
    if (step === "otp" && resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(0), OTP_RESEND_COOLDOWN * 1000);
      return () => clearTimeout(t);
    }
  }, [step, resendCooldown]);

  const resetForm = useCallback(() => {
    setStep("email");
    setEmail("");
    setName("");
    setOtpCode("");
    setOtpError(null);
    setDemoCode(null);
    setResendCooldown(0);
    setIsNewUser(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (otpCode.replace(/\D/g, "").length === 6 && step === "otp" && !isVerifying) {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCode]);

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (isSending) return;

    setIsSending(true);
    setOtpError(null);

    const newUser = !isRegisteredUser(email);
    setIsNewUser(newUser);

    const result = await sendOtp(email);
    setIsSending(false);

    if (result.success) {
      setDemoCode(result.demoCode || null);
      setStep("otp");
      setResendCooldown(OTP_RESEND_COOLDOWN);
    } else {
      setOtpError("E-posta gönderilemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.replace(/\D/g, "").length < 6) return;
    if (isVerifying) return;

    setIsVerifying(true);
    setOtpError(null);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 300));

    const result = verifyOtp(email, otpCode);
    setIsVerifying(false);

    if (result.success) {
      const user = registerOrLoginUser(email, name);
      resetForm();
      onLogin({ email: user.email, name: user.name });
    } else {
      setOtpCode("");
      if (result.error === "expired") {
        setOtpError(t.otpExpired || "Kod süresi doldu. Yeni kod gönderin.");
      } else if (result.error === "too_many_attempts") {
        setOtpError(t.otpTooMany || "Çok fazla hatalı deneme. Yeni kod gönderin.");
      } else {
        setOtpError(t.otpInvalid || "Geçersiz kod. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setOtpCode("");
    setOtpError(null);
    setDemoCode(null);
    setResendCooldown(OTP_RESEND_COOLDOWN);
    setIsSending(true);

    const result = await sendOtp(email);
    setIsSending(false);

    if (result.success) {
      setDemoCode(result.demoCode || null);
    }
  };

  if (!isOpen) return null;

  const bg = isDarkMode ? "bg-[#141414]" : "bg-white";
  const border = isDarkMode ? "border-[#2a2a2a]" : "border-gray-200";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textMuted = isDarkMode ? "text-gray-400" : "text-gray-500";
  const inputClass = `w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-[#022179] outline-none transition-all ${
    isDarkMode
      ? "bg-[#1a1a1a] border-[#333] text-white placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`${bg} rounded-2xl shadow-2xl max-w-md w-full overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#022179] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-lg ${textPrimary}`}>
                {step === "email"
                  ? isNewUser
                    ? t.registerTitle
                    : t.loginTitle
                  : t.otpEnterCode || "Doğrulama Kodu"}
              </h2>
              {step === "otp" && (
                <p className={`text-xs ${textMuted}`}>
                  {email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-4"
            >
              {/* Info banner */}
              <div className={`rounded-xl p-4 border ${
                isDarkMode
                  ? "bg-blue-500/10 border-blue-500/20"
                  : "bg-blue-50 border-blue-100"
              }`}>
                <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                  Hesabınıza e-posta ile güvenli giriş yapın.
                  Şifre gerekmez — tek seferlik kod yeterli!
                </p>
              </div>

              {/* Email field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className={inputClass}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Name field (for new users — shown after email is entered) */}
              {isNewUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {t.name} <span className={`text-xs ${textMuted}`}>(İsteğe bağlı)</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className={inputClass}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}

              {/* Send OTP button */}
              <button
                onClick={handleSendOtp}
                disabled={isSending || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                className="w-full flex items-center justify-center gap-2 bg-[#022179] hover:bg-[#022179]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.otpSending || "Gönderiliyor..."}</span>
                  </>
                ) : (
                  <>
                    <span>Doğrulama Kodu Gönder</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Privacy note */}
              <p className={`text-xs text-center ${textMuted}`}>
                Devam ederek{" "}
                <a href="#" className="text-[#022179] hover:underline">Kullanım Koşulları</a>
                {" "}ve{" "}
                <a href="#" className="text-[#022179] hover:underline">Gizlilik Politikası</a>
                'nı kabul etmiş olursunuz.
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === "otp" && (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-5"
            >
              {/* Description */}
              <div className="text-center space-y-1">
                <p className={`text-sm ${textMuted}`}>
                  <span className="font-medium">{email}</span> adresine
                  6 haneli doğrulama kodu gönderildi.
                </p>

                {/* Expiry countdown */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${expiryCount > 60 ? "bg-green-500" : expiryCount > 30 ? "bg-yellow-500" : "bg-red-500"}`} />
                  <span className={`text-xs font-mono ${
                    expiryCount > 60 ? (isDarkMode ? "text-green-400" : "text-green-600") :
                    expiryCount > 30 ? (isDarkMode ? "text-yellow-400" : "text-yellow-600") :
                    "text-red-500"
                  }`}>
                    {t.otpExpires || "Kod geçerlilik:"} {Math.floor(expiryCount / 60)}:{String(expiryCount % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Demo mode notice */}
              {demoCode && (
                <div className={`rounded-xl p-3 border text-center ${
                  isDarkMode
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-amber-50 border-amber-200"
                }`}>
                  <p className={`text-xs mb-1 ${isDarkMode ? "text-amber-400" : "text-amber-700"}`}>
                    Demo Modu — E-posta servisi yapılandırılmamış
                  </p>
                  <p className={`font-mono text-lg font-bold tracking-[0.5em] ${isDarkMode ? "text-amber-300" : "text-amber-800"}`}>
                    {demoCode}
                  </p>
                </div>
              )}

              {/* OTP digit inputs */}
              <div>
                <OtpDigitInput
                  value={otpCode}
                  onChange={setOtpCode}
                  isDarkMode={isDarkMode}
                  disabled={isVerifying || expiryCount === 0}
                  hasError={!!otpError}
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 border ${
                      isDarkMode
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{otpError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otpCode.replace(/\D/g, "").length < 6 || expiryCount === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#022179] hover:bg-[#022179]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.otpVerify || "Kodu Doğrula"}</span>
                  </>
                )}
              </button>

              {/* Resend & back */}
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => { setStep("email"); setOtpCode(""); setOtpError(null); }}
                  className={`${textMuted} hover:text-[#022179] transition-colors`}
                >
                  ← {t.otpBack || "E-postayı değiştir"}
                </button>

                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isSending}
                  className={`transition-colors ${
                    resendCooldown > 0
                      ? textMuted + " cursor-default"
                      : "text-[#022179] hover:underline font-medium"
                  }`}
                >
                  {isSending
                    ? "Gönderiliyor..."
                    : resendCooldown > 0
                    ? `Yeniden gönder (${resendCount}s)`
                    : t.otpResend || "Yeniden Gönder"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
