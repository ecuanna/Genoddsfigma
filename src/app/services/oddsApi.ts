/**
 * The Odds API Integration
 * Docs: https://the-odds-api.com/lol-odds-api/
 *
 * Endpoints:
 *   GET /v4/sports/{sport_key}/odds  — odds for a sport (h2h markets)
 */

import type { BettingOdds, SportOption, LeagueOption } from "../types";

// ─── Configuration ────────────────────────────────────────────
const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

// API key is embedded directly so it works regardless of env setup
const API_KEY =
  import.meta.env.VITE_ODDS_API_KEY ||
  "9341c1e0914b8a3b6efe5a0d74764620";

const POLL_INTERVAL_LIVE    = Number(import.meta.env.VITE_POLL_INTERVAL_LIVE) || 30_000;
const POLL_INTERVAL_DEFAULT = Number(import.meta.env.VITE_POLL_INTERVAL)      || 120_000;

const CACHE_TTL_EVENTS = 2  * 60 * 1000;  // 2 min
const CACHE_TTL_SPORTS = 15 * 60 * 1000;  // 15 min

// ─── The Odds API Types ───────────────────────────────────────

interface TheOddsApiOutcome {
  name: string;
  price: number;
}

interface TheOddsApiMarket {
  key: string;
  last_update: string;
  outcomes: TheOddsApiOutcome[];
}

interface TheOddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: TheOddsApiMarket[];
}

interface TheOddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: TheOddsApiBookmaker[];
}

interface TheOddsApiSport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

// ─── Error Class ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── In-Memory Cache ─────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const eventsCache = new Map<string, CacheEntry<TheOddsApiEvent[]>>();
let sportsListCache: CacheEntry<TheOddsApiSport[]> | null = null;

function isFresh<T>(entry: CacheEntry<T> | null | undefined, ttl: number): boolean {
  return !!entry && Date.now() - entry.ts < ttl;
}

// ─── Sport Group Mapping ──────────────────────────────────────

