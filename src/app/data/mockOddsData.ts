/**
 * Mock odds data — used as fallback when The Odds API key is invalid or
 * quota is exhausted. Data resembles real EPL / Championship fixtures.
 */

import type { BettingOdds, SportOption, LeagueOption } from "../types";

const NOW = new Date();
const h = (hours: number) =>
  new Date(NOW.getTime() + hours * 3_600_000).toISOString();

// ─── Bookmakers ───────────────────────────────────────────────

const BM = {
  betway:      { title: "Betway",       key: "betway",       domain: "betway.com" },
  bet365:      { title: "Bet365",        key: "bet365",       domain: "bet365.com" },
  williamhill: { title: "William Hill", key: "williamhill",  domain: "williamhill.com" },
  paddypower:  { title: "Paddy Power",  key: "paddypower",   domain: "paddypower.com" },
  skybet:      { title: "Sky Bet",      key: "skybet",       domain: "skybet.com" },
  ladbrokes:   { title: "Ladbrokes",   key: "ladbrokes_uk", domain: "ladbrokes.com" },
  unibet:      { title: "Unibet",       key: "unibet_uk",    domain: "unibet.com" },
  coral:       { title: "Coral",        key: "coral",        domain: "coral.co.uk" },
};

function logo(domain: string) {
  return `https://logo.clearbit.com/${domain}`;
}

// ─── Helper: build event rows ─────────────────────────────────

interface MatchDef {
  id: string;
  home: string;
  away: string;
  league: string;
  leagueId: string;
  startTime: string;
  status: "upcoming" | "live" | "finished";
  rows: Array<{
    bm: typeof BM[keyof typeof BM];
    home: number;
    draw: number;
    away: number;
    sponsored?: boolean;
  }>;
}

function buildRows(match: MatchDef): BettingOdds[] {
  const entries: BettingOdds[] = match.rows.map((r) => ({
    id: `${match.id}_${r.bm.key}`,
    eventId: match.id,
    company: r.bm.title,
    companyLogo: logo(r.bm.domain),
    affiliateUrl: `https://www.${r.bm.domain}`,
    match: `${match.home} - ${match.away}`,
    league: match.league,
    leagueId: match.leagueId,
    sport: "Soccer",
    sportId: "Soccer",
    odds: { home: r.home, draw: r.draw, away: r.away },
    isBest: false,
    isSponsored: r.sponsored ?? false,
    updatedAt: new Date().toISOString(),
    eventStatus: match.status,
    eventStartTime: match.startTime,
  }));

  // Mark best odds entry
  let bestIdx = 0;
  let bestScore = -Infinity;
  entries.forEach((e, i) => {
    const s = e.odds.home + e.odds.draw + e.odds.away;
    if (s > bestScore) { bestScore = s; bestIdx = i; }
  });
  entries[bestIdx].isBest = true;

  return entries;
}

// ─── Fixture Data ─────────────────────────────────────────────

