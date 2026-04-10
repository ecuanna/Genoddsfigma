import type { BettingOdds, SportOption, LeagueOption } from "./types";

// ─── Gerçek bahis sitesi URL'leri ────────────────────────────────────────────
const BOOKMAKER_URLS: Record<string, string> = {
  "Bet365":        "https://www.bet365.com",
  "William Hill":  "https://www.williamhill.com",
  "Betway":        "https://www.betway.com",
  "Paddy Power":   "https://www.paddypower.com",
  "Betfair":       "https://www.betfair.com",
  "Sky Bet":       "https://www.skybet.com",
  "Unibet":        "https://www.unibet.com",
  "bwin":          "https://www.bwin.com",
  "Pinnacle":      "https://www.pinnacle.com",
  "Betsson":       "https://www.betsson.com",
  "DraftKings":    "https://www.draftkings.com",
  "FanDuel":       "https://www.fanduel.com",
  "BetMGM":        "https://www.betmgm.com",
  "Caesars":       "https://www.caesars.com/sportsbook-and-casino",
  "Coral":         "https://www.coral.co.uk",
  "Ladbrokes":     "https://www.ladbrokes.com",
  "BetVictor":     "https://www.betvictor.com",
  "888Sport":      "https://www.888sport.com",
  "Marathonbet":   "https://www.marathonbet.com",
  "Betclic":       "https://www.betclic.com",
  "NordicBet":     "https://www.nordicbet.com",
  "TonyBet":       "https://www.tonybet.com",
  "Smarkets":      "https://www.smarkets.com",
  "Matchbook":     "https://www.matchbook.com",
  "1xBet":         "https://www.1xbet.com",
  "Sportsbet":     "https://www.sportsbet.com.au",
  "TAB":           "https://www.tab.com.au",
};

function url(company: string): string {
  return BOOKMAKER_URLS[company] ?? `https://www.${company.toLowerCase().replace(/\s+/g, "")}.com`;
}

function logo(company: string): string {
  const domains: Record<string, string> = {
    "Bet365":        "bet365.com",
    "William Hill":  "williamhill.com",
    "Betway":        "betway.com",
    "Paddy Power":   "paddypower.com",
    "Betfair":       "betfair.com",
    "Sky Bet":       "skybet.com",
    "Unibet":        "unibet.com",
    "bwin":          "bwin.com",
    "Pinnacle":      "pinnacle.com",
    "Betsson":       "betsson.com",
    "DraftKings":    "draftkings.com",
    "FanDuel":       "fanduel.com",
    "BetMGM":        "betmgm.com",
    "Caesars":       "caesars.com",
    "Coral":         "coral.co.uk",
    "Ladbrokes":     "ladbrokes.com",
    "BetVictor":     "betvictor.com",
    "888Sport":      "888sport.com",
    "Marathonbet":   "marathonbet.com",
    "Betclic":       "betclic.com",
    "NordicBet":     "nordicbet.com",
    "TonyBet":       "tonybet.com",
    "Smarkets":      "smarkets.com",
    "Matchbook":     "matchbook.com",
    "1xBet":         "1xbet.com",
    "Sportsbet":     "sportsbet.com.au",
    "TAB":           "tab.com.au",
  };
  const domain = domains[company];
  return domain ? `https://logo.clearbit.com/${domain}` : "";
}

// ─── Yardımcı: Bir event için en iyi oranı hesapla ───────────────────────────
function markBest(entries: Omit<BettingOdds, "isBest">[]): BettingOdds[] {
  if (entries.length === 0) return [];
  let bestIdx = 0;
  let bestScore = -Infinity;
  entries.forEach((e, i) => {
    const score = e.odds.home + e.odds.away + (e.odds.draw > 0 ? e.odds.draw : 0);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  });
  return entries.map((e, i) => ({ ...e, isBest: i === bestIdx }));
}

// ─── Maçlar ──────────────────────────────────────────────────────────────────

const now = new Date();
function hoursFromNow(h: number) {
  return new Date(now.getTime() + h * 3600_000).toISOString();
}
function hoursAgo(h: number) {
  return new Date(now.getTime() - h * 3600_000).toISOString();
}

let _id = 1;
function id() { return String(_id++); }