function getSportGroup(sportKey: string): string {
  const prefix = sportKey.split("_")[0];
  const groupMap: Record<string, string> = {
    soccer:           "Soccer",
    basketball:       "Basketball",
    baseball:         "Baseball",
    icehockey:        "Ice Hockey",
    tennis:           "Tennis",
    americanfootball: "American Football",
    cricket:          "Cricket",
    golf:             "Golf",
    mma:              "MMA",
    boxing:           "Boxing",
    rugbyleague:      "Rugby League",
    aussierules:      "Aussie Rules",
    handball:         "Handball",
    lacrosse:         "Lacrosse",
    politics:         "Politics",
  };
  return groupMap[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

// ─── Bookmaker Domain Map ─────────────────────────────────────
// Used for both logos (Clearbit) and affiliate URLs.
// Every bookmaker key returned by the API must resolve to a working URL.

const BOOKMAKER_DOMAIN_MAP: Record<string, string> = {
  // UK / EU
  betway:            "betway.com",
  williamhill:       "williamhill.com",
  betfair_ex_uk:     "betfair.com",
  betfair_sb_uk:     "betfair.com",
  unibet_uk:         "unibet.com",
  unibet_eu:         "unibet.com",
  paddypower:        "paddypower.com",
  skybet:            "skybet.com",
  coral:             "coral.co.uk",
  ladbrokes_uk:      "ladbrokes.com",
  boylesports:       "boylesports.com",
  betvictor:         "betvictor.com",
  sport888:          "888sport.com",
  casumo:            "casumo.com",
  leovegas:          "leovegas.com",
  grosvenor:         "grosvenorcasinos.com",
  smarkets:          "smarkets.com",
  matchbook:         "matchbook.com",
  virginbet:         "virginbet.com",
  livescorebet:      "livescorebet.com",
  bet365:            "bet365.com",
  bwin:              "bwin.com",
  pinnacle:          "pinnacle.com",
  betsson:           "betsson.com",
  nordicbet:         "nordicbet.com",
  unibet_se:         "unibet.se",
  unibet_de:         "unibet.de",
  unibet_no:         "unibet.no",
  coolbet:           "coolbet.com",
  betclic:           "betclic.com",
  suprabets:         "suprabets.com",
  tipico_de:         "tipico.com",
  onexbet:           "1xbet.com",
  sport1x2:          "1x2sport.com",
  tonybet:           "tonybet.com",
  betano:            "betano.com",
  betpt:             "bet.pt",
  betclic_fr:        "betclic.fr",
  winamax_fr:        "winamax.fr",
  zebet:             "zebet.fr",
  pmu_fr:            "pmu.fr",
  pokerstars:        "pokerstars.com",
  betfair_ex_eu:     "betfair.com",
  marathonbet:       "marathonbet.com",
  betonvalley:       "betonvalley.com",
  sport888_de:       "888sport.de",
  neds:              "neds.com.au",
  tab:               "tab.com.au",
  sportsbet:         "sportsbet.com.au",
  pointsbet_au:      "pointsbet.com.au",
  betr_au:           "betr.com.au",
  ladbrokes_au:      "ladbrokes.com.au",
  unibet_au:         "unibet.com.au",
  // US
  draftkings:        "draftkings.com",
  fanduel:           "fanduel.com",
  mybookieag:        "mybookie.ag",
  betonlineag:       "betonline.ag",
  bovada_us:         "bovada.lv",
  superbook:         "superbook.com",
  pointsbetus:       "pointsbet.com",
  betus:             "betus.com",
  betmgm:            "betmgm.com",
  espnbet:           "espnbet.com",
  fliff:             "getfliff.com",
  williamhill_us:    "williamhill.com",
  caesars:           "caesars.com",
  betrivers:         "betrivers.com",
  unibet_us:         "unibet.us",
  barstool:          "barstoolsports.com",
  foxbet:            "foxbet.com",
  si_sportsbook:     "si.com",
  betway_us:         "betway.com",
  hardrock:          "hardrock.bet",
  fanatics:          "fanatics.com",
  wind_creek:        "windcreekcasino.com",
  ballybet:          "ballybet.com",
};

/** Logo URL for a bookmaker — Clearbit when domain is known, placeholder otherwise. */
function getBookmakerLogo(key: string, title: string): string {
  const domain = BOOKMAKER_DOMAIN_MAP[key];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }
  const palette = ["1e40af", "dc2626", "059669", "7c3aed", "D97706", "0891b2"];
  const colorIndex = Math.abs(key.charCodeAt(0) - 97) % palette.length;
  const initials = title.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "BET";
  return `https://placehold.co/80x80/${palette[colorIndex]}/ffffff?text=${initials}`;
}

/**
 * Returns the bookmaker's website URL.
 * Every key in BOOKMAKER_DOMAIN_MAP resolves to a real site.
 * For unknown keys we try to derive a domain from the title.
 */
function getBookmakerUrl(key: string, title: string): string {
  const domain = BOOKMAKER_DOMAIN_MAP[key];
  if (domain) return `https://www.${domain}`;

  // Fallback: derive from title (e.g. "DraftKings" → "draftkings.com")
  const derived = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
  if (derived.length > 2) return `https://www.${derived}.com`;

  return "";
}

// ─── API Fetcher ──────────────────────────────────────────────

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${ODDS_API_BASE}${path}`);
  url.searchParams.set("apiKey", API_KEY);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, `Odds API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// ─── Status Heuristic ────────────────────────────────────────

function determineEventStatus(commenceTime: string): "upcoming" | "live" | "finished" {
  const now = Date.now();
  const start = new Date(commenceTime).getTime();
  const elapsed = now - start;
  if (elapsed < 0) return "upcoming";
  if (elapsed < 4 * 60 * 60 * 1000) return "live";
  return "finished";
}

// ─── Sponsored Bookmakers ─────────────────────────────────────

const SPONSORED_BOOKMAKERS = new Set<string>([
  // Add partner bookmaker keys here to give them gold card treatment
  // e.g. "betway", "paddypower"
]);

// ─── Best Odds Calculator ─────────────────────────────────────

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
  return entries.map((e) => ({ ...e, isBest: e.id === bestId }));
}

// ─── Event Transformer ───────────────────────────────────────

function transformEvents(events: TheOddsApiEvent[]): BettingOdds[] {
  const rawEntries: BettingOdds[] = [];

  for (const event of events) {
    const sportGroup = getSportGroup(event.sport_key);
    const status = determineEventStatus(event.commence_time);

    // Drop events that finished more than 2h ago
    if (status === "finished") {
      const elapsed = Date.now() - new Date(event.commence_time).getTime();
      if (elapsed > 2 * 60 * 60 * 1000) continue;
    }

    for (const bookmaker of event.bookmakers) {
      const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");
      if (!h2hMarket) continue;

      const homeOutcome = h2hMarket.outcomes.find((o) => o.name === event.home_team);
      const awayOutcome = h2hMarket.outcomes.find((o) => o.name === event.away_team);
      const drawOutcome = h2hMarket.outcomes.find((o) => o.name === "Draw");

      if (!homeOutcome || !awayOutcome) continue;

      rawEntries.push({
        id: `${event.id}_${bookmaker.key}`,
        eventId: event.id,
        company: bookmaker.title,
        companyLogo: getBookmakerLogo(bookmaker.key, bookmaker.title),
        affiliateUrl: getBookmakerUrl(bookmaker.key, bookmaker.title),
        match: `${event.home_team} - ${event.away_team}`,
        league: event.sport_title,
        leagueId: event.sport_key,
        sport: sportGroup,
        sportId: sportGroup,
        odds: {
          home: homeOutcome.price,
          draw: drawOutcome?.price ?? 0,
          away: awayOutcome.price,
        },
        isBest: false,
        isSponsored: SPONSORED_BOOKMAKERS.has(bookmaker.key),
        updatedAt: bookmaker.last_update,
        eventStatus: status,
        eventStartTime: event.commence_time,
      });
    }
  }

  // Group by event → compute best per event → flatten
  const grouped = new Map<string, BettingOdds[]>();
  rawEntries.forEach((o) => {
    const list = grouped.get(o.eventId) || [];
    list.push(o);
    grouped.set(o.eventId, list);
  });

  return Array.from(grouped.values()).flatMap(computeBestOdds);
}

