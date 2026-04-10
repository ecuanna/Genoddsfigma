import { useState, useMemo } from "react";
import { Search, Plus, X, Check, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ALL_BOOKMAKERS,
  BookmakerEntry,
  getBookmakerLogo,
  getBookmakerUrl,
  REGION_LABELS,
} from "../data/bookmakers";

interface BookmakerSearchProps {
  favoriteBookmakers: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  isDarkMode: boolean;
  language: "tr" | "en";
  translations: {
    searchBookmakerPlaceholder: string;
    noBookmakersFound: string;
    bookmakerFavorites: string;
    allRegions: string;
    visitSite: string;
    added: string;
  };
}

const REGIONS: Array<BookmakerEntry["region"] | "ALL"> = [
  "ALL", "UK", "EU", "US", "AU", "GLOBAL",
];

export function BookmakerSearch({
  favoriteBookmakers,
  onAdd,
  onRemove,
  isDarkMode,
  language,
  translations,
}: BookmakerSearchProps) {
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<BookmakerEntry["region"] | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_BOOKMAKERS.filter((b) => {
      const matchesQuery = !q || b.name.toLowerCase().includes(q) || b.domain.includes(q);
      const matchesRegion = regionFilter === "ALL" || b.region === regionFilter;
      return matchesQuery && matchesRegion;
    });
  }, [query, regionFilter]);

  const isFavorited = (name: string) =>
    favoriteBookmakers.some((f) => f.toLowerCase() === name.toLowerCase());

  return (
    <div className="flex flex-col gap-2">
      {/* Search Input */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
          isDarkMode
            ? "bg-[#1a1a1a] border-[#2a2a2a] focus-within:border-blue-500/50"
            : "bg-white border-gray-200 focus-within:border-[#022179]/40"
        }`}
      >
        <Search className={`w-3.5 h-3.5 flex-shrink-0 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={translations.searchBookmakerPlaceholder}
          className={`flex-1 bg-transparent text-xs outline-none min-w-0 ${
            isDarkMode ? "text-white placeholder:text-gray-600" : "text-gray-900 placeholder:text-gray-400"
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className={`flex-shrink-0 ${isDarkMode ? "text-gray-600 hover:text-gray-400" : "text-gray-300 hover:text-gray-500"}`}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Region Pills */}
      <div className="flex gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {REGIONS.map((r) => {
          const isActive = regionFilter === r;
          const label = r === "ALL" ? translations.allRegions : REGION_LABELS[r as BookmakerEntry["region"]][language];
          return (
            <button
              key={r}
              onClick={() => setRegionFilter(r)}
              className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full font-medium transition-all ${
                isActive
                  ? isDarkMode
                    ? "bg-blue-500/25 text-blue-300 border border-blue-500/40"
                    : "bg-[#022179] text-white border border-[#022179]"
                  : isDarkMode
                  ? "text-gray-500 border border-[#2a2a2a] hover:text-gray-300 hover:border-[#3a3a3a]"
                  : "text-gray-500 border border-gray-200 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Results list — inline, no overflow clipping issues */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDarkMode ? "border-[#2a2a2a]" : "border-gray-200"
        }`}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-5">
            <p className={`text-xs ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
              {translations.noBookmakersFound}
            </p>
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {filtered.map((bm, idx) => {
              const favored = isFavorited(bm.name);
              return (
                <div
                  key={bm.key}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer group transition-colors ${
                    idx !== 0
                      ? isDarkMode ? "border-t border-[#1e1e1e]" : "border-t border-gray-50"
                      : ""
                  } ${
                    favored
                      ? isDarkMode ? "bg-blue-500/5" : "bg-blue-50/50"
                      : isDarkMode ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-50"
                  }`}
                  onClick={() => (favored ? onRemove(bm.name) : onAdd(bm.name))}
                >
                  {/* Logo */}
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center overflow-hidden ${
                      isDarkMode ? "bg-[#252525]" : "bg-gray-100"
                    }`}
                  >
                    <img
                      src={getBookmakerLogo(bm)}
                      alt={bm.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bm.name)}&background=1e40af&color=fff&size=28&bold=true&length=2`;
                      }}
                    />
                  </div>

                  {/* Name + Region */}
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span
                      className={`text-xs font-medium truncate ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {bm.name}
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{
                        color: REGION_LABELS[bm.region].color,
                        backgroundColor: `${REGION_LABELS[bm.region].color}20`,
                      }}
                    >
                      {REGION_LABELS[bm.region][language]}
                    </span>
                  </div>

                  {/* External link */}
                  <a
                    href={getBookmakerUrl(bm)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all ${
                      isDarkMode ? "text-gray-400 hover:bg-[#2a2a2a]" : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                  </a>

                  {/* Add/Remove toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      favored ? onRemove(bm.name) : onAdd(bm.name);
                    }}
                    className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                      favored
                        ? isDarkMode
                          ? "bg-blue-500/20 text-blue-400 hover:bg-red-500/20 hover:text-red-400"
                          : "bg-[#022179]/10 text-[#022179] hover:bg-red-50 hover:text-red-500"
                        : isDarkMode
                        ? "bg-[#222] text-gray-500 hover:bg-blue-500/20 hover:text-blue-400"
                        : "bg-gray-100 text-gray-400 hover:bg-[#022179]/10 hover:text-[#022179]"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={favored ? "check" : "plus"}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="flex"
                      >
                        {favored ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}