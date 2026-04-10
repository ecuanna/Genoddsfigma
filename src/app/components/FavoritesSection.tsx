import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  Users,
  Trophy as TrophyIcon,
  Medal,
  Dumbbell,
  X,
  LogIn,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import { BookmakerSearch } from "./BookmakerSearch";

export interface CategorizedFavorites {
  teams: string[];
  matches: string[];
  leagues: string[];
  sports: string[];
  bookmakers: string[];
}

type FavTab = "teams" | "matches" | "leagues" | "sports" | "bookmakers";

interface FavoritesSectionProps {
  favorites: CategorizedFavorites;
  onRemove: (category: FavTab, item: string) => void;
  onAddBookmaker: (name: string) => void;
  isDarkMode: boolean;
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  /** Quick-filter: clicking a chip applies it as the active filter */
  onQuickFilter?: (category: FavTab, item: string) => void;
  /** Which items are currently active as filters (to highlight them) */
  activeFilterItems?: string[];
  language: "tr" | "en";
  translations: {
    favorites: string;
    favTeams: string;
    favMatches: string;
    favLeagues: string;
    favSports: string;
    favBookmakers: string;
    noFavTeams: string;
    noFavMatches: string;
    noFavLeagues: string;
    noFavSports: string;
    noFavBookmakers: string;
    noFavTeamsDesc: string;
    noFavMatchesDesc: string;
    noFavLeaguesDesc: string;
    noFavSportsDesc: string;
    noFavBookmarkersDesc: string;
    remove: string;
    favLoginTitle: string;
    favLoginDesc: string;
    favLoginButton: string;
    favFeature1: string;
    favFeature2: string;
    favFeature3: string;
    noFavoritesDescription: string;
    searchBookmakerPlaceholder: string;
    noBookmakersFound: string;
    bookmakerFavorites: string;
    allRegions: string;
    visitSite: string;
    added: string;
  };
}

const ghostChips = [
  { w: "w-24", delay: 0 },
  { w: "w-32", delay: 0.05 },
  { w: "w-20", delay: 0.1 },
  { w: "w-28", delay: 0.15 },
  { w: "w-36", delay: 0.2 },
];

