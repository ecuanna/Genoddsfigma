import {
  X,
  Settings,
  Shield,
  Lock,
  Bell,
  Mail,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type SettingsTab = "general" | "security" | "privacy";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  translations: Record<string, string>;
  user: { name: string; email: string };
  onLogout: () => void;
  initialTab?: SettingsTab;
}

export function SettingsModal({
  isOpen,
  onClose,
  isDarkMode,
  translations: t,
  user,
  onLogout,
  initialTab = "general",
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Display Preferences
  const [oddsFormat, setOddsFormat] = useState("decimal");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Notification Channels
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailNotifEnabled, setEmailNotifEnabled] = useState(true);

  // Notification Preferences
  const [favOddsNotif, setFavOddsNotif] = useState(true);
  const [newMatchNotif, setNewMatchNotif] = useState(false);
  const [promoNotif, setPromoNotif] = useState(true);

  // Marketing
  const [marketingConsent, setMarketingConsent] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Privacy
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const bg = isDarkMode ? "bg-[#0e0e0e]" : "bg-white";
  const bgCard = isDarkMode ? "bg-[#141414]" : "bg-gray-50";
  const bgInput = isDarkMode
    ? "bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-500";
  const textMuted = isDarkMode ? "text-gray-500" : "text-gray-400";
  const borderColor = isDarkMode ? "border-[#1e1e1e]" : "border-gray-100";
  const hoverBg = isDarkMode ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50";

  // Toggle component
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[#022179]" : isDarkMode ? "bg-[#2a2a2a]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );

  // Section title
  const SectionTitle = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 className={`text-sm font-semibold ${textPrimary} mb-3 ${className}`}>
      {children}
    </h3>
  );

  // Row component
  const SettingRow = ({
    icon,
    title,
    desc,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    desc?: string;
    children: React.ReactNode;
  }) => (
    <div
      className={`flex items-start gap-3 py-3.5 ${borderColor} border-b last:border-b-0`}
    >
      <span className={`mt-0.5 ${textMuted}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${textPrimary}`}>{title}</p>
        {desc && <p className={`text-xs ${textSecondary} mt-0.5`}>{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "general",
      label: t.settingsTabGeneral,
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "security",
      label: t.profileTabSecurity,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "privacy",
      label: t.profileTabPrivacy,
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  const handleSave = () => {
    toast(t.settingsSaved || t.profileSaved, { duration: 1500 });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast(t.profilePasswordMismatch, { duration: 2000 });
      return;
    }
    if (newPassword.length < 6) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast(t.settingsSaved || t.profileSaved, { duration: 1500 });
  };

  const handleExportData = () => {
    const data = {
      user,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "genodds-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast(t.profileDataExportBtn + " - OK", { duration: 1500 });
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    onLogout();
    onClose();
    toast(t.profileDeleteAccountBtn, { duration: 3000 });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-5">
            {/* Display Preferences */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileDisplayPrefs}</SectionTitle>

              {/* Odds Format */}
              <div className="mb-4">
                <label
                  className={`block text-xs font-medium ${textSecondary} mb-1.5`}
                >
                  {t.profileOddsFormat}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "decimal", label: t.profileOddsDecimal },
                    { value: "fractional", label: t.profileOddsFractional },
                    { value: "american", label: t.profileOddsAmerican },
                  ].map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setOddsFormat(fmt.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        oddsFormat === fmt.value
                          ? "bg-[#022179] text-white border-[#022179]"
                          : isDarkMode
                          ? "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label
                  className={`block text-xs font-medium ${textSecondary} mb-1.5`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {t.profileTimezone}
                  </span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-[#022179]/30 focus:border-[#022179] ${bgInput}`}
                >
                  <option value="Europe/Istanbul">
                    Europe/Istanbul (UTC+3)
                  </option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                  <option value="Europe/Berlin">Europe/Berlin (UTC+1)</option>
                  <option value="Europe/Amsterdam">
                    Europe/Amsterdam (UTC+1)
                  </option>
                  <option value="America/New_York">
                    America/New_York (UTC-5)
                  </option>
                </select>
              </div>
            </div>

            {/* Notification Channels */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileNotifChannels}</SectionTitle>
              <SettingRow
                icon={<Bell className="w-4 h-4" />}
                title={t.profilePushNotif}
                desc={t.profilePushNotifDesc}
              >
                <Toggle
                  checked={pushEnabled}
                  onChange={(v) => {
                    if (v && "Notification" in window) {
                      Notification.requestPermission().then((p) => {
                        if (p === "granted") setPushEnabled(true);
                      });
                    } else {
                      setPushEnabled(v);
                    }
                  }}
                />
              </SettingRow>

              <SettingRow
                icon={<Mail className="w-4 h-4" />}
                title={t.profileEmailNotif}
                desc={t.profileEmailNotifDesc}
              >
                <Toggle
                  checked={emailNotifEnabled}
                  onChange={setEmailNotifEnabled}
                />
              </SettingRow>
            </div>

            {/* Notification Preferences */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileNotifPrefs}</SectionTitle>
              <SettingRow
                icon={<ChevronRight className="w-4 h-4" />}
                title={t.profileFavOddsNotif}
                desc={t.profileFavOddsNotifDesc}
              >
                <Toggle checked={favOddsNotif} onChange={setFavOddsNotif} />
              </SettingRow>

              <SettingRow
                icon={<ChevronRight className="w-4 h-4" />}
                title={t.profileNewMatchNotif}
                desc={t.profileNewMatchNotifDesc}
              >
                <Toggle checked={newMatchNotif} onChange={setNewMatchNotif} />
              </SettingRow>

              <SettingRow
                icon={<ChevronRight className="w-4 h-4" />}
                title={t.profilePromoNotif}
                desc={t.profilePromoNotifDesc}
              >
                <Toggle checked={promoNotif} onChange={setPromoNotif} />
              </SettingRow>
            </div>

            {/* Marketing Consent */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SettingRow
                icon={<Mail className="w-4 h-4" />}
                title={t.profileMarketingConsent}
                desc={t.profileMarketingConsentDesc}
              >
                <Toggle
                  checked={marketingConsent}
                  onChange={setMarketingConsent}
                />
              </SettingRow>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-lg bg-[#022179] text-white text-sm font-semibold hover:bg-[#022179]/90 transition-colors"
            >
              {t.profileSaveChanges}
            </button>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            {/* Change Password */}
            <div>
              <SectionTitle>{t.profileChangePassword}</SectionTitle>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t.profileCurrentPassword}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm pr-10 ${bgInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}
                  >
                    {showCurrentPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t.profileNewPassword}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm pr-10 ${bgInput}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}
                  >
                    {showNewPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.profileConfirmPassword}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm ${bgInput}`}
                />
                <button
                  onClick={handleUpdatePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-2.5 rounded-lg bg-[#022179] text-white text-sm font-semibold hover:bg-[#022179]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t.profileUpdatePassword}
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SettingRow
                icon={<Shield className="w-4 h-4" />}
                title={t.profileTwoFactor}
                desc={t.profileTwoFactorDesc}
              >
                <Toggle
                  checked={twoFactorEnabled}
                  onChange={setTwoFactorEnabled}
                />
              </SettingRow>
            </div>

            {/* Session Info */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileSessionInfo}</SectionTitle>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textSecondary}`}>
                    {t.profileLastLogin}
                  </span>
                  <span className={`text-xs ${textPrimary}`}>
                    21 Şubat 2026, 14:32
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textSecondary}`}>
                    {t.profileAccountCreated}
                  </span>
                  <span className={`text-xs ${textPrimary}`}>
                    15 Ocak 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-5">
            {/* KVKK / GDPR */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileKVKK}</SectionTitle>
              <p className={`text-xs ${textSecondary} mb-3 -mt-1`}>
                {t.profileKVKKDesc}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#022179] hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t.profileKVKKLink}
              </a>
            </div>

            {/* Data Export */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileDataExport}</SectionTitle>
              <p className={`text-xs ${textSecondary} mb-3 -mt-1`}>
                {t.profileDataExportDesc}
              </p>
              <button
                onClick={handleExportData}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  isDarkMode
                    ? "border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]"
                    : "border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                {t.profileDataExportBtn}
              </button>
            </div>

            {/* Delete Account */}
            <div
              className={`p-4 rounded-lg border ${
                isDarkMode
                  ? "bg-red-900/10 border-red-800/30"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <SectionTitle>{t.profileDeleteAccount}</SectionTitle>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-red-300" : "text-red-600"
                } mb-3 -mt-1`}
              >
                {t.profileDeleteAccountDesc}
              </p>

              {!deleteConfirmOpen ? (
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.profileDeleteAccountBtn}
                </button>
              ) : (
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-lg ${
                      isDarkMode ? "bg-red-900/30" : "bg-red-100"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isDarkMode ? "text-red-400" : "text-red-600"
                        }`}
                      />
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-red-300" : "text-red-700"
                        }`}
                      >
                        {t.profileDeleteConfirm}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmOpen(false)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        isDarkMode
                          ? "border-[#2a2a2a] text-gray-300 hover:bg-[#1a1a1a]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {t.profileClose}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      {t.profileDeleteAccountBtn}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`${bg} rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${borderColor}`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>
              {t.settingsTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${hoverBg} ${textMuted}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`px-5 py-2.5 border-b ${borderColor} overflow-x-auto`}
        >
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-[#022179] text-white"
                    : `${textSecondary} ${hoverBg}`
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}