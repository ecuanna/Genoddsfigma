import { useState, useEffect } from "react";
import { Cookie, X, Settings2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "genodds_cookie_consent";

type ConsentStatus = "pending" | "accepted" | "minimal";

interface CookieBannerProps {
  isDarkMode: boolean;
  language: "tr" | "en";
  onOpenCookiePolicy: () => void;
}

export function CookieBanner({ isDarkMode, language, onOpenCookiePolicy }: CookieBannerProps) {
  const [status, setStatus] = useState<ConsentStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
      if (saved === "accepted" || saved === "minimal") {
        setStatus(saved);
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch { /* noop */ }
    setStatus("accepted");
  };

  const minimal = () => {
    try { localStorage.setItem(STORAGE_KEY, "minimal"); } catch { /* noop */ }
    setStatus("minimal");
  };

  const visible = status === "pending";

  const tr = {
    title: "Çerez ve Gizlilik Tercihleri",
    body: "GENODDS; hizmet kalitesini geliştirmek, güvenliği sağlamak ve affiliate performansını ölçmek amacıyla zorunlu ve opsiyonel çerezler kullanmaktadır.",
    body2: "Zorunlu çerezler her zaman etkindir. Opsiyonel çerezleri kabul veya reddedebilirsiniz.",
    accept: "Tümünü Kabul Et",
    minimal: "Yalnızca Zorunlu",
    policy: "Çerez Politikası",
    age: "18+ platformu. Yalnızca yasal bahis bölgelerindeki kullanıcılara hizmet verilir.",
  };

  const en = {
    title: "Cookie & Privacy Preferences",
    body: "GENODDS uses essential and optional cookies to improve service quality, ensure security and measure affiliate performance.",
    body2: "Essential cookies are always active. You may accept or decline optional cookies.",
    accept: "Accept All",
    minimal: "Essential Only",
    policy: "Cookie Policy",
    age: "18+ platform. Service provided only to users in legal betting jurisdictions.",
  };

  const t = language === "tr" ? tr : en;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-[150] px-4 pb-4 sm:px-6"
        >
          <div
            className={`relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden ${
              isDarkMode
                ? "bg-[#141414] border border-[#2a2a2a]"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-[#022179] via-blue-400 to-[#022179]" />

            <div className="p-4 sm:p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#022179]/10 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-4 h-4 text-[#022179]" />
                  </div>
                  <span className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {t.title}
                  </span>
                </div>
                <button
                  onClick={minimal}
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDarkMode ? "hover:bg-[#2a2a2a] text-gray-600" : "hover:bg-gray-100 text-gray-400"}`}
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body */}
              <p className={`text-xs leading-relaxed mb-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                {t.body}
              </p>

              {/* Details toggle */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-3 p-3 rounded-xl text-xs leading-relaxed space-y-2 ${isDarkMode ? "bg-[#1a1a1a] text-gray-500" : "bg-gray-50 text-gray-500"}`}>
                      <div className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{language === "tr" ? "Zorunlu çerezler: Güvenlik, oturum yönetimi, bölge tespiti" : "Essential cookies: Security, session management, region detection"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Settings2 className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{language === "tr" ? "Opsiyonel çerezler: Analitik, performans, affiliate ölçümleme, pazarlama" : "Optional cookies: Analytics, performance, affiliate measurement, marketing"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`text-xs font-medium underline-offset-2 hover:underline transition-colors flex items-center gap-1 ${isDarkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Settings2 className="w-3 h-3" />
                  {language === "tr" ? "Detaylar" : "Details"}
                </button>

                <button
                  onClick={onOpenCookiePolicy}
                  className={`text-xs font-medium underline-offset-2 hover:underline transition-colors ${isDarkMode ? "text-blue-400/70 hover:text-blue-300" : "text-[#022179]/60 hover:text-[#022179]"}`}
                >
                  {t.policy}
                </button>

                <div className="flex-1" />

                <div className="flex gap-2">
                  <button
                    onClick={minimal}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      isDarkMode
                        ? "border-[#2a2a2a] text-gray-400 hover:bg-[#2a2a2a]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t.minimal}
                  </button>
                  <button
                    onClick={accept}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold bg-[#022179] text-white hover:bg-[#022179]/90 transition-colors"
                  >
                    {t.accept}
                  </button>
                </div>
              </div>

              {/* Age notice */}
              <p className={`text-[9px] mt-3 leading-relaxed ${isDarkMode ? "text-gray-700" : "text-gray-400"}`}>
                {t.age}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
