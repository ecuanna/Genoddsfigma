/**
 * Pure client-side transforms for the server-owned The Odds API response.
 * The upstream API key and network calls must never live in this module.
 */

import type { BettingOdds, SportOption, LeagueOption } from "../types";

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

export interface TheOddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: TheOddsApiBookmaker[];
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

export function transformEvents(events: TheOddsApiEvent[]): BettingOdds[] {
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

export function buildSportsAndLeagues(odds: BettingOdds[]): {
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
