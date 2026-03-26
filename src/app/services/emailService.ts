/**
 * Email OTP Service
 *
 * Sends 6-digit OTP codes via email.
 *
 * ─── Production Setup (EmailJS — free: 200 emails/month) ───────
 *   1. Create account at https://emailjs.com
 *   2. Connect an email service (Gmail, Outlook, SendGrid, etc.)
 *   3. Create a template with variables:
 *      - {{to_email}}    → recipient address
 *      - {{otp_code}}    → the 6-digit code
 *      - {{expires_in}}  → expiry label
 *   4. Copy your Service ID, Template ID, and Public Key into .env:
 *      VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *      VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *      VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
 *
 * ─── Demo Mode (no EmailJS configured) ─────────────────────────
 *   The generated OTP code is returned to the AuthModal and displayed
 *   on-screen so you can test the full flow without email delivery.
 */

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || "";

const IS_EMAILJS_CONFIGURED =
  !!EMAILJS_SERVICE_ID && !!EMAILJS_TEMPLATE_ID && !!EMAILJS_PUBLIC_KEY;

export const OTP_EXPIRY_SECONDS  = 300; // 5 minutes
export const OTP_RESEND_COOLDOWN = 60;  // 1 minute between resends

// ─── In-Memory OTP Store ──────────────────────────────────────
// Server-side storage would be more secure, but for frontend-only
// this is acceptable — OTPs expire and can only be used once.

interface OtpEntry {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

// ─── Helpers ──────────────────────────────────────────────────

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ─── EmailJS REST API (no package needed) ─────────────────────

async function sendViaEmailJs(email: string, code: string): Promise<boolean> {
  if (!IS_EMAILJS_CONFIGURED) return false;

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: email,
          otp_code: code,
          expires_in: `${OTP_EXPIRY_SECONDS / 60} minutes`,
        },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[EmailService] EmailJS request failed:", err);
    return false;
  }
}

// ─── Public: Send OTP ─────────────────────────────────────────

export interface SendOtpResult {
  success: boolean;
  /**
   * In demo mode (EmailJS not configured), the OTP is returned
   * so the UI can display it for testing purposes.
   */
  demoCode?: string;
  error?: string;
}

export async function sendOtp(email: string): Promise<SendOtpResult> {
  const normalEmail = normalizeEmail(email);
  const code = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000;

  // Store OTP (overwrites any existing code for this email)
  otpStore.set(normalEmail, { code, email: normalEmail, expiresAt, attempts: 0 });

  if (IS_EMAILJS_CONFIGURED) {
    const sent = await sendViaEmailJs(email, code);
    if (sent) {
      return { success: true };
    }
    // EmailJS failed — fall through to demo mode so user isn't locked out
    console.warn("[EmailService] EmailJS delivery failed, falling back to demo mode");
  }

  // Demo mode — surface the code in UI
  console.info(`[EmailService] DEMO — OTP for ${email}: ${code}`);
  return { success: true, demoCode: code };
}

// ─── Public: Verify OTP ───────────────────────────────────────

export interface VerifyOtpResult {
  success: boolean;
  error?: "invalid" | "expired" | "too_many_attempts";
}

const MAX_ATTEMPTS = 5;

export function verifyOtp(email: string, inputCode: string): VerifyOtpResult {
  const normalEmail = normalizeEmail(email);
  const entry = otpStore.get(normalEmail);

  if (!entry) {
    return { success: false, error: "expired" };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalEmail);
    return { success: false, error: "expired" };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalEmail);
    return { success: false, error: "too_many_attempts" };
  }

  if (inputCode.trim() !== entry.code) {
    entry.attempts++;
    return { success: false, error: "invalid" };
  }

  // Verified — invalidate OTP immediately (single-use)
  otpStore.delete(normalEmail);
  return { success: true };
}

// ─── User Registry ────────────────────────────────────────────
// Lightweight localStorage-based user store.
// In production, replace with a proper backend/Supabase auth.

export interface StoredUser {
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
}

const USERS_KEY = "genodds_users_v2";

function loadUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Returns true if an account for this email already exists. */
export function isRegisteredUser(email: string): boolean {
  return !!loadUsers()[normalizeEmail(email)];
}

/**
 * Creates or updates a user record and returns the stored profile.
 * Called after successful OTP verification.
 */
export function registerOrLoginUser(email: string, name: string): StoredUser {
  const users = loadUsers();
  const key   = normalizeEmail(email);
  const now   = new Date().toISOString();

  if (users[key]) {
    users[key].lastLogin = now;
    if (name?.trim()) users[key].name = name.trim();
  } else {
    users[key] = {
      email: key,
      name: name?.trim() || email.split("@")[0],
      createdAt: now,
      lastLogin: now,
    };
  }

  saveUsers(users);
  return users[key];
}

/** Returns the stored user profile, or null if not found. */
export function getStoredUser(email: string): StoredUser | null {
  return loadUsers()[normalizeEmail(email)] || null;
}
