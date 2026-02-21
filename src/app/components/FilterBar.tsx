import type { SportOption, LeagueOption } from "../types";

interface FilterBarProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  /** Dynamic sports from API/data source */
  sports: SportOption[];
  /** Dynamic leagues from API/data source (filtered by sport) */
  leagues: LeagueOption[];
  isDarkMode?: boolean;
  isLoggedIn?: boolean;
  favoriteSports?: string[];
  favoriteLeagues?: string[];
  onToggleSportFavorite?: (sport: string) => void;
  onToggleLeagueFavorite?: (league: string) => void;
  translations: {
    allSports: string;
    allLeagues: string;
    addSportToFav?: string;
    removeSportFromFav?: string;
    addLeagueToFav?: string;
    removeLeagueFromFav?: string;
    // Legacy per-sport translations (fallback for mock data)
    football?: string;
    basketball?: string;
    tennis?: string;
    volleyball?: string;
  };
}

// Localized sport name mapping (for mock data that uses Turkish keys)
const SPORT_LOCALE_MAP: Record<string, Record<string, string>> = {
  Futbol: { tr: "Futbol", en: "Football" },
  Basketbol: { tr: "Basketbol", en: "Basketball" },
  Tenis: { tr: "Tenis", en: "Tennis" },
  Voleybol: { tr: "Voleybol", en: "Volleyball" },
};

export function FilterBar({
  selectedSport,
  onSportChange,
  selectedLeague,
  onLeagueChange,
  sports,
  leagues,
  isDarkMode = false,
  isLoggedIn = false,
  favoriteSports = [],
  favoriteLeagues = [],
  onToggleSportFavorite,
  onToggleLeagueFavorite,
  translations,
}: FilterBarProps) {
  // Build sport options: "All" + dynamic list from data
  const sportOptions = [
    { key: "Tümü", label: translations.allSports, isAll: true },
    ...sports.map((s) => ({
      key: s.key,
      label: s.label,
      isAll: false,
    })),
  ];

  // Build league options from data
  const leagueOptions = leagues.map((l) => ({
    key: l.key,
    label: l.label,
  }));

  // Button classes — two independent visual layers:
  //   Selection  → #022179 bg (header color), strong active state
  //   Favorite   → blue text only, subtle persistent indicator
  const getBtnClass = (isSelected: boolean, isFav: boolean) => {
    if (isSelected) {
      // Selected always gets brand bg; if also favorited show a soft glow ring
      return [
        "bg-[#022179] text-white shadow-sm",
        isFav
          ? isDarkMode
            ? "ring-1 ring-blue-400/40"
            : "ring-1 ring-blue-300/50"
          : "",
      ].join(" ");
    }

    // Not selected — bg stays neutral, text turns blue when favorited
    const bg = isDarkMode
      ? "bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] hover:border-[#333]"
      : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300";

    const text = isFav
      ? isDarkMode
        ? "text-blue-400"
        : "text-[#022179]"
      : isDarkMode
      ? "text-gray-300"
      : "text-gray-600";

    return `${bg} ${text}`;
  };

  return (
    <div className="w-full space-y-4">
      {/* Sport Filter */}
      <div>
        <label
          className={`block text-xs font-medium uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {translations.allSports === "All" ? "Sport Type" : "Spor Türü"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {sportOptions.map((sport) => {
            const isFav = favoriteSports.includes(sport.key);
            const isSelected = selectedSport === sport.key;
            const canFav = isLoggedIn && !sport.isAll && onToggleSportFavorite;

            return (
              <button
                key={sport.key}
                onClick={() => onSportChange(sport.key)}
                onDoubleClick={() => {
                  if (canFav) onToggleSportFavorite(sport.key);
                }}
                className={`relative flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium transition-all select-none ${getBtnClass(
                  isSelected,
                  isFav
                )}`}
                title={
                  canFav
                    ? isFav
                      ? translations.removeSportFromFav
                      : translations.addSportToFav
                    : undefined
                }
              >
                {sport.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div
        className={`h-px ${isDarkMode ? "bg-[#1e1e1e]" : "bg-gray-100"}`}
      />

      {/* League Filter */}
      <div>
        <label
          className={`block text-xs font-medium uppercase tracking-wider mb-2 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {translations.allSports === "All" ? "League" : "Lig"}
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onLeagueChange("Tümü")}
            className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-all select-none ${getBtnClass(
              selectedLeague === "Tümü",
              false
            )}`}
          >
            {translations.allLeagues}
          </button>

          {leagueOptions.map((league) => {
            const isFav = favoriteLeagues.includes(league.key);
            const isSelected = selectedLeague === league.key;
            const canFav = isLoggedIn && onToggleLeagueFavorite;

            return (
              <button
                key={league.key}
                onClick={() => onLeagueChange(league.key)}
                onDoubleClick={() => {
                  if (canFav) onToggleLeagueFavorite(league.key);
                }}
                className={`relative flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium transition-all select-none ${getBtnClass(
                  isSelected,
                  isFav
                )}`}
                title={
                  canFav
                    ? isFav
                      ? translations.removeLeagueFromFav
                      : translations.addLeagueToFav
                    : undefined
                }
              >
                {league.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
