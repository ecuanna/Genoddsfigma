import type { LeagueOption, SportOption } from "../types";

export const CURATED_SPORTS: SportOption[] = [
  { id: "Soccer", key: "Soccer", label: "Soccer", slug: "soccer" },
  { id: "Basketball", key: "Basketball", label: "Basketball", slug: "basketball" },
  { id: "Tennis", key: "Tennis", label: "Tennis", slug: "tennis" },
  { id: "Ice Hockey", key: "Ice Hockey", label: "Ice Hockey", slug: "ice-hockey" },
  { id: "Baseball", key: "Baseball", label: "Baseball", slug: "baseball" },
];

// This allowlist is deliberately small. Every selection maps to exactly one
// The Odds API sport request; there is no "fetch every sport" option.
export const CURATED_LEAGUES: LeagueOption[] = [
  { id: "soccer_epl", key: "English Premier League", label: "English Premier League", sportId: "Soccer", slug: "soccer_epl" },
  { id: "soccer_uefa_champs_league", key: "UEFA Champions League", label: "UEFA Champions League", sportId: "Soccer", slug: "soccer_uefa_champs_league" },
  { id: "soccer_uefa_europa_league", key: "UEFA Europa League", label: "UEFA Europa League", sportId: "Soccer", slug: "soccer_uefa_europa_league" },
  { id: "basketball_nba", key: "NBA", label: "NBA", sportId: "Basketball", slug: "basketball_nba" },
  { id: "basketball_euroleague", key: "Basketball Euroleague", label: "Basketball Euroleague", sportId: "Basketball", slug: "basketball_euroleague" },
  { id: "tennis_atp_paris_masters", key: "ATP Paris Masters", label: "ATP Paris Masters", sportId: "Tennis", slug: "tennis_atp_paris_masters" },
  { id: "icehockey_nhl", key: "NHL", label: "NHL", sportId: "Ice Hockey", slug: "icehockey_nhl" },
  { id: "baseball_mlb", key: "MLB", label: "MLB", sportId: "Baseball", slug: "baseball_mlb" },
];

export const DEFAULT_LEAGUE = CURATED_LEAGUES[0];

export const getLeagueByLabel = (label: string) =>
  CURATED_LEAGUES.find((league) => league.key === label) ?? DEFAULT_LEAGUE;

export const getDefaultLeagueForSport = (sportId: string) =>
  CURATED_LEAGUES.find((league) => league.sportId === sportId) ?? DEFAULT_LEAGUE;
