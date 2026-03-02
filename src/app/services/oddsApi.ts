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
// Set these in your .env file. When VITE_ODDS_API_URL is empty,
// the app automatically falls back to mock data.
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_ODDS_API_URL || "",
  apiKey: import.meta.env.VITE_ODDS_API_KEY || "",
  pollIntervalLive: Number(import.meta.env.VITE_POLL_INTERVAL_LIVE) || 30_000,
  pollIntervalDefault: Number(import.meta.env.VITE_POLL_INTERVAL) || 120_000,
};

// ─── API Fetcher ──────────────────────────────────────────────
async function apiFetch<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
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
    throw new ApiError(
      res.status,
      `API error: ${res.status} ${res.statusText}`
    );
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
function findOutcome(
  outcomes: ApiOddsEntry["outcomes"],
  label: string
): number {
  return outcomes.find((o) => o.label === label)?.value ?? 0;
}

/**
 * Picks the bookmaker with the highest combined odds as "best"
 * within each match/event group.
 */
function computeBestOdds(entries: BettingOdds[]): BettingOdds[] {
  if (entries.length === 0) return entries;

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

/**
 * Transforms the raw API response into internal display types.
 * This is where you adapt to your specific API's schema.
 */
function transformApiResponse(data: ApiOddsResponse): OddsDataResult {
  const eventMap = new Map<string, ApiEvent>();
  data.events.forEach((e) => eventMap.set(e.id, e));

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
        isBest: false,
        isSponsored: o.bookmaker.isSponsored,
        updatedAt: o.updatedAt,
        eventStatus: event.status,
        eventStartTime: event.startTime,
      };
    });

  // Group by event → compute best per group → flatten
  const grouped = new Map<string, BettingOdds[]>();
  rawOdds.forEach((o) => {
    const list = grouped.get(o.eventId) || [];
    list.push(o);
    grouped.set(o.eventId, list);
  });
  const odds = Array.from(grouped.values()).flatMap(computeBestOdds);

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
function transformMockData(): OddsDataResult {
  const now = new Date();

  const raw: BettingOdds[] = mockBettingData.map((m) => ({
    id: m.id,
    eventId: m.match.replace(/\s/g, "_").toLowerCase(),
    company: m.company,
    companyLogo: m.companyLogo,
    affiliateUrl: "",
    match: m.match,
    league: m.league,
    leagueId: m.league.replace(/\s/g, "_").toLowerCase(),
    sport: m.sport,
    sportId: m.sport.toLowerCase(),
    odds: { ...m.odds },
    isBest: false, // computed below
    isSponsored: m.isSponsored ?? false,
    updatedAt: new Date(
      now.getTime() - Math.floor(Math.random() * 600_000)
    ).toISOString(),
    eventStatus: m.eventStatus ?? ("upcoming" as const),
    eventStartTime: new Date(
      now.getTime() + 3_600_000
    ).toISOString(),
  }));

  // Group → compute best → flatten
  const grouped = new Map<string, BettingOdds[]>();
  raw.forEach((o) => {
    const list = grouped.get(o.eventId) || [];
    list.push(o);
    grouped.set(o.eventId, list);
  });
  const odds = Array.from(grouped.values()).flatMap(computeBestOdds);

  // Extract unique sports & leagues dynamically
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
 * Falls back to mock data if VITE_ODDS_API_URL is not set.
 */
export async function fetchOddsData(params?: {
  sportId?: string;
  leagueId?: string;
}): Promise<OddsDataResult> {
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
 * Returns the appropriate polling interval:
 * - 30s if any live events exist (or VITE_POLL_INTERVAL_LIVE)
 * - 120s otherwise (or VITE_POLL_INTERVAL)
 */
export function getPollingInterval(odds: BettingOdds[]): number {
  const hasLive = odds.some((o) => o.eventStatus === "live");
  return hasLive
    ? API_CONFIG.pollIntervalLive
    : API_CONFIG.pollIntervalDefault;
}
