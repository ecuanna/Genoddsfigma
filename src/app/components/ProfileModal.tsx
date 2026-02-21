import {
  X,
  User,
  Heart,
  Mail,
  Calendar,
  Globe,
  Clock,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type ProfileTab = "personal" | "responsible";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string };
  onUpdateUser: (user: { name: string; email: string }) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  translations: Record<string, string>;
  initialTab?: ProfileTab;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  isDarkMode,
  translations: t,
  initialTab = "personal",
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Personal
  const [displayName, setDisplayName] = useState(user.name);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");

  // Responsible
  const [sessionReminder, setSessionReminder] = useState(false);
  const [sessionInterval, setSessionInterval] = useState("60");
  const [coolOffPeriod, setCoolOffPeriod] = useState("");

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

  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "personal",
      label: t.profileTabPersonal,
      icon: <User className="w-4 h-4" />,
    },
    {
      key: "responsible",
      label: t.profileTabResponsible,
      icon: <Heart className="w-4 h-4" />,
    },
  ];

  const handleSavePersonal = () => {
    if (displayName.trim()) {
      onUpdateUser({ ...user, name: displayName.trim() });
      toast(t.profileSaved, { duration: 1500 });
    }
  };

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

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold ${
                  isDarkMode
                    ? "bg-[#022179]/30 text-blue-400"
                    : "bg-[#022179]/10 text-[#022179]"
                }`}
              >
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <p className={`font-semibold ${textPrimary}`}>{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className={`w-3.5 h-3.5 ${textMuted}`} />
                  <span className={`text-sm ${textSecondary}`}>
                    {user.email}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full ml-1">
                    <BadgeCheck className="w-3 h-3" />
                    {t.profileEmailVerified}
                  </span>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label
                className={`block text-xs font-medium ${textSecondary} mb-1.5`}
              >
                {t.profileDisplayName}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-[#022179]/30 focus:border-[#022179] ${bgInput}`}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label
                className={`block text-xs font-medium ${textSecondary} mb-1.5`}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.profileDateOfBirth}
                </span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split("T")[0]
                }
                className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-[#022179]/30 focus:border-[#022179] ${bgInput}`}
              />
              <p className={`text-xs ${textMuted} mt-1`}>
                {t.profileDateOfBirthDesc}
              </p>
            </div>

            {/* Country */}
            <div>
              <label
                className={`block text-xs font-medium ${textSecondary} mb-1.5`}
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {t.profileCountry}
                </span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors focus:ring-2 focus:ring-[#022179]/30 focus:border-[#022179] ${bgInput}`}
              >
                <option value="">{t.profileSelectCountry}</option>
                <option value="TR">{t.profileTurkey}</option>
                <option value="DE">{t.profileGermany}</option>
                <option value="UK">{t.profileUK}</option>
                <option value="NL">{t.profileNetherlands}</option>
                <option value="FR">{t.profileFrance}</option>
                <option value="other">{t.profileOther}</option>
              </select>
              <p className={`text-xs ${textMuted} mt-1`}>
                {t.profileCountryDesc}
              </p>
            </div>

            {/* Age Warning */}
            <div
              className={`flex items-start gap-2.5 p-3 rounded-lg ${
                isDarkMode
                  ? "bg-amber-900/20 border border-amber-800/30"
                  : "bg-amber-50 border border-amber-200"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? "text-amber-400" : "text-amber-600"
                }`}
              />
              <p
                className={`text-xs ${
                  isDarkMode ? "text-amber-300" : "text-amber-700"
                }`}
              >
                {t.profileAge18Warning}
              </p>
            </div>

            {/* Save */}
            <button
              onClick={handleSavePersonal}
              className="w-full py-2.5 rounded-lg bg-[#022179] text-white text-sm font-semibold hover:bg-[#022179]/90 transition-colors"
            >
              {t.profileSaveChanges}
            </button>
          </div>
        );

      case "responsible":
        return (
          <div className="space-y-5">
            {/* Info banner */}
            <div
              className={`p-3.5 rounded-lg ${
                isDarkMode
                  ? "bg-blue-900/20 border border-blue-800/30"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <p
                className={`text-xs ${
                  isDarkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                {t.profileResponsibleDesc}
              </p>
            </div>

            {/* Session Reminder */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SettingRow
                icon={<Clock className="w-4 h-4" />}
                title={t.profileSessionReminder}
                desc={t.profileSessionReminderDesc}
              >
                <Toggle
                  checked={sessionReminder}
                  onChange={setSessionReminder}
                />
              </SettingRow>

              {sessionReminder && (
                <div className="mt-3 ml-7">
                  <label
                    className={`block text-xs ${textSecondary} mb-1.5`}
                  >
                    {t.profileSessionInterval}
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "30", label: t.profileSession30 },
                      { value: "60", label: t.profileSession60 },
                      { value: "120", label: t.profileSession120 },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSessionInterval(opt.value)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                          sessionInterval === opt.value
                            ? "bg-[#022179] text-white border-[#022179]"
                            : isDarkMode
                            ? "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400"
                            : "bg-white border-gray-200 text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cool-Off */}
            <div className={`p-4 rounded-lg ${bgCard}`}>
              <SectionTitle>{t.profileCoolOff}</SectionTitle>
              <p className={`text-xs ${textSecondary} mb-3 -mt-1`}>
                {t.profileCoolOffDesc}
              </p>
              <div className="flex gap-2">
                {[
                  { value: "24h", label: t.profileCoolOff24h },
                  { value: "7d", label: t.profileCoolOff7d },
                  { value: "30d", label: t.profileCoolOff30d },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      setCoolOffPeriod(
                        coolOffPeriod === opt.value ? "" : opt.value
                      )
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      coolOffPeriod === opt.value
                        ? "bg-amber-500 text-white border-amber-500"
                        : isDarkMode
                        ? "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-amber-500/30"
                        : "bg-white border-gray-200 text-gray-600 hover:border-amber-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {coolOffPeriod && (
                <button
                  onClick={() => {
                    toast(t.profileCoolOffActivate, { duration: 2000 });
                    setCoolOffPeriod("");
                  }}
                  className="mt-3 w-full py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                >
                  {t.profileCoolOffActivate}
                </button>
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
          <h2 className={`text-lg font-semibold ${textPrimary}`}>
            {t.profileTitle}
          </h2>
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