function buildSportsAndLeagues(odds: BettingOdds[]): {
  sports: SportOption[];
  leagues: LeagueOption[];
} {
  const sportSet  = new Map<string, SportOption>();
  const leagueSet = new Map<string, LeagueOption>();

  for (const o of odds) {
    if (!sportSet.has(o.sportId)) {
      sportSet.set(o.sportId, {
        id:    o.sportId,
        key:   o.sport,
        label: o.sport,
        slug:  o.sportId.toLowerCase().replace(/\s+/g, "_"),
      });
    }
    if (!leagueSet.has(o.leagueId)) {
      leagueSet.set(o.leagueId, {
        id:      o.leagueId,
        key:     o.league,
        label:   o.league,
        sportId: o.sportId,
        slug:    o.leagueId,
      });
    }
  }

  return {
    sports:  Array.from(sportSet.values()),
    leagues: Array.from(leagueSet.values()),
  };
}

// ─── Default Sport Keys ───────────────────────────────────────
// These are fetched in parallel on every load.
// Each key = 1 API request. Free plan allows ~500 requests/month.

const DEFAULT_SPORT_KEYS = [
  // Soccer
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_germany_bundesliga",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one",
  "soccer_turkey_super_lig",
  // Basketball
  "basketball_nba",
  "basketball_euroleague",
  // Tennis
  "tennis_atp_miami_open",
  "tennis_wta_miami_open",
  // Ice Hockey
  "icehockey_nhl",
  // Baseball
  "baseball_mlb",
];

// ─── Sports List Fetch ────────────────────────────────────────

async function fetchActiveSports(): Promise<TheOddsApiSport[]> {
  if (isFresh(sportsListCache, CACHE_TTL_SPORTS)) {
    return sportsListCache!.data;
  }
  const sports = await apiFetch<TheOddsApiSport[]>("/sports", { all: "false" });
  const filtered = sports.filter((s) => s.active && !s.has_outrights);
  sportsListCache = { data: filtered, ts: Date.now() };
  return filtered;
}

// ─── Odds Fetch for a Single Sport Key ───────────────────────

async function fetchEventsForSport(
  sportKey: string,
  force = false
): Promise<TheOddsApiEvent[]> {
  if (!force && isFresh(eventsCache.get(sportKey), CACHE_TTL_EVENTS)) {
    return eventsCache.get(sportKey)!.data;
  }

  try {
    const events = await apiFetch<TheOddsApiEvent[]>(
      `/sports/${sportKey}/odds`,
      {
        regions:     "eu,uk,us",
        markets:     "h2h",
        oddsFormat:  "decimal",
      }
    );
    eventsCache.set(sportKey, { data: events, ts: Date.now() });
    return events;
  } catch (err) {
    // 404 = sport has no current events; treat as empty, not an error
    if (err instanceof ApiError && (err.status === 404 || err.status === 422)) {
      eventsCache.set(sportKey, { data: [], ts: Date.now() });
      return [];
    }
    throw err;
  }
}

// ─── Public Types & API ───────────────────────────────────────

export interface OddsDataResult {
  odds:    BettingOdds[];
  sports:  SportOption[];
  leagues: LeagueOption[];
}

/**
 * Main entry point — fetches real odds from The Odds API.
 * Always uses the real API (key is embedded above).
 */
export async function fetchOddsData(params?: {
  force?: boolean;
}): Promise<OddsDataResult> {
  const force = params?.force ?? false;

  // Fetch all sport keys in parallel (cache-aware)
  const results = await Promise.allSettled(
    DEFAULT_SPORT_KEYS.map((key) => fetchEventsForSport(key, force))
  );

  const allEvents: TheOddsApiEvent[] = [];
  let firstError: unknown = null;

  for (const r of results) {
    if (r.status === "fulfilled") {
      allEvents.push(...r.value);
    } else if (!firstError) {
      firstError = r.reason;
    }
  }

  // If we got zero events and every request failed, throw the first error
  if (allEvents.length === 0 && firstError) {
    throw firstError;
  }

  const odds = transformEvents(allEvents);
  const { sports, leagues } = buildSportsAndLeagues(odds);

  return { odds, sports, leagues };
}

/**
 * Returns the appropriate polling interval:
 * 30 s when live events exist, 120 s otherwise.
 */
export function getPollingInterval(odds: BettingOdds[]): number {
  const hasLive = odds.some((o) => o.eventStatus === "live");
  return hasLive ? POLL_INTERVAL_LIVE : POLL_INTERVAL_DEFAULT;
}

/**
 * Clears all cached data — useful for forced refresh.
 */
export function clearOddsCache(): void {
  eventsCache.clear();
  sportsListCache = null;
}
