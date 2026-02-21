import type {
  ApiOddsResponse,
  ApiEvent,
  ApiOddsEntry,
  BettingOdds,
  SportOption,
  LeagueOption,
} from "../types";
import { mockBettingData } from "../mockData";

// ─── Configuration ────────────────────────────────────────────
// Replace with your actual API base URL and key.
// In production, these should come from environment variables.
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_ODDS_API_URL || "",
  apiKey: import.meta.env.VITE_ODDS_API_KEY || "",
  // Polling interval in ms (default 30s for live, 120s for upcoming)
  pollIntervalLive: Number(import.meta.env.VITE_POLL_INTERVAL_LIVE) || 30_000,
  pollIntervalDefault: Number(import.meta.env.VITE_POLL_INTERVAL) || 120_000,
};

// ─── API Fetcher ──────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(endpoint, API_CONFIG.baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(API_CONFIG.apiKey ? { "X-API-Key": API_CONFIG.apiKey } : {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Transformer: API → Internal Types ────────────────────────
function findOutcome(outcomes: ApiOddsEntry["outcomes"], label: string): number {
  return outcomes.find((o) => o.label === label)?.value ?? 0;
}

function computeBestOdds(entries: BettingOdds[]): BettingOdds[] {
  if (entries.length === 0) return entries;

  // Best = highest average of home + away (+ draw if applicable)
  let bestId = entries[0].id;
  let bestScore = -Infinity;

  for (const entry of entries) {
    const score =
      entry.odds.home +
      entry.odds.away +
      (entry.odds.draw > 0 ? entry.odds.draw : 0);
    if (score > bestScore) {
      bestScore = score;
      bestId = entry.id;
    }
  }

  return entries.map((e) => ({
    ...e,
    isBest: e.id === bestId,
  }));
}

function transformApiResponse(data: ApiOddsResponse): {
  odds: BettingOdds[];
  sports: SportOption[];
  leagues: LeagueOption[];
} {
  const eventMap = new Map<string, ApiEvent>();
  data.events.forEach((e) => eventMap.set(e.id, e));

  // Transform odds entries
  const rawOdds: BettingOdds[] = data.odds
    .filter((o) => eventMap.has(o.eventId))
    .map((o) => {
      const event = eventMap.get(o.eventId)!;
      return {
        id: o.id,
        eventId: o.eventId,
        company: o.bookmaker.name,
        companyLogo: o.bookmaker.logo,
        affiliateUrl: o.bookmaker.affiliateUrl,
        match: `${event.homeTeam} - ${event.awayTeam}`,
        league: event.league.name,
        leagueId: event.league.id,
        sport: event.sport.name,
        sportId: event.sport.id,
        odds: {
          home: findOutcome(o.outcomes, "home"),
          draw: findOutcome(o.outcomes, "draw"),
          away: findOutcome(o.outcomes, "away"),
        },
        isBest: false, // will be computed below
        isSponsored: o.bookmaker.isSponsored,
        updatedAt: o.updatedAt,
        eventStatus: event.status,
        eventStartTime: event.startTime,
      };
    });

  // Group by event, compute best per group, flatten
  const grouped = new Map<string, BettingOdds[]>();
  rawOdds.forEach((o) => {
    const list = grouped.get(o.eventId) || [];
    list.push(o);
    grouped.set(o.eventId, list);
  });

  const odds = Array.from(grouped.values()).flatMap(computeBestOdds);

  // Sports & Leagues
  const sports: SportOption[] = data.sports.map((s) => ({
    id: s.id,
    key: s.name,
    label: s.name,
    slug: s.slug,
  }));

  const leagues: LeagueOption[] = data.leagues.map((l) => ({
    id: l.id,
    key: l.name,
    label: l.name,
    sportId: l.sportId,
    slug: l.slug,
  }));

  return { odds, sports, leagues };
}

// ─── Mock Data Transformer ────────────────────────────────────
// Transforms existing mockData into the new internal format,
// so the app works identically without a live API.
function transformMockData(): {
  odds: BettingOdds[];
  sports: SportOption[];
  leagues: LeagueOption[];
} {
  const raw: BettingOdds[] = mockBettingData.map((m) => ({
    id: m.id,
    eventId: m.match.replace(/\s/g, "_").toLowerCase(),
    company: m.company,
    companyLogo: m.companyLogo,
    affiliateUrl: "", // Mock — no real URL
    match: m.match,
    league: m.league,
    leagueId: m.league.replace(/\s/g, "_").toLowerCase(),
    sport: m.sport,
    sportId: m.sport.toLowerCase(),
    odds: { ...m.odds },
    isBest: false,
    isSponsored: m.isSponsored ?? false,
    updatedAt: new Date().toISOString(),
    eventStatus: "upcoming" as const,
    eventStartTime: new Date(Date.now() + 3_600_000).toISOString(),
  }));

  // Group & compute best
  const grouped = new Map<string, BettingOdds[]>();
  raw.forEach((o) => {
    const list = grouped.get(o.eventId) || [];
    list.push(o);
    grouped.set(o.eventId, list);
  });
  const odds = Array.from(grouped.values()).flatMap(computeBestOdds);

  // Extract unique sports & leagues
  const sportSet = new Map<string, SportOption>();
  const leagueSet = new Map<string, LeagueOption>();

  odds.forEach((o) => {
    if (!sportSet.has(o.sportId)) {
      sportSet.set(o.sportId, {
        id: o.sportId,
        key: o.sport,
        label: o.sport,
        slug: o.sportId,
      });
    }
    if (!leagueSet.has(o.leagueId)) {
      leagueSet.set(o.leagueId, {
        id: o.leagueId,
        key: o.league,
        label: o.league,
        sportId: o.sportId,
        slug: o.leagueId,
      });
    }
  });

  return {
    odds,
    sports: Array.from(sportSet.values()),
    leagues: Array.from(leagueSet.values()),
  };
}

// ─── Public API ───────────────────────────────────────────────

export interface OddsDataResult {
  odds: BettingOdds[];
  sports: SportOption[];
  leagues: LeagueOption[];
}

/**
 * Fetches odds data from the API.
 * Falls back to mock data if no API URL is configured.
 */
export async function fetchOddsData(params?: {
  sportId?: string;
  leagueId?: string;
}): Promise<OddsDataResult> {
  // If no API URL configured, use mock data
  if (!API_CONFIG.baseUrl) {
    // Simulate network delay for realistic UX testing
    await new Promise((r) => setTimeout(r, 600));
    return transformMockData();
  }

  const queryParams: Record<string, string> = {};
  if (params?.sportId) queryParams.sport = params.sportId;
  if (params?.leagueId) queryParams.league = params.leagueId;

  const data = await apiFetch<ApiOddsResponse>("/odds", queryParams);
  return transformApiResponse(data);
}

/**
 * Returns the appropriate polling interval based on whether
 * any live events exist in the current dataset.
 */
export function getPollingInterval(odds: BettingOdds[]): number {
  const hasLive = odds.some((o) => o.eventStatus === "live");
  return hasLive ? API_CONFIG.pollIntervalLive : API_CONFIG.pollIntervalDefault;
}
