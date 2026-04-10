export interface BookmakerEntry {
  key: string;
  name: string;
  domain: string;
  region: 'UK' | 'EU' | 'US' | 'AU' | 'GLOBAL';
  apiTitle?: string;
}

export function getBookmakerLogo(entry: BookmakerEntry): string {
  return `https://logo.clearbit.com/${entry.domain}`;
}

export function getBookmakerUrl(entry: BookmakerEntry): string {
  return `https://www.${entry.domain}`;
}

/** Returns a color based on bookmaker key (for placeholder logos) */
export function getBookmakerColor(key: string): string {
  const palette = ['1e40af', 'dc2626', '059669', '7c3aed', 'd97706', '0891b2', 'be185d'];
  const idx = Math.abs([...key].reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
  return `#${palette[idx]}`;
}

/** Find entry by display name (case-insensitive) */
export function findBookmakerByName(name: string): BookmakerEntry | undefined {
  const lower = name.toLowerCase();
  return ALL_BOOKMAKERS.find(
    (b) =>
      b.name.toLowerCase() === lower ||
      (b.apiTitle && b.apiTitle.toLowerCase() === lower)
  );
}

/** Match a bookmaker name against an odds company name */
export function matchesBookmaker(favoriteBookmakerName: string, oddsCompany: string): boolean {
  const fav = favoriteBookmakerName.toLowerCase();
  const company = oddsCompany.toLowerCase();
  return (
    company === fav ||
    company.includes(fav) ||
    fav.includes(company) ||
    // Try resolving via API title
    (() => {
      const entry = findBookmakerByName(favoriteBookmakerName);
      if (!entry?.apiTitle) return false;
      return company === entry.apiTitle.toLowerCase() || company.includes(entry.apiTitle.toLowerCase());
    })()
  );
}

export const ALL_BOOKMAKERS: BookmakerEntry[] = [
  // ── UK ────────────────────────────────────────────────────────────────
  { key: 'bet365',       name: 'Bet365',        domain: 'bet365.com',           region: 'UK', apiTitle: 'Bet365' },
  { key: 'williamhill',  name: 'William Hill',  domain: 'williamhill.com',      region: 'UK', apiTitle: 'William Hill' },
  { key: 'betway',       name: 'Betway',        domain: 'betway.com',           region: 'UK', apiTitle: 'Betway' },
  { key: 'paddypower',   name: 'Paddy Power',   domain: 'paddypower.com',       region: 'UK', apiTitle: 'Paddy Power' },
  { key: 'betfair',      name: 'Betfair',       domain: 'betfair.com',          region: 'UK', apiTitle: 'Betfair Exchange' },
  { key: 'skybet',       name: 'Sky Bet',       domain: 'skybet.com',           region: 'UK', apiTitle: 'Sky Bet' },
  { key: 'coral',        name: 'Coral',         domain: 'coral.co.uk',          region: 'UK', apiTitle: 'Coral' },
  { key: 'ladbrokes',    name: 'Ladbrokes',     domain: 'ladbrokes.com',        region: 'UK', apiTitle: 'Ladbrokes' },
  { key: 'boylesports',  name: 'BoyleSports',   domain: 'boylesports.com',      region: 'UK', apiTitle: 'BoyleSports' },
  { key: 'betvictor',    name: 'BetVictor',     domain: 'betvictor.com',        region: 'UK', apiTitle: 'BetVictor' },
  { key: 'sport888',     name: '888Sport',      domain: '888sport.com',         region: 'UK', apiTitle: '888sport' },
  { key: 'virginbet',    name: 'Virgin Bet',    domain: 'virginbet.com',        region: 'UK', apiTitle: 'Virgin Bet' },
  { key: 'livescorebet', name: 'LiveScore Bet', domain: 'livescorebet.com',     region: 'UK', apiTitle: 'LiveScore Bet' },
  { key: 'smarkets',     name: 'Smarkets',      domain: 'smarkets.com',         region: 'UK', apiTitle: 'Smarkets' },
  { key: 'matchbook',    name: 'Matchbook',     domain: 'matchbook.com',        region: 'UK', apiTitle: 'Matchbook' },
  // ── EU ────────────────────────────────────────────────────────────────
  { key: 'unibet',       name: 'Unibet',        domain: 'unibet.com',           region: 'EU', apiTitle: 'Unibet' },
  { key: 'bwin',         name: 'bwin',          domain: 'bwin.com',             region: 'EU', apiTitle: 'bwin' },
  { key: 'betsson',      name: 'Betsson',       domain: 'betsson.com',          region: 'EU', apiTitle: 'Betsson' },
  { key: 'betclic',      name: 'Betclic',       domain: 'betclic.com',          region: 'EU', apiTitle: 'Betclic' },
  { key: 'pinnacle',     name: 'Pinnacle',      domain: 'pinnacle.com',         region: 'EU', apiTitle: 'Pinnacle' },
  { key: 'betano',       name: 'Betano',        domain: 'betano.com',           region: 'EU', apiTitle: 'Betano' },
  { key: 'leovegas',     name: 'LeoVegas',      domain: 'leovegas.com',         region: 'EU', apiTitle: 'LeoVegas' },
  { key: 'casumo',       name: 'Casumo',        domain: 'casumo.com',           region: 'EU', apiTitle: 'Casumo' },
  { key: 'nordicbet',    name: 'NordicBet',     domain: 'nordicbet.com',        region: 'EU', apiTitle: 'NordicBet' },
  { key: 'tonybet',      name: 'TonyBet',       domain: 'tonybet.com',          region: 'EU', apiTitle: 'TonyBet' },
  { key: 'winamax',      name: 'Winamax',       domain: 'winamax.fr',           region: 'EU', apiTitle: 'Winamax' },
  { key: 'marathonbet',  name: 'Marathonbet',   domain: 'marathonbet.com',      region: 'EU', apiTitle: 'Marathonbet' },
  { key: 'pokerstars',   name: 'PokerStars',    domain: 'pokerstars.com',       region: 'EU', apiTitle: 'PokerStars' },
  { key: 'tipico',       name: 'Tipico',        domain: 'tipico.com',           region: 'EU', apiTitle: 'Tipico' },
  { key: 'coolbet',      name: 'Coolbet',       domain: 'coolbet.com',          region: 'EU', apiTitle: 'Coolbet' },
  { key: 'suprabets',    name: 'Suprabets',     domain: 'suprabets.com',        region: 'EU', apiTitle: 'Suprabets' },
  { key: 'grosvenor',    name: 'Grosvenor',     domain: 'grosvenorcasinos.com', region: 'EU', apiTitle: 'Grosvenor' },
  // ── Global ────────────────────────────────────────────────────────────
  { key: 'onexbet',      name: '1xBet',         domain: '1xbet.com',            region: 'GLOBAL', apiTitle: '1xBet' },
  { key: 'megapari',     name: 'Megapari',      domain: 'megapari.com',         region: 'GLOBAL' },
  { key: 'parimatch',    name: 'Parimatch',     domain: 'parimatch.com',        region: 'GLOBAL' },
  { key: 'melbet',       name: 'Melbet',        domain: 'melbet.com',           region: 'GLOBAL' },
  { key: 'mostbet',      name: 'Mostbet',       domain: 'mostbet.com',          region: 'GLOBAL' },
  { key: 'sportybet',    name: 'SportyBet',     domain: 'sportybet.com',        region: 'GLOBAL' },
  { key: 'bet9ja',       name: 'Bet9ja',        domain: 'bet9ja.com',           region: 'GLOBAL' },
  // ── US ────────────────────────────────────────────────────────────────
  { key: 'draftkings',   name: 'DraftKings',    domain: 'draftkings.com',       region: 'US', apiTitle: 'DraftKings' },
  { key: 'fanduel',      name: 'FanDuel',       domain: 'fanduel.com',          region: 'US', apiTitle: 'FanDuel' },
  { key: 'betmgm',       name: 'BetMGM',        domain: 'betmgm.com',           region: 'US', apiTitle: 'BetMGM' },
  { key: 'caesars',      name: 'Caesars',       domain: 'caesars.com',          region: 'US', apiTitle: 'Caesars Sportsbook' },
  { key: 'betrivers',    name: 'BetRivers',     domain: 'betrivers.com',        region: 'US', apiTitle: 'BetRivers' },
  { key: 'espnbet',      name: 'ESPN Bet',      domain: 'espnbet.com',          region: 'US', apiTitle: 'ESPN Bet' },
  { key: 'pointsbet',    name: 'PointsBet',     domain: 'pointsbet.com',        region: 'US', apiTitle: 'PointsBet' },
  { key: 'fanatics',     name: 'Fanatics',      domain: 'fanatics.com',         region: 'US', apiTitle: 'Fanatics' },
  { key: 'mybookie',     name: 'MyBookie',      domain: 'mybookie.ag',          region: 'US', apiTitle: 'MyBookie.ag' },
  { key: 'betonline',    name: 'BetOnline',     domain: 'betonline.ag',         region: 'US', apiTitle: 'BetOnline.ag' },
  { key: 'bovada',       name: 'Bovada',        domain: 'bovada.lv',            region: 'US', apiTitle: 'Bovada' },
  { key: 'superbook',    name: 'SuperBook',     domain: 'superbook.com',        region: 'US', apiTitle: 'SuperBook' },
  // ── Australia ─────────────────────────────────────────────────────────
  { key: 'sportsbet_au', name: 'Sportsbet',     domain: 'sportsbet.com.au',     region: 'AU', apiTitle: 'Sportsbet' },
  { key: 'tab_au',       name: 'TAB',           domain: 'tab.com.au',           region: 'AU', apiTitle: 'TAB' },
  { key: 'neds',         name: 'Neds',          domain: 'neds.com.au',          region: 'AU', apiTitle: 'Neds' },
  { key: 'ladbrokes_au', name: 'Ladbrokes AU',  domain: 'ladbrokes.com.au',     region: 'AU', apiTitle: 'Ladbrokes' },
  { key: 'pointsbet_au', name: 'PointsBet AU',  domain: 'pointsbet.com.au',     region: 'AU', apiTitle: 'PointsBet (AU)' },
  { key: 'betr_au',      name: 'Betr',          domain: 'betr.com.au',          region: 'AU', apiTitle: 'Betr' },
];

/** Region label helpers */
export const REGION_LABELS: Record<BookmakerEntry['region'], { tr: string; en: string; color: string }> = {
  UK:     { tr: 'İngiltere',     en: 'UK',        color: '#1e40af' },
  EU:     { tr: 'Avrupa',        en: 'Europe',    color: '#059669' },
  US:     { tr: 'Amerika',       en: 'USA',       color: '#7c3aed' },
  AU:     { tr: 'Avustralya',    en: 'Australia', color: '#d97706' },
  GLOBAL: { tr: 'Global',        en: 'Global',    color: '#0891b2' },
};