// ─── EPL ─────────────────────────────────────────────────────────────────────

const eplMatches = [
  ...markBest([
    { id: id(), eventId: "epl_1", company: "Bet365",       companyLogo: logo("Bet365"),       affiliateUrl: url("Bet365"),       match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.95, draw: 3.60, away: 4.00 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
    { id: id(), eventId: "epl_1", company: "William Hill", companyLogo: logo("William Hill"), affiliateUrl: url("William Hill"), match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.91, draw: 3.55, away: 4.10 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
    { id: id(), eventId: "epl_1", company: "Betway",       companyLogo: logo("Betway"),       affiliateUrl: url("Betway"),       match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.90, draw: 3.50, away: 4.20 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
    { id: id(), eventId: "epl_1", company: "Unibet",       companyLogo: logo("Unibet"),       affiliateUrl: url("Unibet"),       match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.93, draw: 3.58, away: 3.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
    { id: id(), eventId: "epl_1", company: "Pinnacle",     companyLogo: logo("Pinnacle"),     affiliateUrl: url("Pinnacle"),     match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.97, draw: 3.62, away: 4.05 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
    { id: id(), eventId: "epl_1", company: "bwin",         companyLogo: logo("bwin"),         affiliateUrl: url("bwin"),         match: "Manchester City - Arsenal",     league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.88, draw: 3.48, away: 4.15 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(3) },
  ]),
  ...markBest([
    { id: id(), eventId: "epl_2", company: "Bet365",       companyLogo: logo("Bet365"),       affiliateUrl: url("Bet365"),       match: "Liverpool - Chelsea",          league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.10, draw: 3.40, away: 3.30 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1) },
    { id: id(), eventId: "epl_2", company: "Sky Bet",      companyLogo: logo("Sky Bet"),      affiliateUrl: url("Sky Bet"),      match: "Liverpool - Chelsea",          league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.05, draw: 3.35, away: 3.40 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1) },
    { id: id(), eventId: "epl_2", company: "Betfair",      companyLogo: logo("Betfair"),      affiliateUrl: url("Betfair"),      match: "Liverpool - Chelsea",          league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.14, draw: 3.42, away: 3.25 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1) },
    { id: id(), eventId: "epl_2", company: "Coral",        companyLogo: logo("Coral"),        affiliateUrl: url("Coral"),        match: "Liverpool - Chelsea",          league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.00, draw: 3.30, away: 3.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1) },
    { id: id(), eventId: "epl_2", company: "Pinnacle",     companyLogo: logo("Pinnacle"),     affiliateUrl: url("Pinnacle"),     match: "Liverpool - Chelsea",          league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.16, draw: 3.44, away: 3.22 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1) },
  ]),
  ...markBest([
    { id: id(), eventId: "epl_3", company: "William Hill", companyLogo: logo("William Hill"), affiliateUrl: url("William Hill"), match: "Manchester United - Tottenham", league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.50, draw: 3.20, away: 2.70 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(26) },
    { id: id(), eventId: "epl_3", company: "Ladbrokes",    companyLogo: logo("Ladbrokes"),    affiliateUrl: url("Ladbrokes"),    match: "Manchester United - Tottenham", league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.45, draw: 3.25, away: 2.80 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(26) },
    { id: id(), eventId: "epl_3", company: "Betway",       companyLogo: logo("Betway"),       affiliateUrl: url("Betway"),       match: "Manchester United - Tottenham", league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.55, draw: 3.18, away: 2.65 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(26) },
    { id: id(), eventId: "epl_3", company: "BetVictor",    companyLogo: logo("BetVictor"),    affiliateUrl: url("BetVictor"),    match: "Manchester United - Tottenham", league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.40, draw: 3.10, away: 2.90 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(26) },
  ]),
  ...markBest([
    { id: id(), eventId: "epl_4", company: "Paddy Power",  companyLogo: logo("Paddy Power"),  affiliateUrl: url("Paddy Power"),  match: "Newcastle - Aston Villa",      league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.20, draw: 3.30, away: 3.20 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(48) },
    { id: id(), eventId: "epl_4", company: "888Sport",     companyLogo: logo("888Sport"),     affiliateUrl: url("888Sport"),     match: "Newcastle - Aston Villa",      league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.25, draw: 3.35, away: 3.10 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(48) },
    { id: id(), eventId: "epl_4", company: "Smarkets",     companyLogo: logo("Smarkets"),     affiliateUrl: url("Smarkets"),     match: "Newcastle - Aston Villa",      league: "Premier League", leagueId: "soccer_epl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.28, draw: 3.38, away: 3.05 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(48) },
  ]),
];

// ─── Champions League ─────────────────────────────────────────────────────────

const uclMatches = [
  ...markBest([
    { id: id(), eventId: "ucl_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.20, draw: 3.40, away: 3.00 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
    { id: id(), eventId: "ucl_1", company: "Unibet",      companyLogo: logo("Unibet"),      affiliateUrl: url("Unibet"),      match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.15, draw: 3.38, away: 3.10 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
    { id: id(), eventId: "ucl_1", company: "bwin",        companyLogo: logo("bwin"),        affiliateUrl: url("bwin"),        match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.18, draw: 3.42, away: 3.05 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
    { id: id(), eventId: "ucl_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.24, draw: 3.45, away: 2.98 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
    { id: id(), eventId: "ucl_1", company: "Betsson",     companyLogo: logo("Betsson"),     affiliateUrl: url("Betsson"),     match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.12, draw: 3.35, away: 3.15 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
    { id: id(), eventId: "ucl_1", company: "Marathonbet", companyLogo: logo("Marathonbet"), affiliateUrl: url("Marathonbet"), match: "Real Madrid - Bayern Munich",  league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.22, draw: 3.40, away: 3.02 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(5) },
  ]),
  ...markBest([
    { id: id(), eventId: "ucl_2", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "PSG - Inter Milan",            league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.05, draw: 3.55, away: 3.40 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(29) },
    { id: id(), eventId: "ucl_2", company: "Betway",      companyLogo: logo("Betway"),      affiliateUrl: url("Betway"),      match: "PSG - Inter Milan",            league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.00, draw: 3.50, away: 3.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(29) },
    { id: id(), eventId: "ucl_2", company: "NordicBet",   companyLogo: logo("NordicBet"),   affiliateUrl: url("NordicBet"),   match: "PSG - Inter Milan",            league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.08, draw: 3.58, away: 3.35 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(29) },
    { id: id(), eventId: "ucl_2", company: "TonyBet",     companyLogo: logo("TonyBet"),     affiliateUrl: url("TonyBet"),     match: "PSG - Inter Milan",            league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 2.10, draw: 3.60, away: 3.30 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(29) },
  ]),
  ...markBest([
    { id: id(), eventId: "ucl_3", company: "Paddy Power", companyLogo: logo("Paddy Power"), affiliateUrl: url("Paddy Power"), match: "Barcelona - Juventus",          league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.85, draw: 3.60, away: 4.20 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.5) },
    { id: id(), eventId: "ucl_3", company: "William Hill",companyLogo: logo("William Hill"),affiliateUrl: url("William Hill"),match: "Barcelona - Juventus",          league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.80, draw: 3.55, away: 4.30 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.5) },
    { id: id(), eventId: "ucl_3", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Barcelona - Juventus",          league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.88, draw: 3.62, away: 4.15 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.5) },
    { id: id(), eventId: "ucl_3", company: "Betfair",     companyLogo: logo("Betfair"),     affiliateUrl: url("Betfair"),     match: "Barcelona - Juventus",          league: "UEFA Champions League", leagueId: "soccer_ucl", sport: "Soccer", sportId: "Soccer", odds: { home: 1.90, draw: 3.65, away: 4.10 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.5) },
  ]),
];

// ─── La Liga ──────────────────────────────────────────────────────────────────

const laligaMatches = [
  ...markBest([
    { id: id(), eventId: "ll_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Real Madrid - Atletico Madrid", league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.00, draw: 3.50, away: 3.60 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(51) },
    { id: id(), eventId: "ll_1", company: "bwin",        companyLogo: logo("bwin"),        affiliateUrl: url("bwin"),        match: "Real Madrid - Atletico Madrid", league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.97, draw: 3.45, away: 3.70 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(51) },
    { id: id(), eventId: "ll_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Real Madrid - Atletico Madrid", league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.04, draw: 3.52, away: 3.55 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(51) },
    { id: id(), eventId: "ll_1", company: "Betclic",     companyLogo: logo("Betclic"),     affiliateUrl: url("Betclic"),     match: "Real Madrid - Atletico Madrid", league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.95, draw: 3.40, away: 3.75 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(51) },
    { id: id(), eventId: "ll_1", company: "Matchbook",   companyLogo: logo("Matchbook"),   affiliateUrl: url("Matchbook"),   match: "Real Madrid - Atletico Madrid", league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.06, draw: 3.55, away: 3.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(51) },
  ]),
  ...markBest([
    { id: id(), eventId: "ll_2", company: "William Hill",companyLogo: logo("William Hill"),affiliateUrl: url("William Hill"),match: "Sevilla - Valencia",            league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.30, draw: 3.20, away: 3.00 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(75) },
    { id: id(), eventId: "ll_2", company: "Unibet",      companyLogo: logo("Unibet"),      affiliateUrl: url("Unibet"),      match: "Sevilla - Valencia",            league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.35, draw: 3.22, away: 2.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(75) },
    { id: id(), eventId: "ll_2", company: "Betsson",     companyLogo: logo("Betsson"),     affiliateUrl: url("Betsson"),     match: "Sevilla - Valencia",            league: "La Liga", leagueId: "soccer_la_liga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.28, draw: 3.18, away: 3.05 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(75) },
  ]),
];

// ─── Bundesliga ───────────────────────────────────────────────────────────────

const bundesligaMatches = [
  ...markBest([
    { id: id(), eventId: "bl_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Bayern Munich - Borussia Dortmund", league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.75, draw: 3.80, away: 4.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(19) },
    { id: id(), eventId: "bl_1", company: "bwin",        companyLogo: logo("bwin"),        affiliateUrl: url("bwin"),        match: "Bayern Munich - Borussia Dortmund", league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.72, draw: 3.75, away: 4.60 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(19) },
    { id: id(), eventId: "bl_1", company: "Unibet",      companyLogo: logo("Unibet"),      affiliateUrl: url("Unibet"),      match: "Bayern Munich - Borussia Dortmund", league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.78, draw: 3.82, away: 4.40 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(19) },
    { id: id(), eventId: "bl_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Bayern Munich - Borussia Dortmund", league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 1.80, draw: 3.85, away: 4.35 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(19) },
  ]),
  ...markBest([
    { id: id(), eventId: "bl_2", company: "William Hill",companyLogo: logo("William Hill"),affiliateUrl: url("William Hill"),match: "RB Leipzig - Bayer Leverkusen",  league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.60, draw: 3.10, away: 2.55 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.8) },
    { id: id(), eventId: "bl_2", company: "Betway",      companyLogo: logo("Betway"),      affiliateUrl: url("Betway"),      match: "RB Leipzig - Bayer Leverkusen",  league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.55, draw: 3.08, away: 2.60 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.8) },
    { id: id(), eventId: "bl_2", company: "Smarkets",    companyLogo: logo("Smarkets"),    affiliateUrl: url("Smarkets"),    match: "RB Leipzig - Bayer Leverkusen",  league: "Bundesliga", leagueId: "soccer_bundesliga", sport: "Soccer", sportId: "Soccer", odds: { home: 2.65, draw: 3.12, away: 2.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.8) },
  ]),
];

// ─── Serie A ──────────────────────────────────────────────────────────────────

const serieAMatches = [
  ...markBest([
    { id: id(), eventId: "sa_1", company: "Bet365",   companyLogo: logo("Bet365"),   affiliateUrl: url("Bet365"),   match: "AC Milan - Inter Milan",    league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.40, draw: 3.25, away: 2.90 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(32) },
    { id: id(), eventId: "sa_1", company: "Unibet",   companyLogo: logo("Unibet"),   affiliateUrl: url("Unibet"),   match: "AC Milan - Inter Milan",    league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.35, draw: 3.20, away: 2.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(32) },
    { id: id(), eventId: "sa_1", company: "Betclic",  companyLogo: logo("Betclic"),  affiliateUrl: url("Betclic"),  match: "AC Milan - Inter Milan",    league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.42, draw: 3.28, away: 2.88 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(32) },
    { id: id(), eventId: "sa_1", company: "bwin",     companyLogo: logo("bwin"),     affiliateUrl: url("bwin"),     match: "AC Milan - Inter Milan",    league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.30, draw: 3.15, away: 3.00 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(32) },
  ]),
  ...markBest([
    { id: id(), eventId: "sa_2", company: "Pinnacle",  companyLogo: logo("Pinnacle"),  affiliateUrl: url("Pinnacle"),  match: "Juventus - Napoli",         league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.15, draw: 3.30, away: 3.40 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(55) },
    { id: id(), eventId: "sa_2", company: "Betsson",   companyLogo: logo("Betsson"),   affiliateUrl: url("Betsson"),   match: "Juventus - Napoli",         league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.10, draw: 3.28, away: 3.45 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(55) },
    { id: id(), eventId: "sa_2", company: "TonyBet",   companyLogo: logo("TonyBet"),   affiliateUrl: url("TonyBet"),   match: "Juventus - Napoli",         league: "Serie A", leagueId: "soccer_serie_a", sport: "Soccer", sportId: "Soccer", odds: { home: 2.18, draw: 3.32, away: 3.38 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(55) },
  ]),
];

// ─── NBA ──────────────────────────────────────────────────────────────────────

const nbaMatches = [
  ...markBest([
    { id: id(), eventId: "nba_1", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "Boston Celtics - Golden State Warriors", league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.80, draw: 0, away: 2.05 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(7) },
    { id: id(), eventId: "nba_1", company: "FanDuel",     companyLogo: logo("FanDuel"),     affiliateUrl: url("FanDuel"),     match: "Boston Celtics - Golden State Warriors", league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.78, draw: 0, away: 2.08 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(7) },
    { id: id(), eventId: "nba_1", company: "BetMGM",      companyLogo: logo("BetMGM"),      affiliateUrl: url("BetMGM"),      match: "Boston Celtics - Golden State Warriors", league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.82, draw: 0, away: 2.02 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(7) },
    { id: id(), eventId: "nba_1", company: "Caesars",     companyLogo: logo("Caesars"),     affiliateUrl: url("Caesars"),     match: "Boston Celtics - Golden State Warriors", league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.83, draw: 0, away: 2.00 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(7) },
    { id: id(), eventId: "nba_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Boston Celtics - Golden State Warriors", league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.85, draw: 0, away: 1.98 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(7) },
  ]),
  ...markBest([
    { id: id(), eventId: "nba_2", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "LA Lakers - Miami Heat",               league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.65, draw: 0, away: 2.30 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1.5) },
    { id: id(), eventId: "nba_2", company: "FanDuel",     companyLogo: logo("FanDuel"),     affiliateUrl: url("FanDuel"),     match: "LA Lakers - Miami Heat",               league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.68, draw: 0, away: 2.25 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1.5) },
    { id: id(), eventId: "nba_2", company: "BetMGM",      companyLogo: logo("BetMGM"),      affiliateUrl: url("BetMGM"),      match: "LA Lakers - Miami Heat",               league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.62, draw: 0, away: 2.35 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1.5) },
    { id: id(), eventId: "nba_2", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "LA Lakers - Miami Heat",               league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.70, draw: 0, away: 2.22 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(1.5) },
  ]),
  ...markBest([
    { id: id(), eventId: "nba_3", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "Denver Nuggets - Phoenix Suns",        league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.90, draw: 0, away: 1.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(10) },
    { id: id(), eventId: "nba_3", company: "FanDuel",     companyLogo: logo("FanDuel"),     affiliateUrl: url("FanDuel"),     match: "Denver Nuggets - Phoenix Suns",        league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.88, draw: 0, away: 1.97 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(10) },
    { id: id(), eventId: "nba_3", company: "BetMGM",      companyLogo: logo("BetMGM"),      affiliateUrl: url("BetMGM"),      match: "Denver Nuggets - Phoenix Suns",        league: "NBA", leagueId: "basketball_nba", sport: "Basketball", sportId: "Basketball", odds: { home: 1.92, draw: 0, away: 1.93 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(10) },
  ]),
];

// ─── NHL ──────────────────────────────────────────────────────────────────────

const nhlMatches = [
  ...markBest([
    { id: id(), eventId: "nhl_1", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "Toronto Maple Leafs - Boston Bruins",  league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.00, draw: 0, away: 1.85 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(8) },
    { id: id(), eventId: "nhl_1", company: "FanDuel",     companyLogo: logo("FanDuel"),     affiliateUrl: url("FanDuel"),     match: "Toronto Maple Leafs - Boston Bruins",  league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 1.95, draw: 0, away: 1.90 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(8) },
    { id: id(), eventId: "nhl_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Toronto Maple Leafs - Boston Bruins",  league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.05, draw: 0, away: 1.82 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(8) },
    { id: id(), eventId: "nhl_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Toronto Maple Leafs - Boston Bruins",  league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.08, draw: 0, away: 1.80 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(8) },
  ]),
  ...markBest([
    { id: id(), eventId: "nhl_2", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "NY Rangers - Pittsburgh Penguins",     league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.20, draw: 0, away: 1.72 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.3) },
    { id: id(), eventId: "nhl_2", company: "BetMGM",      companyLogo: logo("BetMGM"),      affiliateUrl: url("BetMGM"),      match: "NY Rangers - Pittsburgh Penguins",     league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.15, draw: 0, away: 1.76 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.3) },
    { id: id(), eventId: "nhl_2", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "NY Rangers - Pittsburgh Penguins",     league: "NHL", leagueId: "icehockey_nhl", sport: "Ice Hockey", sportId: "Ice Hockey", odds: { home: 2.25, draw: 0, away: 1.70 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.3) },
  ]),
];

// ─── Tennis ───────────────────────────────────────────────────────────────────

const tennisMatches = [
  ...markBest([
    { id: id(), eventId: "atp_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Novak Djokovic - Carlos Alcaraz",       league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.90, draw: 0, away: 1.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(13) },
    { id: id(), eventId: "atp_1", company: "William Hill",companyLogo: logo("William Hill"),affiliateUrl: url("William Hill"),match: "Novak Djokovic - Carlos Alcaraz",       league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.87, draw: 0, away: 2.00 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(13) },
    { id: id(), eventId: "atp_1", company: "Unibet",      companyLogo: logo("Unibet"),      affiliateUrl: url("Unibet"),      match: "Novak Djokovic - Carlos Alcaraz",       league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.93, draw: 0, away: 1.92 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(13) },
    { id: id(), eventId: "atp_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Novak Djokovic - Carlos Alcaraz",       league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.95, draw: 0, away: 1.90 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(13) },
  ]),
  ...markBest([
    { id: id(), eventId: "atp_2", company: "Betway",      companyLogo: logo("Betway"),      affiliateUrl: url("Betway"),      match: "Jannik Sinner - Rafael Nadal",         league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.55, draw: 0, away: 2.50 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.7) },
    { id: id(), eventId: "atp_2", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Jannik Sinner - Rafael Nadal",         league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.58, draw: 0, away: 2.45 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.7) },
    { id: id(), eventId: "atp_2", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Jannik Sinner - Rafael Nadal",         league: "ATP Masters", leagueId: "tennis_atp", sport: "Tennis", sportId: "Tennis", odds: { home: 1.52, draw: 0, away: 2.55 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "live",     eventStartTime: hoursAgo(0.7) },
  ]),
  ...markBest([
    { id: id(), eventId: "wta_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Iga Swiatek - Aryna Sabalenka",        league: "WTA Masters", leagueId: "tennis_wta", sport: "Tennis", sportId: "Tennis", odds: { home: 1.70, draw: 0, away: 2.20 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(16) },
    { id: id(), eventId: "wta_1", company: "Pinnacle",    companyLogo: logo("Pinnacle"),    affiliateUrl: url("Pinnacle"),    match: "Iga Swiatek - Aryna Sabalenka",        league: "WTA Masters", leagueId: "tennis_wta", sport: "Tennis", sportId: "Tennis", odds: { home: 1.73, draw: 0, away: 2.18 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(16) },
    { id: id(), eventId: "wta_1", company: "Unibet",      companyLogo: logo("Unibet"),      affiliateUrl: url("Unibet"),      match: "Iga Swiatek - Aryna Sabalenka",        league: "WTA Masters", leagueId: "tennis_wta", sport: "Tennis", sportId: "Tennis", odds: { home: 1.67, draw: 0, away: 2.25 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(16) },
  ]),
];

// ─── MLB ──────────────────────────────────────────────────────────────────────

const mlbMatches = [
  ...markBest([
    { id: id(), eventId: "mlb_1", company: "DraftKings",  companyLogo: logo("DraftKings"),  affiliateUrl: url("DraftKings"),  match: "New York Yankees - LA Dodgers",        league: "MLB", leagueId: "baseball_mlb", sport: "Baseball", sportId: "Baseball", odds: { home: 2.05, draw: 0, away: 1.88 }, isSponsored: true,  updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(6) },
    { id: id(), eventId: "mlb_1", company: "FanDuel",     companyLogo: logo("FanDuel"),     affiliateUrl: url("FanDuel"),     match: "New York Yankees - LA Dodgers",        league: "MLB", leagueId: "baseball_mlb", sport: "Baseball", sportId: "Baseball", odds: { home: 2.00, draw: 0, away: 1.92 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(6) },
    { id: id(), eventId: "mlb_1", company: "BetMGM",      companyLogo: logo("BetMGM"),      affiliateUrl: url("BetMGM"),      match: "New York Yankees - LA Dodgers",        league: "MLB", leagueId: "baseball_mlb", sport: "Baseball", sportId: "Baseball", odds: { home: 2.08, draw: 0, away: 1.85 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(6) },
  ]),
];

// ─── Avustralya ───────────────────────────────────────────────────────────────

const auMatches = [
  ...markBest([
    { id: id(), eventId: "afl_1", company: "Sportsbet",   companyLogo: logo("Sportsbet"),   affiliateUrl: url("Sportsbet"),   match: "Richmond Tigers - Collingwood Magpies", league: "AFL", leagueId: "aussierules_afl", sport: "Aussie Rules", sportId: "Aussie Rules", odds: { home: 1.90, draw: 0, away: 1.95 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(22) },
    { id: id(), eventId: "afl_1", company: "TAB",         companyLogo: logo("TAB"),         affiliateUrl: url("TAB"),         match: "Richmond Tigers - Collingwood Magpies", league: "AFL", leagueId: "aussierules_afl", sport: "Aussie Rules", sportId: "Aussie Rules", odds: { home: 1.87, draw: 0, away: 2.00 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(22) },
    { id: id(), eventId: "afl_1", company: "Bet365",      companyLogo: logo("Bet365"),      affiliateUrl: url("Bet365"),      match: "Richmond Tigers - Collingwood Magpies", league: "AFL", leagueId: "aussierules_afl", sport: "Aussie Rules", sportId: "Aussie Rules", odds: { home: 1.93, draw: 0, away: 1.92 }, isSponsored: false, updatedAt: new Date().toISOString(), eventStatus: "upcoming", eventStartTime: hoursFromNow(22) },
  ]),
];

// ─── Tüm veriler birleştir ────────────────────────────────────────────────────

export const MOCK_ODDS: BettingOdds[] = [
  ...eplMatches,
  ...uclMatches,
  ...laligaMatches,
  ...bundesligaMatches,
  ...serieAMatches,
  ...nbaMatches,
  ...nhlMatches,
  ...tennisMatches,
  ...mlbMatches,
  ...auMatches,
];

// ─── Sports & Leagues (mock'tan türetilmiş) ───────────────────────────────────

export const MOCK_SPORTS: SportOption[] = Array.from(
  new Map(MOCK_ODDS.map((o) => [o.sportId, { id: o.sportId, key: o.sport, label: o.sport, slug: o.sportId.toLowerCase().replace(/\s+/g, "_") }])).entries()
).map(([, v]) => v);

export const MOCK_LEAGUES: LeagueOption[] = Array.from(
  new Map(MOCK_ODDS.map((o) => [o.leagueId, { id: o.leagueId, key: o.league, label: o.league, sportId: o.sportId, slug: o.leagueId }])).entries()
).map(([, v]) => v);
