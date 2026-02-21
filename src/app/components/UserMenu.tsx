import { LogOut, Bookmark, Settings, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UserMenuProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onOpenFavorites: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  favoritesCount: number;
  isDarkMode?: boolean;
  translations: {
    favorites: string;
    settings: string;
    logout: string;
    profile: string;
  };
}

export function UserMenu({
  user,
  onLogout,
  onOpenFavorites,
  onOpenSettings,
  onOpenProfile,
  favoritesCount,
  isDarkMode = false,
  translations,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const menuBg = isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-white border-gray-200";
  const menuHover = isDarkMode ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50";
  const textPrimary = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";
  const headerBg = isDarkMode ? "bg-[#0e0e0e] border-[#2a2a2a]" : "bg-gray-50 border-gray-200";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-semibold">
          {initials}
        </div>
        <span className="hidden md:block font-medium">{user.name}</span>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${menuBg}`}>
          {/* User Info */}
          <div className={`p-4 border-b ${headerBg}`}>
            <p className={`font-semibold ${textPrimary}`}>{user.name}</p>
            <p className={`text-sm ${textSecondary}`}>{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <button
              onClick={() => {
                onOpenProfile();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 ${menuHover} transition-colors text-left`}
            >
              <UserIcon className={`w-4.5 h-4.5 ${isDarkMode ? "text-blue-400" : "text-[#022179]"}`} />
              <span className={`text-sm ${textPrimary}`}>{translations.profile}</span>
            </button>

            <button
              onClick={() => {
                onOpenFavorites();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 ${menuHover} transition-colors text-left`}
            >
              <Bookmark className={`w-4.5 h-4.5 ${isDarkMode ? "text-blue-400" : "text-[#022179]"}`} />
              <span className={`text-sm ${textPrimary}`}>{translations.favorites}</span>
              {favoritesCount > 0 && (
                <span className="ml-auto bg-[#022179] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 ${menuHover} transition-colors text-left`}
            >
              <Settings className={`w-4.5 h-4.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              <span className={`text-sm ${textPrimary}`}>{translations.settings}</span>
            </button>
          </div>

          {/* Logout */}
          <div className={`border-t ${isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"}`}>
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 ${isDarkMode ? "hover:bg-red-900/20" : "hover:bg-red-50"} transition-colors text-left text-red-500`}
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="text-sm font-medium">{translations.logout}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
