import type { SportOption, LeagueOption } from "../types";

interface FilterBarProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
  selectedLeague: string;
  onLeagueChange: (league: string) => void;
  sports: SportOption[];
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
    sportFootball?: string;
    sportBasketball?: string;
    sportTennis?: string;
    sportVolleyball?: string;
    leagueSuperLig?: string;
    leagueLaLiga?: string;
    leagueNBA?: string;
    leagueWimbledon?: string;
    leagueSultanlarLigi?: string;
  };
}

const SPORT_TRANSLATION_MAP: Record<string, string> = {
  Futbol: "sportFootball",
  Basketbol: "sportBasketball",
  Tenis: "sportTennis",
  Voleybol: "sportVolleyball",
};

const LEAGUE_TRANSLATION_MAP: Record<string, string> = {
  "Süper Lig": "leagueSuperLig",
  "La Liga": "leagueLaLiga",
  NBA: "leagueNBA",
  Wimbledon: "leagueWimbledon",
  "Sultanlar Ligi": "leagueSultanlarLigi",
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
  const localizeSport = (sport: SportOption): string => {
    const translationKey = SPORT_TRANSLATION_MAP[sport.key] as keyof typeof translations | undefined;
    if (translationKey && translations[translationKey]) {
      return translations[translationKey] as string;
    }
    return sport.label;
  };

  const localizeLeague = (league: LeagueOption): string => {
    const translationKey = LEAGUE_TRANSLATION_MAP[league.key] as keyof typeof translations | undefined;
    if (translationKey && translations[translationKey]) {
      return translations[translationKey] as string;
    }
    return league.label;
  };

  const sportOptions = sports.map((s) => ({
    key: s.key,
    label: localizeSport(s),
  }));

  const leagueOptions = leagues.map((l) => ({
    key: l.key,
    label: localizeLeague(l),
  }));

  const getBtnClass = (isSelected: boolean, isFav: boolean) => {
    if (isSelected) {
      return [
        "bg-[#022179] text-white shadow-sm",
        isFav
          ? isDarkMode
            ? "ring-1 ring-blue-400/40"
            : "ring-1 ring-blue-300/50"
          : "",
      ].join(" ");
    }

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
            const canFav = isLoggedIn && onToggleSportFavorite;

            return (
              <button
                key={sport.key}
                onClick={() => onSportChange(sport.key)}
                onDoubleClick={() => {
                  if (canFav) onToggleSportFavorite(sport.key);
                }}
                className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-all select-none ${getBtnClass(
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
      <div className={`h-px ${isDarkMode ? "bg-[#1e1e1e]" : "bg-gray-100"}`} />

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
                className={`h-9 px-3.5 rounded-lg text-sm font-medium transition-all select-none ${getBtnClass(
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
