// Raw mock data shape — the service layer transforms this into full BettingOdds
export interface RawMockOdds {
  id: string;
  company: string;
  companyLogo: string;
  match: string;
  league: string;
  sport: string;
  odds: { home: number; draw: number; away: number };
  isBest: boolean;
  isSponsored?: boolean;
  timestamp: string;
}

export const mockBettingData: RawMockOdds[] = [
  // Fenerbahçe - Galatasaray
  {
    id: "1",
    company: "Bets10",
    companyLogo: "https://via.placeholder.com/80x80/1e40af/ffffff?text=B10",
    match: "Fenerbahçe - Galatasaray",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 2.45, draw: 3.20, away: 2.85 },
    isBest: true,
    timestamp: "5 dakika önce",
  },
  {
    id: "2",
    company: "Nesine",
    companyLogo: "https://via.placeholder.com/80x80/dc2626/ffffff?text=NSN",
    match: "Fenerbahçe - Galatasaray",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 2.35, draw: 3.15, away: 2.80 },
    isBest: false,
    isSponsored: true,
    timestamp: "8 dakika önce",
  },
  {
    id: "3",
    company: "Bilyoner",
    companyLogo: "https://via.placeholder.com/80x80/059669/ffffff?text=BLY",
    match: "Fenerbahçe - Galatasaray",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 2.30, draw: 3.10, away: 2.90 },
    isBest: false,
    timestamp: "10 dakika önce",
  },
  {
    id: "4",
    company: "Misli",
    companyLogo: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=MSL",
    match: "Fenerbahçe - Galatasaray",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 2.25, draw: 3.05, away: 2.95 },
    isBest: false,
    timestamp: "12 dakika önce",
  },

  // Beşiktaş - Trabzonspor
  {
    id: "5",
    company: "Bets10",
    companyLogo: "https://via.placeholder.com/80x80/1e40af/ffffff?text=B10",
    match: "Beşiktaş - Trabzonspor",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 1.95, draw: 3.40, away: 3.75 },
    isBest: true,
    timestamp: "3 dakika önce",
  },
  {
    id: "6",
    company: "Nesine",
    companyLogo: "https://via.placeholder.com/80x80/dc2626/ffffff?text=NSN",
    match: "Beşiktaş - Trabzonspor",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 1.90, draw: 3.35, away: 3.70 },
    isBest: false,
    isSponsored: true,
    timestamp: "6 dakika önce",
  },
  {
    id: "7",
    company: "Bilyoner",
    companyLogo: "https://via.placeholder.com/80x80/059669/ffffff?text=BLY",
    match: "Beşiktaş - Trabzonspor",
    league: "Süper Lig",
    sport: "Futbol",
    odds: { home: 1.88, draw: 3.30, away: 3.80 },
    isBest: false,
    timestamp: "7 dakika önce",
  },

  // Lakers - Warriors (Basketbol)
  {
    id: "8",
    company: "Misli",
    companyLogo: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=MSL",
    match: "Lakers - Warriors",
    league: "NBA",
    sport: "Basketbol",
    odds: { home: 1.75, draw: 0, away: 2.05 },
    isBest: true,
    timestamp: "15 dakika önce",
  },
  {
    id: "9",
    company: "Bets10",
    companyLogo: "https://via.placeholder.com/80x80/1e40af/ffffff?text=B10",
    match: "Lakers - Warriors",
    league: "NBA",
    sport: "Basketbol",
    odds: { home: 1.70, draw: 0, away: 2.10 },
    isBest: false,
    isSponsored: true,
    timestamp: "18 dakika önce",
  },
  {
    id: "10",
    company: "Nesine",
    companyLogo: "https://via.placeholder.com/80x80/dc2626/ffffff?text=NSN",
    match: "Lakers - Warriors",
    league: "NBA",
    sport: "Basketbol",
    odds: { home: 1.72, draw: 0, away: 2.08 },
    isBest: false,
    timestamp: "20 dakika önce",
  },

  // Real Madrid - Barcelona
  {
    id: "11",
    company: "Bilyoner",
    companyLogo: "https://via.placeholder.com/80x80/059669/ffffff?text=BLY",
    match: "Real Madrid - Barcelona",
    league: "La Liga",
    sport: "Futbol",
    odds: { home: 2.10, draw: 3.50, away: 3.20 },
    isBest: true,
    timestamp: "1 saat önce",
  },
  {
    id: "12",
    company: "Misli",
    companyLogo: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=MSL",
    match: "Real Madrid - Barcelona",
    league: "La Liga",
    sport: "Futbol",
    odds: { home: 2.05, draw: 3.45, away: 3.25 },
    isBest: false,
    isSponsored: true,
    timestamp: "1 saat önce",
  },
  {
    id: "13",
    company: "Bets10",
    companyLogo: "https://via.placeholder.com/80x80/1e40af/ffffff?text=B10",
    match: "Real Madrid - Barcelona",
    league: "La Liga",
    sport: "Futbol",
    odds: { home: 2.00, draw: 3.40, away: 3.30 },
    isBest: false,
    timestamp: "1 saat önce",
  },

  // Djokovic - Alcaraz (Tenis)
  {
    id: "14",
    company: "Nesine",
    companyLogo: "https://via.placeholder.com/80x80/dc2626/ffffff?text=NSN",
    match: "Djokovic - Alcaraz",
    league: "Wimbledon",
    sport: "Tenis",
    odds: { home: 1.85, draw: 0, away: 1.95 },
    isBest: true,
    timestamp: "2 saat önce",
  },
  {
    id: "15",
    company: "Bets10",
    companyLogo: "https://via.placeholder.com/80x80/1e40af/ffffff?text=B10",
    match: "Djokovic - Alcaraz",
    league: "Wimbledon",
    sport: "Tenis",
    odds: { home: 1.80, draw: 0, away: 2.00 },
    isBest: false,
    isSponsored: true,
    timestamp: "2 saat önce",
  },

  // VakıfBank - Eczacıbaşı (Voleybol)
  {
    id: "16",
    company: "Bilyoner",
    companyLogo: "https://via.placeholder.com/80x80/059669/ffffff?text=BLY",
    match: "VakıfBank - Eczacıbaşı",
    league: "Sultanlar Ligi",
    sport: "Voleybol",
    odds: { home: 1.55, draw: 0, away: 2.35 },
    isBest: true,
    timestamp: "30 dakika önce",
  },
  {
    id: "17",
    company: "Misli",
    companyLogo: "https://via.placeholder.com/80x80/7c3aed/ffffff?text=MSL",
    match: "VakıfBank - Eczacıbaşı",
    league: "Sultanlar Ligi",
    sport: "Voleybol",
    odds: { home: 1.50, draw: 0, away: 2.40 },
    isBest: false,
    isSponsored: true,
    timestamp: "35 dakika önce",
  },
];
