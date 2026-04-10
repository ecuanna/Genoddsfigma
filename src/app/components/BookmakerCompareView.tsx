import { useMemo } from "react";
import { Building2, ExternalLink, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { BettingOdds } from "../types";
import {
  ALL_BOOKMAKERS,
  getBookmakerLogo,
  getBookmakerUrl,
  matchesBookmaker,
  REGION_LABELS,
} from "../data/bookmakers";

interface BookmakerCompareViewProps {
  allOdds: BettingOdds[];
  favoriteBookmakers: string[];
  isDarkMode: boolean;
  language: "tr" | "en";
  translations: {
    noFavBookmakers: string;
    noOddsForBookmakers: string;
    noOddsForBookmakersDesc: string;
    home: string;
    draw: string;
    away: string;
    bestOdds: string;
    visitSite: string;
    matchCount: string;
    addBookmakersHint: string;
  };
}

interface MatchRow {
  match: string;
  league: string;
  eventStartTime: string;
  eventStatus: "upcoming" | "live" | "finished";
  byBookmaker: Record<string, { home: number; draw: number; away: number; affiliateUrl: string }>;
}

function OddsCell({ value, isBest, isDarkMode }: { value: number; isBest: boolean; isDarkMode: boolean }) {
  if (!value || value === 0) {
    return <span className={`text-[11px] ${isDarkMode ? "text-gray-700" : "text-gray-300"}`}>—</span>;
  }
  return (
    <span
      className={`text-[11px] font-bold tabular-nums ${
        isBest ? "text-green-500" : isDarkMode ? "text-gray-200" : "text-gray-800"
      }`}
    >
      {value.toFixed(2)}
    </span>
  );
}

export function BookmakerCompareView({
  allOdds,
  favoriteBookmakers,
  isDarkMode,
  language,
  translations,
}: BookmakerCompareViewProps) {

  const { rows, columns, allFavMeta } = useMemo(() => {
    if (favoriteBookmakers.length === 0) {
      return { rows: [], columns: [], allFavMeta: [] };
    }

    // Build match rows for any bookmaker that has API data
    const matchMap = new Map<string, MatchRow>();
    for (const odd of allOdds) {
      const matchingFav = favoriteBookmakers.find((fav) => matchesBookmaker(fav, odd.company));
      if (!matchingFav) continue;

      if (!matchMap.has(odd.match)) {
        matchMap.set(odd.match, {
          match: odd.match,
          league: odd.league,
          eventStartTime: odd.eventStartTime,
          eventStatus: odd.eventStatus,
          byBookmaker: {},
        });
      }
      matchMap.get(odd.match)!.byBookmaker[matchingFav] = {
        home: odd.odds.home,
        draw: odd.odds.draw,
        away: odd.odds.away,
        affiliateUrl: odd.affiliateUrl,
      };
    }

    const rows = Array.from(matchMap.values()).sort(
      (a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime()
    );

    // Only use bookmakers that appear in at least one match row as columns
    const bookmakersWithData = new Set<string>();
    for (const row of rows) {
      Object.keys(row.byBookmaker).forEach((k) => bookmakersWithData.add(k));
    }

    // Maintain original order from favoriteBookmakers
    const columns = favoriteBookmakers.filter((name) => bookmakersWithData.has(name));

    // Meta for ALL favorites (for the "all sites" header display)
    const allFavMeta = favoriteBookmakers.map((name) => {
      const entry = ALL_BOOKMAKERS.find((b) => b.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        logo: entry ? getBookmakerLogo(entry) : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=32&bold=true&length=2`,
        url: entry ? getBookmakerUrl(entry) : "#",
        region: entry?.region ?? ("GLOBAL" as const),
        hasOdds: bookmakersWithData.has(name),
      };
    });

    return { rows, columns, allFavMeta };
  }, [allOdds, favoriteBookmakers]);

  // Best odds per match per outcome
  const bestOddsMap = useMemo(() => {
    const map = new Map<string, { home: string; draw: string; away: string }>();
    for (const row of rows) {
      const vals = (key: "home" | "draw" | "away") =>
        columns.map((c) => row.byBookmaker[c]?.[key] ?? 0).filter((v) => v > 0);

      const bestHome = Math.max(...(vals("home").length ? vals("home") : [0]));
      const bestDraw = Math.max(...(vals("draw").length ? vals("draw") : [0]));
      const bestAway = Math.max(...(vals("away").length ? vals("away") : [0]));

      map.set(row.match, {
        home: columns.find((c) => row.byBookmaker[c]?.home === bestHome && bestHome > 0) ?? "",
        draw: columns.find((c) => row.byBookmaker[c]?.draw === bestDraw && bestDraw > 0) ?? "",
        away: columns.find((c) => row.byBookmaker[c]?.away === bestAway && bestAway > 0) ?? "",
      });
    }
    return map;
  }, [rows, columns]);

  // ── No favorites ────────────────────────────────────────────
  if (favoriteBookmakers.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
          <Building2 className={`w-8 h-8 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`} />
        </div>
        <div className="text-center">
          <p className={`font-semibold mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
            {translations.noFavBookmakers}
          </p>
          <p className={`text-sm max-w-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
            {translations.addBookmakersHint}
          </p>
        </div>
      </div>
    );
  }

  // ── Favorite bookmakers header strip ────────────────────────
  const siteStrip = (
    <div className={`flex flex-wrap gap-2 px-4 py-3 border-b ${isDarkMode ? "border-[#1e1e1e] bg-[#0d0d0d]" : "border-gray-100 bg-gray-50"}`}>
      {allFavMeta.map((bm) => (
        <a
          key={bm.name}
          href={bm.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            bm.hasOdds
              ? isDarkMode
                ? "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-200 hover:border-blue-500/30 hover:text-blue-300"
                : "bg-white border border-gray-200 text-gray-700 hover:border-[#022179]/30 hover:text-[#022179] shadow-sm"
              : isDarkMode
              ? "bg-[#141414] border border-[#1e1e1e] text-gray-600"
              : "bg-gray-50 border border-gray-150 text-gray-400"
          }`}
        >
          <img
            src={bm.logo}
            alt={bm.name}
            className="w-4 h-4 object-contain flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bm.name)}&background=1e40af&color=fff&size=16&bold=true&length=2`;
            }}
          />
          <span className="truncate max-w-[80px]">{bm.name}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-40 flex-shrink-0" />
        </a>
      ))}
    </div>
  );

  // ── No API data for any favorite ────────────────────────────
  if (columns.length === 0) {
    return (
      <div>
        {siteStrip}
        <div className="py-12 flex flex-col items-center gap-3">
          <TrendingUp className={`w-7 h-7 ${isDarkMode ? "text-gray-700" : "text-gray-300"}`} />
          <p className={`font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
            {translations.noOddsForBookmakers}
          </p>
          <p className={`text-sm text-center max-w-sm ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
            {translations.noOddsForBookmakersDesc}
          </p>
        </div>
      </div>
    );
  }

  // ── Stats ────────────────────────────────────────────────────
  const statsBar = (
    <div className={`flex items-center gap-3 px-4 py-2 border-b text-xs ${isDarkMode ? "border-[#1e1e1e] bg-[#0a0a0a]" : "border-gray-100 bg-gray-50/50"}`}>
      <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
        <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{rows.length}</span>{" "}
        {translations.matchCount}
      </span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDarkMode ? "bg-green-500/10 text-green-400" : "bg-green-100 text-green-600"}`}>
        {language === "tr" ? "CANLI VERİ" : "LIVE DATA"}
      </span>
    </div>
  );

  // ── Column meta (only bookmakers with data) ─────────────────
  const colMeta = columns.map((name) => {
    const entry = ALL_BOOKMAKERS.find((b) => b.name.toLowerCase() === name.toLowerCase());
    return {
      name,
      logo: entry ? getBookmakerLogo(entry) : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=32&bold=true&length=2`,
      url: entry ? getBookmakerUrl(entry) : "#",
      region: entry?.region ?? ("GLOBAL" as const),
    };
  });

  const COL_W = 120; // px per bookmaker column
  const MATCH_COL_W = 160; // px for match column

  return (
    <div>
      {siteStrip}
      {statsBar}

      {/* Table */}
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
        <div style={{ minWidth: MATCH_COL_W + colMeta.length * COL_W }}>

          {/* Header row */}
          <div
            className={`flex border-b ${isDarkMode ? "bg-[#141414] border-[#1e1e1e]" : "bg-white border-gray-100"}`}
            style={{ position: "sticky", top: 0, zIndex: 10 }}
          >
            {/* Match column header */}
            <div
              className={`flex-shrink-0 flex items-end px-4 pb-2 pt-3 text-xs font-semibold border-r ${
                isDarkMode ? "text-gray-500 border-[#1e1e1e] bg-[#141414]" : "text-gray-400 border-gray-100 bg-white"
              }`}
              style={{ width: MATCH_COL_W, position: "sticky", left: 0, zIndex: 11 }}
            >
              {language === "tr" ? "Maç" : "Match"}
            </div>

            {/* Bookmaker column headers */}
            {colMeta.map((bm) => (
              <div
                key={bm.name}
                className={`flex-shrink-0 border-r last:border-r-0 px-2 pt-2 pb-2 ${
                  isDarkMode ? "border-[#1e1e1e]" : "border-gray-100"
                }`}
                style={{ width: COL_W }}
              >
                <a
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${isDarkMode ? "bg-[#252525]" : "bg-gray-100"}`}>
                    <img
                      src={bm.logo}
                      alt={bm.name}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bm.name)}&background=1e40af&color=fff&size=32&bold=true&length=2`;
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold text-center truncate w-full text-center group-hover:underline ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {bm.name}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      color: REGION_LABELS[bm.region].color,
                      backgroundColor: `${REGION_LABELS[bm.region].color}20`,
                    }}
                  >
                    {REGION_LABELS[bm.region][language]}
                  </span>
                </a>
                {/* Sub-header: 1 X 2 */}
                <div className={`flex justify-around mt-2 pt-2 border-t text-[10px] font-semibold ${isDarkMode ? "border-[#1e1e1e] text-gray-600" : "border-gray-100 text-gray-400"}`}>
                  <span className="w-8 text-center">1</span>
                  <span className="w-8 text-center">X</span>
                  <span className="w-8 text-center">2</span>
                </div>
              </div>
            ))}
          </div>

          {/* Match rows */}
          {rows.map((row, idx) => {
            const best = bestOddsMap.get(row.match) ?? { home: "", draw: "", away: "" };
            const teams = row.match.split(" - ");
            const isLive = row.eventStatus === "live";

            return (
              <motion.div
                key={row.match}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.015 }}
                className={`flex border-b transition-colors ${
                  isDarkMode
                    ? "border-[#1a1a1a] hover:bg-[#101010]"
                    : "border-gray-50 hover:bg-gray-50/60"
                }`}
              >
                {/* Match cell — sticky left */}
                <div
                  className={`flex-shrink-0 px-4 py-3 border-r ${
                    isDarkMode ? "bg-[#141414] border-[#1e1e1e]" : "bg-white border-gray-100"
                  }`}
                  style={{ width: MATCH_COL_W, position: "sticky", left: 0, zIndex: 5 }}
                >
                  {isLive && (
                    <div className="flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-red-500">
                        {language === "tr" ? "CANLI" : "LIVE"}
                      </span>
                    </div>
                  )}
                  <p className={`text-[11px] font-semibold leading-snug ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {teams[0]}
                  </p>
                  <p className={`text-[10px] my-0.5 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}>vs</p>
                  <p className={`text-[11px] font-semibold leading-snug ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {teams[1] ?? ""}
                  </p>
                  <p className={`text-[9px] mt-1 truncate ${isDarkMode ? "text-gray-700" : "text-gray-400"}`}>
                    {row.league}
                  </p>
                </div>

                {/* Bookmaker cells */}
                {colMeta.map((bm) => {
                  const data = row.byBookmaker[bm.name];
                  return (
                    <div
                      key={bm.name}
                      className={`flex-shrink-0 border-r last:border-r-0 ${isDarkMode ? "border-[#1a1a1a]" : "border-gray-50"}`}
                      style={{ width: COL_W }}
                    >
                      {data ? (
                        <a
                          href={data.affiliateUrl || bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-around h-full py-3 px-1 group"
                        >
                          {(["home", "draw", "away"] as const).map((outcome) => {
                            const val = data[outcome];
                            const isBest =
                              outcome === "home" ? best.home === bm.name :
                              outcome === "draw" ? best.draw === bm.name :
                              best.away === bm.name;
                            return (
                              <div
                                key={outcome}
                                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                                  isBest && val > 0
                                    ? isDarkMode ? "bg-green-500/15" : "bg-green-50"
                                    : "group-hover:bg-black/5"
                                }`}
                              >
                                <OddsCell value={val} isBest={isBest && val > 0} isDarkMode={isDarkMode} />
                              </div>
                            );
                          })}
                        </a>
                      ) : (
                        <div className="flex items-center justify-center h-full py-3">
                          <span className={`text-xs ${isDarkMode ? "text-gray-800" : "text-gray-200"}`}>—</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
