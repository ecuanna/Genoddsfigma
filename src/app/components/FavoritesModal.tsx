import { useState } from "react";
import { X, Bookmark, Users, Trophy, Medal, Dumbbell } from "lucide-react";
import { CategorizedFavorites } from "./FavoritesSection";

type FavTab = "teams" | "matches" | "leagues" | "sports";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: CategorizedFavorites;
  onRemove: (category: FavTab, item: string) => void;
  isDarkMode?: boolean;
  translations: {
    favoritesTitle: string;
    favTeams: string;
    favMatches: string;
    favLeagues: string;
    favSports: string;
    noFavTeams: string;
    noFavMatches: string;
    noFavLeagues: string;
    noFavSports: string;
    noFavTeamsDesc: string;
    noFavMatchesDesc: string;
    noFavLeaguesDesc: string;
    noFavSportsDesc: string;
    remove: string;
  };
}

export function FavoritesModal({
  isOpen,
  onClose,
  favorites,
  onRemove,
  isDarkMode = false,
  translations,
}: FavoritesModalProps) {
  const [activeTab, setActiveTab] = useState<FavTab>("teams");

  if (!isOpen) return null;

  const tabs: {
    key: FavTab;
    label: string;
    count: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "teams",
      label: translations.favTeams,
      count: favorites.teams.length,
      icon: <Users className="w-4 h-4" />,
    },
    {
      key: "matches",
      label: translations.favMatches,
      count: favorites.matches.length,
      icon: <Trophy className="w-4 h-4" />,
    },
    {
      key: "leagues",
      label: translations.favLeagues,
      count: favorites.leagues.length,
      icon: <Medal className="w-4 h-4" />,
    },
    {
      key: "sports",
      label: translations.favSports,
      count: favorites.sports.length,
      icon: <Dumbbell className="w-4 h-4" />,
    },
  ];

  const emptyMessages: Record<FavTab, { title: string; desc: string }> = {
    teams: {
      title: translations.noFavTeams,
      desc: translations.noFavTeamsDesc,
    },
    matches: {
      title: translations.noFavMatches,
      desc: translations.noFavMatchesDesc,
    },
    leagues: {
      title: translations.noFavLeagues,
      desc: translations.noFavLeaguesDesc,
    },
    sports: {
      title: translations.noFavSports,
      desc: translations.noFavSportsDesc,
    },
  };

  const emptyIcons: Record<FavTab, React.ReactNode> = {
    teams: <Users className="w-12 h-12" />,
    matches: <Trophy className="w-12 h-12" />,
    leagues: <Medal className="w-12 h-12" />,
    sports: <Dumbbell className="w-12 h-12" />,
  };

  const activeItems = favorites[activeTab];
  const totalCount =
    favorites.teams.length +
    favorites.matches.length +
    favorites.leagues.length +
    favorites.sports.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`${isDarkMode ? "bg-[#141414]" : "bg-white"} rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <Bookmark
              className={`w-5 h-5 ${
                isDarkMode
                  ? "text-blue-400 fill-blue-400"
                  : "text-[#022179] fill-[#022179]"
              }`}
            />
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {translations.favoritesTitle}
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                isDarkMode
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-[#022179]/10 text-[#022179]"
              }`}
            >
              {totalCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200 hover:bg-[#1e1e1e]"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            } transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${
            isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? isDarkMode
                    ? "border-blue-400 text-blue-400 bg-blue-500/5"
                    : "border-[#022179] text-[#022179] bg-blue-50/50"
                  : isDarkMode
                  ? "border-transparent text-gray-500 hover:text-gray-300"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    activeTab === tab.key
                      ? isDarkMode
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-[#022179]/10 text-[#022179]"
                      : isDarkMode
                      ? "bg-[#252525] text-gray-500"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeItems.length === 0 ? (
            <div className="text-center py-10">
              <span
                className={`block mx-auto mb-3 ${
                  isDarkMode ? "text-gray-700" : "text-gray-200"
                }`}
              >
                {emptyIcons[activeTab]}
              </span>
              <p
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} mb-1`}
              >
                {emptyMessages[activeTab].title}
              </p>
              <p
                className={`${isDarkMode ? "text-gray-600" : "text-gray-400"} text-sm`}
              >
                {emptyMessages[activeTab].desc}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeItems.map((item) => (
                <div
                  key={item}
                  className={`flex items-center justify-between p-3 rounded-lg group ${
                    isDarkMode
                      ? "bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333]"
                      : "bg-gray-50 border border-gray-150 hover:bg-gray-100"
                  } transition-all`}
                >
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item}
                  </span>
                  <button
                    onClick={() => onRemove(activeTab, item)}
                    className={`text-sm px-2.5 py-1 rounded-md transition-all opacity-60 group-hover:opacity-100 ${
                      isDarkMode
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-red-500 hover:bg-red-50"
                    }`}
                  >
                    {translations.remove}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t ${
            isDarkMode
              ? "border-[#2a2a2a] bg-[#0e0e0e]"
              : "border-gray-200 bg-gray-50"
          } p-4`}
        >
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            } text-center`}
          >
            {translations.favTeams === "Takımlar"
              ? "Favorileriniz cihazlar arasında senkronize edilir"
              : "Your favorites are synced across devices"}
          </p>
        </div>
      </div>
    </div>
  );
}
