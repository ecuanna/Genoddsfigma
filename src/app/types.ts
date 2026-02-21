// ─── API Response Types ──────────────────────────────────────
// These types represent what the odds API is expected to return.
// Adjust field names to match your actual API contract.

export interface ApiSport {
  id: string;
  name: string;       // e.g. "Football", "Basketball"
  slug: string;       // e.g. "football", "basketball"
}

export interface ApiLeague {
  id: string;
  name: string;       // e.g. "Süper Lig", "La Liga"
  slug: string;
  sportId: string;
}

export interface ApiBookmaker {
  id: string;
  name: string;       // e.g. "Bets10", "Nesine"
  logo: string;       // URL to bookmaker logo
  affiliateUrl: string;   // Base affiliate/redirect URL
  isSponsored: boolean;
}

export interface ApiOddsOutcome {
  label: string;      // "home" | "draw" | "away" | "over" | "under" etc.
  value: number;      // e.g. 2.45
}

export interface ApiOddsEntry {
  id: string;
  eventId: string;
  bookmaker: ApiBookmaker;
  market: string;     // "1X2" | "moneyline" | "over_under" etc.
  outcomes: ApiOddsOutcome[];
  updatedAt: string;  // ISO 8601
}

export interface ApiEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: ApiSport;
  league: ApiLeague;
  startTime: string;  // ISO 8601
  status: "upcoming" | "live" | "finished";
}

export interface ApiOddsResponse {
  events: ApiEvent[];
  odds: ApiOddsEntry[];
  sports: ApiSport[];
  leagues: ApiLeague[];
  updatedAt: string;
}

// ─── Internal / Display Types ────────────────────────────────
// These are used by UI components after API data is transformed.

export interface BettingOdds {
  id: string;
  eventId: string;
  company: string;
  companyLogo: string;
  affiliateUrl: string;
  match: string;        // "Team A - Team B"
  league: string;
  leagueId: string;
  sport: string;
  sportId: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  isBest: boolean;      // Computed client-side
  isSponsored: boolean;
  updatedAt: string;    // ISO 8601
  eventStatus: "upcoming" | "live" | "finished";
  eventStartTime: string; // ISO 8601
}

export interface SportOption {
  id: string;
  key: string;          // Used for filtering
  label: string;        // Display name (localized)
  slug: string;
}

export interface LeagueOption {
  id: string;
  key: string;
  label: string;
  sportId: string;
  slug: string;
}