export function FavoritesSection({
  favorites,
  onRemove,
  onAddBookmaker,
  isDarkMode,
  isLoggedIn,
  onLoginClick,
  onQuickFilter,
  activeFilterItems = [],
  language,
  translations,
}: FavoritesSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-select first tab with items
  const tabOrder: FavTab[] = ["teams", "matches", "leagues", "sports", "bookmakers"];
  const firstWithItems =
    tabOrder.find((tab) => favorites[tab].length > 0) || "teams";
  const [activeTab, setActiveTab] = useState<FavTab>(firstWithItems);

  // Update active tab when favorites change (if current tab becomes empty)
  useEffect(() => {
    if (favorites[activeTab].length === 0 && activeTab !== "bookmakers") {
      const nextTab = tabOrder.find((tab) => favorites[tab].length > 0);
      if (nextTab) setActiveTab(nextTab);
    }
  }, [favorites, activeTab]);

  const tabConfig: {
    key: FavTab;
    label: string;
    count: number;
    icon: React.ReactNode;
    emptyIcon: React.ReactNode;
    emptyDesc: string;
  }[] = [
    {
      key: "teams",
      label: translations.favTeams,
      count: favorites.teams.length,
      icon: <Users className="w-3.5 h-3.5" />,
      emptyIcon: <Users className="w-6 h-6" />,
      emptyDesc: translations.noFavTeamsDesc,
    },
    {
      key: "matches",
      label: translations.favMatches,
      count: favorites.matches.length,
      icon: <TrophyIcon className="w-3.5 h-3.5" />,
      emptyIcon: <TrophyIcon className="w-6 h-6" />,
      emptyDesc: translations.noFavMatchesDesc,
    },
    {
      key: "leagues",
      label: translations.favLeagues,
      count: favorites.leagues.length,
      icon: <Medal className="w-3.5 h-3.5" />,
      emptyIcon: <Medal className="w-6 h-6" />,
      emptyDesc: translations.noFavLeaguesDesc,
    },
    {
      key: "sports",
      label: translations.favSports,
      count: favorites.sports.length,
      icon: <Dumbbell className="w-3.5 h-3.5" />,
      emptyIcon: <Dumbbell className="w-6 h-6" />,
      emptyDesc: translations.noFavSportsDesc,
    },
    {
      key: "bookmakers",
      label: translations.favBookmakers,
      count: favorites.bookmakers.length,
      icon: <Building2 className="w-3.5 h-3.5" />,
      emptyIcon: <Building2 className="w-6 h-6" />,
      emptyDesc: translations.noFavBookmarkersDesc,
    },
  ];

  const totalCount =
    favorites.teams.length +
    favorites.matches.length +
    favorites.leagues.length +
    favorites.sports.length +
    favorites.bookmakers.length;

  // ─── Anonymous ─────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div
        className={`mb-6 rounded-xl overflow-hidden ${
          isDarkMode
            ? "bg-[#141414] border border-[#2a2a2a]"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        <div
          className={`flex items-center gap-2.5 px-4 py-3 ${
            isDarkMode
              ? "border-b border-[#2a2a2a]"
              : "border-b border-gray-100"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${
              isDarkMode ? "text-gray-500" : "text-gray-400"
            }`}
          />
          <span
            className={`font-semibold text-sm ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {translations.favorites}
          </span>
        </div>

        <div className="relative">
          {/* Blurred ghost chips */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex gap-2 overflow-hidden">
              {[{ w: "w-24" }, { w: "w-32" }, { w: "w-20" }, { w: "w-28" }, { w: "w-36" }].map((chip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: [0.12, 0.22, 0.12], x: 0 }}
                  transition={{
                    opacity: { duration: 3, repeat: Infinity, delay: i * 0.05 },
                    x: { duration: 0.3, delay: i * 0.05 },
                  }}
                  className={`flex-shrink-0 h-7 rounded-md ${chip.w} ${
                    isDarkMode ? "bg-[#2a2a2a]" : "bg-gray-200"
                  }`}
                  style={{ filter: "blur(3px)" }}
                />
              ))}
            </div>
          </div>

          {/* CTA overlay */}
          <div
            className={`px-4 pb-3 pt-1 ${
              isDarkMode
                ? "bg-gradient-to-t from-[#141414] via-[#141414]/95 to-transparent"
                : "bg-gradient-to-t from-white via-white/95 to-transparent"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <p
                className={`flex-1 text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {translations.favLoginDesc}
              </p>
              <button
                onClick={onLoginClick}
                className={`flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-[#022179] hover:text-blue-700"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                {translations.favLoginButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── No favorites at all ──────────────────────────────────
  if (totalCount === 0) {
    return (
      <div
        className={`mb-6 rounded-xl overflow-hidden ${
          isDarkMode
            ? "bg-[#141414] border border-[#2a2a2a]"
            : "bg-white border border-gray-200 shadow-sm"
        }`}
      >
        {/* Show bookmakers tab even when empty */}
        <div
          className={`flex items-center gap-2.5 px-4 py-3 border-b ${
            isDarkMode ? "border-[#2a2a2a]" : "border-gray-100"
          }`}
        >
          <Bookmark
            className={`w-4 h-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
          />
          <span className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {translations.noFavoritesDescription}
          </span>
        </div>
        {/* Bookmaker search always visible */}
        <div className="px-4 py-3">
          <p className={`text-xs mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {translations.noFavBookmarkersDesc}
          </p>
          <BookmakerSearch
            favoriteBookmakers={favorites.bookmakers}
            onAdd={onAddBookmaker}
            onRemove={(name) => onRemove("bookmakers", name)}
            isDarkMode={isDarkMode}
            language={language}
            translations={{
              searchBookmakerPlaceholder: translations.searchBookmakerPlaceholder,
              noBookmakersFound: translations.noBookmakersFound,
              bookmakerFavorites: translations.bookmakerFavorites,
              allRegions: translations.allRegions,
              visitSite: translations.visitSite,
              added: translations.added,
            }}
          />
        </div>
      </div>
    );
  }

  // ─── Has favorites ─────────────────────────────────────────
  const activeItems = activeTab === "bookmakers" ? favorites.bookmakers : favorites[activeTab as Exclude<FavTab, "bookmakers">];
  const activeTabConfig = tabConfig.find((tab) => tab.key === activeTab)!;

  return (
    <div
      className={`mb-6 rounded-xl overflow-hidden transition-all ${
        isDarkMode
          ? "bg-[#141414] border border-[#2a2a2a]"
          : "bg-white border border-gray-200 shadow-sm"
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
          isDarkMode ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Bookmark
            className={`w-4 h-4 ${
              isDarkMode
                ? "text-blue-400 fill-blue-400"
                : "text-[#022179] fill-[#022179]"
            }`}
          />
          <span
            className={`font-semibold text-sm ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {translations.favorites}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
              isDarkMode
                ? "bg-blue-500/15 text-blue-400"
                : "bg-[#022179]/10 text-[#022179]"
            }`}
          >
            {totalCount}
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDown
            className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
          />
        ) : (
          <ChevronUp
            className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
          />
        )}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Tabs */}
            <div
              className={`px-4 py-2 flex gap-1 overflow-x-auto scrollbar-hide ${
                isDarkMode
                  ? "border-t border-[#1e1e1e]"
                  : "border-t border-gray-100"
              }`}
            >
              {tabConfig.map((tab) => {
                const isActive = activeTab === tab.key;
                const hasItems = tab.count > 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? isDarkMode
                          ? "bg-[#1e1e1e] text-white"
                          : "bg-gray-100 text-gray-900"
                        : isDarkMode
                        ? "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {hasItems && (
                      <span
                        className={`min-w-[16px] h-4 flex items-center justify-center rounded text-[10px] font-medium ${
                          isActive
                            ? isDarkMode
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-[#022179]/10 text-[#022179]"
                            : isDarkMode
                            ? "bg-[#222] text-gray-600"
                            : "bg-gray-200/60 text-gray-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div
              className={`px-4 pb-3 pt-2 ${
                isDarkMode
                  ? "border-t border-[#1e1e1e]"
                  : "border-t border-gray-100"
              }`}
            >
              <AnimatePresence mode="wait">
                {/* ── Bookmakers tab (special) ── */}
                {activeTab === "bookmakers" ? (
                  <motion.div
                    key="bookmakers"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <BookmakerSearch
                      favoriteBookmakers={favorites.bookmakers}
                      onAdd={onAddBookmaker}
                      onRemove={(name) => onRemove("bookmakers", name)}
                      isDarkMode={isDarkMode}
                      language={language}
                      translations={{
                        searchBookmakerPlaceholder: translations.searchBookmakerPlaceholder,
                        noBookmakersFound: translations.noBookmakersFound,
                        bookmakerFavorites: translations.bookmakerFavorites,
                        allRegions: translations.allRegions,
                        visitSite: translations.visitSite,
                        added: translations.added,
                      }}
                    />
                  </motion.div>
                ) : activeItems.length === 0 ? (
                  <motion.div
                    key={`empty-${activeTab}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="py-4 flex flex-col items-center gap-1.5"
                  >
                    <span className={isDarkMode ? "text-gray-700" : "text-gray-200"}>
                      {activeTabConfig.emptyIcon}
                    </span>
                    <p className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                      {activeTabConfig.emptyDesc}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`items-${activeTab}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {activeItems.map((item, i) => {
                        const isActiveFilter = activeFilterItems.includes(item);
                        return (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.02 }}
                            layout
                            onClick={() => onQuickFilter?.(activeTab, item)}
                            className={`group inline-flex items-center rounded-lg text-sm cursor-pointer transition-all select-none ${
                              isActiveFilter
                                ? "bg-[#022179] text-white shadow-sm"
                                : isDarkMode
                                ? "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/15 hover:border-blue-500/30"
                                : "bg-[#022179]/8 border border-[#022179]/15 text-[#022179] hover:bg-[#022179]/12 hover:border-[#022179]/25"
                            }`}
                          >
                            <span className="pl-2.5 pr-1.5 py-1.5 truncate max-w-[180px] font-medium">
                              {item}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove(activeTab, item);
                              }}
                              className={`p-1 pr-1.5 rounded-r-lg transition-all opacity-0 group-hover:opacity-100 ${
                                isActiveFilter
                                  ? "text-white/40 hover:text-red-300"
                                  : isDarkMode
                                  ? "text-blue-400/30 hover:text-red-400"
                                  : "text-[#022179]/25 hover:text-red-500"
                              }`}
                              title={translations.remove}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}