const MATCHES: MatchDef[] = [
  // ── EPL ──────────────────────────────────────────────────────
  {
    id: "mock_epl_01",
    home: "Arsenal", away: "Chelsea",
    league: "English Premier League", leagueId: "soccer_epl",
    startTime: h(2), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.10, draw: 3.40, away: 3.60 },
      { bm: BM.betway,      home: 2.15, draw: 3.35, away: 3.55, sponsored: true },
      { bm: BM.williamhill, home: 2.08, draw: 3.40, away: 3.65 },
      { bm: BM.skybet,      home: 2.12, draw: 3.30, away: 3.50 },
      { bm: BM.paddypower,  home: 2.20, draw: 3.25, away: 3.45 },
    ],
  },
  {
    id: "mock_epl_02",
    home: "Manchester City", away: "Liverpool",
    league: "English Premier League", leagueId: "soccer_epl",
    startTime: h(4), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 1.85, draw: 3.60, away: 4.20 },
      { bm: BM.williamhill, home: 1.90, draw: 3.50, away: 4.10 },
      { bm: BM.ladbrokes,   home: 1.87, draw: 3.55, away: 4.15 },
      { bm: BM.coral,       home: 1.83, draw: 3.65, away: 4.25 },
      { bm: BM.unibet,      home: 1.88, draw: 3.52, away: 4.18 },
    ],
  },
  {
    id: "mock_epl_03",
    home: "Tottenham", away: "Manchester United",
    league: "English Premier League", leagueId: "soccer_epl",
    startTime: h(0.5), status: "live",
    rows: [
      { bm: BM.bet365,      home: 2.50, draw: 3.20, away: 2.85 },
      { bm: BM.skybet,      home: 2.45, draw: 3.25, away: 2.90 },
      { bm: BM.paddypower,  home: 2.55, draw: 3.15, away: 2.80 },
      { bm: BM.betway,      home: 2.48, draw: 3.22, away: 2.87, sponsored: true },
    ],
  },
  {
    id: "mock_epl_04",
    home: "Newcastle United", away: "Aston Villa",
    league: "English Premier League", leagueId: "soccer_epl",
    startTime: h(6), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.30, draw: 3.30, away: 3.10 },
      { bm: BM.williamhill, home: 2.35, draw: 3.25, away: 3.05 },
      { bm: BM.unibet,      home: 2.28, draw: 3.35, away: 3.15 },
      { bm: BM.ladbrokes,   home: 2.40, draw: 3.20, away: 3.00 },
    ],
  },
  {
    id: "mock_epl_05",
    home: "Brighton", away: "Everton",
    league: "English Premier League", leagueId: "soccer_epl",
    startTime: h(24), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 1.95, draw: 3.50, away: 3.90 },
      { bm: BM.coral,       home: 1.92, draw: 3.55, away: 3.95 },
      { bm: BM.skybet,      home: 2.00, draw: 3.45, away: 3.85 },
    ],
  },
  // ── Championship ─────────────────────────────────────────────
  {
    id: "mock_champ_01",
    home: "Leeds United", away: "Sheffield United",
    league: "Championship", leagueId: "soccer_england_championship",
    startTime: h(3), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.20, draw: 3.40, away: 3.20 },
      { bm: BM.williamhill, home: 2.25, draw: 3.35, away: 3.15 },
      { bm: BM.skybet,      home: 2.18, draw: 3.45, away: 3.25 },
      { bm: BM.paddypower,  home: 2.22, draw: 3.30, away: 3.10 },
    ],
  },
  {
    id: "mock_champ_02",
    home: "Burnley", away: "Sunderland",
    league: "Championship", leagueId: "soccer_england_championship",
    startTime: h(8), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.05, draw: 3.40, away: 3.60 },
      { bm: BM.ladbrokes,   home: 2.10, draw: 3.35, away: 3.55 },
      { bm: BM.unibet,      home: 2.08, draw: 3.42, away: 3.58 },
    ],
  },
  // ── FA Cup ─────────────────────────────────────────────────
  {
    id: "mock_fa_01",
    home: "Chelsea", away: "Arsenal",
    league: "FA Cup", leagueId: "soccer_england_fa_cup",
    startTime: h(1), status: "live",
    rows: [
      { bm: BM.bet365,      home: 2.75, draw: 3.10, away: 2.55 },
      { bm: BM.betway,      home: 2.80, draw: 3.05, away: 2.50, sponsored: true },
      { bm: BM.williamhill, home: 2.72, draw: 3.15, away: 2.60 },
      { bm: BM.coral,       home: 2.78, draw: 3.08, away: 2.52 },
    ],
  },
  // ── EFL Cup ──────────────────────────────────────────────────
  {
    id: "mock_efl_01",
    home: "Liverpool", away: "Manchester City",
    league: "EFL Cup", leagueId: "soccer_england_efl_cup",
    startTime: h(48), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.40, draw: 3.30, away: 2.90 },
      { bm: BM.skybet,      home: 2.45, draw: 3.25, away: 2.85 },
      { bm: BM.paddypower,  home: 2.38, draw: 3.35, away: 2.95 },
    ],
  },
  // ── League 1 ─────────────────────────────────────────────────
  {
    id: "mock_l1_01",
    home: "Bristol Rovers", away: "Oxford United",
    league: "League 1", leagueId: "soccer_england_league1",
    startTime: h(5), status: "upcoming",
    rows: [
      { bm: BM.bet365,      home: 2.60, draw: 3.20, away: 2.70 },
      { bm: BM.williamhill, home: 2.55, draw: 3.25, away: 2.75 },
      { bm: BM.ladbrokes,   home: 2.62, draw: 3.18, away: 2.68 },
    ],
  },
];

// ─── Build flat BettingOdds[] ─────────────────────────────────

export const MOCK_ODDS: BettingOdds[] = MATCHES.flatMap(buildRows);

// ─── Build sport / league option lists ───────────────────────

export const MOCK_SPORTS: SportOption[] = [
  { id: "Soccer", key: "Soccer", label: "Soccer", slug: "soccer" },
];

export const MOCK_LEAGUES: LeagueOption[] = [
  { id: "soccer_epl",                    key: "English Premier League", label: "English Premier League",  sportId: "Soccer", slug: "soccer_epl" },
  { id: "soccer_england_championship",   key: "Championship",           label: "Championship",            sportId: "Soccer", slug: "soccer_england_championship" },
  { id: "soccer_england_fa_cup",         key: "FA Cup",                 label: "FA Cup",                  sportId: "Soccer", slug: "soccer_england_fa_cup" },
  { id: "soccer_england_efl_cup",        key: "EFL Cup",                label: "EFL Cup",                 sportId: "Soccer", slug: "soccer_england_efl_cup" },
  { id: "soccer_england_league1",        key: "League 1",               label: "League 1",                sportId: "Soccer", slug: "soccer_england_league1" },
];
