import { useState, useMemo, useEffect } from "react";
import { LogIn, Moon, Sun, Bookmark, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { SponsoredBanner } from "./components/SponsoredBanner";
import { OddsCard } from "./components/OddsCard";
import { AuthModal } from "./components/AuthModal";
import { UserMenu } from "./components/UserMenu";
import { FavoritesModal } from "./components/FavoritesModal";
import {
  FavoritesSection,
  CategorizedFavorites,
} from "./components/FavoritesSection";
import { ProfileModal } from "./components/ProfileModal";
import { SettingsModal } from "./components/SettingsModal";
import { useOddsData } from "./hooks/useOddsData";
import type { BettingOdds } from "./types";
import { Language, useTranslation } from "./translations";
import logo from "figma:asset/7359bb17b46466e7c2e65f3010eb199c2e735ad8.png";

interface User {
  name: string;
  email: string;
}

const defaultFavorites: CategorizedFavorites = {
  teams: [],
  matches: [],
  leagues: [],
  sports: [],
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tümü");
  const [selectedLeague, setSelectedLeague] = useState("Tümü");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<"personal" | "responsible">("personal");
  const [favorites, setFavorites] =
    useState<CategorizedFavorites>(defaultFavorites);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>("tr");
  const [savedOddsIds, setSavedOddsIds] = useState<string[]>([]);

  const t = useTranslation(language);

  // ─── Odds Data Hook ─────────────────────────────────────────
  const {
    odds: allOdds,
    sports: apiSports,
    leagues: apiLeagues,
    isLoading,
    isInitialLoading,
    error,
    isMockData,
    lastUpdated,
    refetch,
  } = useOddsData();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedFavorites = localStorage.getItem("categorizedFavorites");
    const savedTheme = localStorage.getItem("theme");
    const savedLanguage = localStorage.getItem("language");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedTheme) setIsDarkMode(savedTheme === "dark");
    if (savedLanguage) setLanguage(savedLanguage as Language);
    const savedOdds = localStorage.getItem("savedOddsIds");
    if (savedOdds) setSavedOddsIds(JSON.parse(savedOdds));
  }, []);

  useEffect(() => {
    if (user)
      localStorage.setItem(
        "categorizedFavorites",
        JSON.stringify(favorites)
      );
  }, [favorites, user]);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Reset league when sport changes if the league is no longer available
  useEffect(() => {
    if (selectedLeague !== "Tümü") {
      const sportFiltered = allOdds.filter(
        (item) => selectedSport === "Tümü" || item.sport === selectedSport
      );
      const available = new Set(sportFiltered.map((item) => item.league));
      if (!available.has(selectedLeague)) setSelectedLeague("Tümü");
    }
  }, [selectedSport, selectedLeague, allOdds]);

  const handleLogin = (email: string, _password: string) => {
    const newUser = { name: email.split("@")[0], email };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const handleRegister = (
    email: string,
    _password: string,
    name: string
  ) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites(defaultFavorites);
    setSavedOddsIds([]);
    localStorage.removeItem("user");
    localStorage.removeItem("categorizedFavorites");
    localStorage.removeItem("savedOddsIds");
  };

  const toggleFavorite = (
    category: keyof CategorizedFavorites,
    item: string
  ) => {
    if (!user) {
      toast(t.toastLoginRequired, {
        duration: 2500,
        action: {
          label: t.login,
          onClick: () => setIsAuthModalOpen(true),
        },
      });
      return;
    }
    const isRemoving = favorites[category].includes(item);
    setFavorites((prev) => ({
      ...prev,
      [category]: isRemoving
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item],
    }));
    toast(
      `${item} ${isRemoving ? t.toastRemovedFromFav : t.toastAddedToFav}`,
      { duration: 1800 }
    );
  };

  const removeFavorite = (
    category: keyof CategorizedFavorites,
    item: string
  ) => {
    setFavorites((prev) => ({
      ...prev,
      [category]: prev[category].filter((i) => i !== item),
    }));
    toast(`${item} ${t.toastRemovedFromFav}`, { duration: 1800 });
  };

  const toggleSavedOdds = (oddId: string, company: string, match: string) => {
    if (!user) {
      toast(t.toastLoginRequired, {
        duration: 2500,
        action: {
          label: t.login,
          onClick: () => setIsAuthModalOpen(true),
        },
      });
      return;
    }
    const isRemoving = savedOddsIds.includes(oddId);
    const next = isRemoving
      ? savedOddsIds.filter((id) => id !== oddId)
      : [...savedOddsIds, oddId];
    setSavedOddsIds(next);
    localStorage.setItem("savedOddsIds", JSON.stringify(next));
    toast(
      `${company} — ${match} ${isRemoving ? t.oddsRemovedFromFav : t.oddsAddedToFav}`,
      { duration: 1800 }
    );
  };

  // Quick filter from FavoritesSection
  const handleQuickFilter = (
    category: keyof CategorizedFavorites,
    item: string
  ) => {
    if (category === "sports") {
      setSelectedSport(item);
      setSelectedLeague("Tümü");
      setSearchQuery("");
    } else if (category === "leagues") {
      // Find the sport for this league to also set the sport filter
      const leagueMatch = allOdds.find((d) => d.league === item);
      if (leagueMatch) setSelectedSport(leagueMatch.sport);
      setSelectedLeague(item);
      setSearchQuery("");
    } else if (category === "teams" || category === "matches") {
      setSelectedSport("Tümü");
      setSelectedLeague("Tümü");
      setSearchQuery(item);
    }
    toast(
      `${category === "sports" ? "🏅" : category === "leagues" ? "🏆" : "🔍"} ${item}`,
      { duration: 1200 }
    );
  };

  // Compute which favorite items are currently active as filters
  const activeFilterItems = useMemo(() => {
    const items: string[] = [];
    if (selectedSport !== "Tümü") items.push(selectedSport);
    if (selectedLeague !== "Tümü") items.push(selectedLeague);
    if (searchQuery) {
      // Check if search matches any favorited team or match exactly
      [...favorites.teams, ...favorites.matches].forEach((f) => {
        if (searchQuery.toLowerCase() === f.toLowerCase()) items.push(f);
      });
    }
    return items;
  }, [selectedSport, selectedLeague, searchQuery, favorites.teams, favorites.matches]);

  const totalFavoritesCount =
    favorites.teams.length +
    favorites.matches.length +
    favorites.leagues.length +
    favorites.sports.length;

  // ─── Dynamic Leagues (filtered by selected sport) ────────────
  const availableLeagues = useMemo(() => {
    if (selectedSport === "Tümü") return apiLeagues;
    return apiLeagues.filter((l) => {
      // Match by sportId or by sport key (for mock data compat)
      return (
        l.sportId === selectedSport.toLowerCase() ||
        allOdds.some(
          (o) => o.sport === selectedSport && o.league === l.key
        )
      );
    });
  }, [selectedSport, apiLeagues, allOdds]);

  // ─── Filter & Group Odds ─────────────────────────────────────
  const filteredAndGroupedOdds = useMemo(() => {
    let filtered = allOdds;
    if (selectedSport !== "Tümü")
      filtered = filtered.filter((item) => item.sport === selectedSport);
    if (selectedLeague !== "Tümü")
      filtered = filtered.filter((item) => item.league === selectedLeague);
    if (searchQuery)
      filtered = filtered.filter((item) =>
        item.match.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const grouped = filtered.reduce(
      (acc, item) => {
        if (!acc[item.match]) acc[item.match] = [];
        acc[item.match].push(item);
        return acc;
      },
      {} as Record<string, BettingOdds[]>
    );

    Object.keys(grouped).forEach((match) => {
      grouped[match].sort((a, b) => {
        if (a.isBest) return -1;
        if (b.isBest) return 1;
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;
        return 0;
      });
    });
    return grouped;
  }, [searchQuery, selectedSport, selectedLeague, allOdds]);

  const getTeams = (match: string) =>
    match.split(" - ").map((t) => t.trim());

  // Format last updated timestamp
  const formatLastUpdated = () => {
    if (!lastUpdated) return "";
    const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60_000);
    if (mins < 1) return t.justNow;
    if (mins < 60) return `${mins} ${t.minutesAgo}`;
    return `${Math.floor(mins / 60)} ${t.hoursAgo}`;
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-50"}`}
    >
      <Toaster
        theme={isDarkMode ? "dark" : "light"}
        position="bottom-center"
        toastOptions={{
          style: { borderRadius: "10px", fontSize: "13px" },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#022179] text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img src={logo} alt="Logo" className="h-10" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle language"
              >
                <span className="text-sm font-semibold">
                  {language.toUpperCase()}
                </span>
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              {user ? (
                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  onOpenFavorites={() => setIsFavoritesModalOpen(true)}
                  onOpenSettings={() => setIsSettingsModalOpen(true)}
                  onOpenProfile={() => {
                    setProfileModalTab("personal");
                    setIsProfileModalOpen(true);
                  }}
                  favoritesCount={totalFavoritesCount}
                  isDarkMode={isDarkMode}
                  translations={t}
                />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="hidden md:inline">{t.login}</span>
                </button>
              )}
            </div>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.searchPlaceholder}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <SponsoredBanner
            title={t.bannerTitle}
            description={t.bannerDescription}
            buttonText={t.registerButton}
            isDarkMode={isDarkMode}
          />
        </div>

        <FavoritesSection
          favorites={favorites}
          onRemove={removeFavorite}
          isDarkMode={isDarkMode}
          isLoggedIn={!!user}
          onLoginClick={() => setIsAuthModalOpen(true)}
          translations={t}
          onQuickFilter={handleQuickFilter}
          activeFilterItems={activeFilterItems}
        />

        <div
          className={`${isDarkMode ? "bg-[#141414]" : "bg-white"} rounded-lg shadow-lg overflow-hidden`}
        >
          {/* Filter Section */}
          <div
            className={`${isDarkMode ? "bg-[#141414] border-[#2a2a2a]" : "bg-gray-50 border-gray-200"} border-b p-4`}
          >
            <FilterBar
              selectedSport={selectedSport}
              onSportChange={setSelectedSport}
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              sports={apiSports}
              leagues={availableLeagues}
              isDarkMode={isDarkMode}
              isLoggedIn={!!user}
              favoriteSports={favorites.sports}
              favoriteLeagues={favorites.leagues}
              onToggleSportFavorite={(sport) =>
                toggleFavorite("sports", sport)
              }
              onToggleLeagueFavorite={(league) =>
                toggleFavorite("leagues", league)
              }
              translations={t}
            />

            {/* Data status bar */}
            <div className={`flex items-center justify-between mt-3 pt-3 border-t ${
              isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
            }`}>
              <div className="flex items-center gap-2">
                {isLoading && !isInitialLoading && (
                  <Loader2 className={`w-3.5 h-3.5 animate-spin ${
                    isDarkMode ? "text-blue-400" : "text-[#022179]"
                  }`} />
                )}
                {lastUpdated && (
                  <span className={`text-xs ${
                    isDarkMode ? "text-gray-600" : "text-gray-400"
                  }`}>
                    {t.lastUpdated}: {formatLastUpdated()}
                  </span>
                )}
                {isMockData && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isDarkMode ? "bg-yellow-500/10 text-yellow-500/60" : "bg-yellow-100 text-yellow-600/60"
                  }`}>
                    DEMO
                  </span>
                )}
              </div>
              <button
                onClick={refetch}
                disabled={isLoading}
                className={`p-1.5 rounded-md transition-all ${
                  isDarkMode
                    ? "text-gray-600 hover:text-gray-400 hover:bg-[#1e1e1e]"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                } disabled:opacity-30`}
                title={t.retry}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Odds List */}
          <div className="p-4 md:p-6">
            {/* Initial Loading State */}
            {isInitialLoading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <Loader2 className={`w-8 h-8 animate-spin ${
                  isDarkMode ? "text-blue-400" : "text-[#022179]"
                }`} />
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t.loadingOdds}
                </p>
              </div>
            ) : error && allOdds.length === 0 ? (
              /* Error State (only if no cached data) */
              <div className="py-12 flex flex-col items-center gap-3">
                <AlertTriangle className={`w-8 h-8 ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`} />
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {t.errorLoadingOdds}
                </p>
                {error && (
                  <p className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
                    {error}
                  </p>
                )}
                <button
                  onClick={refetch}
                  className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      : "bg-[#022179] text-white hover:bg-[#022179]/90"
                  }`}
                >
                  {t.retry}
                </button>
              </div>
            ) : (
              /* Odds Data */
              <div className="space-y-8">
                {Object.keys(filteredAndGroupedOdds).length === 0 ? (
                  <div className="py-12 text-center">
                    <p
                      className={`${isDarkMode ? "text-gray-400" : "text-gray-500"} text-lg`}
                    >
                      {t.noResults}
                    </p>
                  </div>
                ) : (
                  Object.entries(filteredAndGroupedOdds).map(
                    ([match, odds]) => {
                      const teams = getTeams(match);
                      const isMatchFav =
                        favorites.matches.includes(match);
                      return (
                        <div key={match} className="space-y-3">
                          {/* ── Match Header ── */}
                          <div className="flex items-center gap-2 px-1">
                            {/* Bookmark — the ONE save action per match */}
                            <button
                              onClick={() =>
                                toggleFavorite("matches", match)
                              }
                              className={`p-1.5 rounded-md transition-all flex-shrink-0 ${
                                isMatchFav
                                  ? isDarkMode
                                    ? "text-blue-400"
                                    : "text-[#022179]"
                                  : isDarkMode
                                  ? "text-gray-700 hover:text-gray-400"
                                  : "text-gray-300 hover:text-gray-500"
                              }`}
                              title={
                                isMatchFav
                                  ? t.removeMatchFromFav
                                  : t.addMatchToFav
                              }
                            >
                              <AnimatePresence mode="wait">
                                <motion.span
                                  key={isMatchFav ? "saved" : "unsaved"}
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }}
                                >
                                  <Bookmark
                                    className={`w-5 h-5 ${
                                      isMatchFav
                                        ? isDarkMode
                                          ? "fill-blue-400 text-blue-400"
                                          : "fill-[#022179] text-[#022179]"
                                        : ""
                                    }`}
                                  />
                                </motion.span>
                              </AnimatePresence>
                            </button>

                            {/* Team names — double-click to favorite, text turns blue */}
                            <div className="flex items-center gap-0 flex-wrap">
                              {teams.map((team, idx) => {
                                const isTeamFav =
                                  favorites.teams.includes(team);
                                // Blue text if team OR its match is favorited
                                const isBlueName = isTeamFav || isMatchFav;
                                return (
                                  <span
                                    key={team}
                                    className="flex items-center"
                                  >
                                    <button
                                      onDoubleClick={() =>
                                        toggleFavorite("teams", team)
                                      }
                                      className={`group/team relative px-1.5 py-0.5 rounded transition-all select-none ${
                                        isBlueName
                                          ? isDarkMode
                                            ? "text-blue-400"
                                            : "text-[#022179]"
                                          : isDarkMode
                                          ? "text-white"
                                          : "text-gray-900"
                                      }`}
                                      title={
                                        isTeamFav
                                          ? t.removeTeamFromFav
                                          : t.addTeamToFav
                                      }
                                    >
                                      <span className="text-xl font-bold">
                                        {team}
                                      </span>
                                    </button>
                                    {idx < teams.length - 1 && (
                                      <span
                                        className={`mx-1 text-sm ${
                                          isDarkMode
                                            ? "text-gray-600"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        –
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Odds Cards */}
                          {odds.map((odd) => (
                            <OddsCard
                              key={odd.id}
                              odds={odd}
                              isDarkMode={isDarkMode}
                              isMatchSaved={savedOddsIds.includes(odd.id)}
                              onToggleMatchSave={() =>
                                toggleSavedOdds(odd.id, odd.company, match)
                              }
                              saveTitle={
                                savedOddsIds.includes(odd.id)
                                  ? t.removeOddsFromFav
                                  : t.addOddsToFav
                              }
                              translations={t}
                            />
                          ))}
                        </div>
                      );
                    }
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#022179] text-white mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2026 GENODDS. {t.allRightsReserved}
          </p>
          <p className="text-gray-500 text-xs mt-2">{t.ageWarning}</p>
        </div>

        {/* Legal Disclaimer */}
        <div className="mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-white/10">
          <p className="text-[11px] text-blue-200/40 leading-relaxed text-center">
            {t.footerDisclaimer1}{" "}
            {t.footerDisclaimer2}{" "}
            {t.footerDisclaimer3}{" "}
            {t.footerDisclaimer4}{" "}
            {t.footerDisclaimer5}
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isDarkMode={isDarkMode}
        translations={t}
      />
      {user && (
        <>
          <FavoritesModal
            isOpen={isFavoritesModalOpen}
            onClose={() => setIsFavoritesModalOpen(false)}
            favorites={favorites}
            onRemove={removeFavorite}
            isDarkMode={isDarkMode}
            translations={t}
          />
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem("user", JSON.stringify(updated));
            }}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            translations={t}
            initialTab={profileModalTab}
          />
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            isDarkMode={isDarkMode}
            translations={t}
            user={user}
            onLogout={handleLogout}
          />
        </>
      )}
    </div>
  );
}