import { Trophy, Crown, Bell, BellRing, ExternalLink, Radio } from "lucide-react";
import type { BettingOdds } from "../types";

// Re-export for backward compatibility
export type { BettingOdds } from "../types";

interface OddsCardProps {
  odds: BettingOdds;
  isDarkMode?: boolean;
  isMatchSaved?: boolean;
  onToggleMatchSave?: () => void;
  saveTitle?: string;
  translations: {
    home: string;
    draw: string;
    away: string;
    sponsored: string;
    bestOdds: string;
    inspect: string;
    liveLabel: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    // Keep old sport/league translation keys for backward compat
    sportFootball: string;
    sportBasketball: string;
    sportTennis: string;
    sportVolleyball: string;
    leagueSuperLig: string;
    leagueLaLiga: string;
    leagueNBA: string;
    leagueWimbledon: string;
    leagueSultanlarLigi: string;
  };
}

function formatRelativeTime(
  isoString: string,
  t: { justNow: string; minutesAgo: string; hoursAgo: string }
): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (isNaN(then) || diffMs < 0) return t.justNow;

  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return t.justNow;
  if (mins < 60) return `${mins} ${t.minutesAgo}`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t.hoursAgo}`;

  return new Date(isoString).toLocaleDateString();
}

export function OddsCard({
  odds,
  isDarkMode = false,
  isMatchSaved = false,
  onToggleMatchSave,
  saveTitle,
  translations,
}: OddsCardProps) {
  const translateSport = (sport: string) => {
    const sportMap: Record<string, string> = {
      Futbol: translations.sportFootball,
      Basketbol: translations.sportBasketball,
      Tenis: translations.sportTennis,
      Voleybol: translations.sportVolleyball,
    };
    return sportMap[sport] || sport;
  };

  const translateLeague = (league: string) => {
    const leagueMap: Record<string, string> = {
      "Süper Lig": translations.leagueSuperLig,
      "La Liga": translations.leagueLaLiga,
      NBA: translations.leagueNBA,
      Wimbledon: translations.leagueWimbledon,
      "Sultanlar Ligi": translations.leagueSultanlarLigi,
    };
    return leagueMap[league] || league;
  };

  const isLive = odds.eventStatus === "live";
  const relativeTime = formatRelativeTime(odds.updatedAt, translations);

  // Bookmark color logic — adapts to card type context
  const bellSavedClass = isDarkMode
    ? "text-blue-400"
    : "text-[#022179]";

  const bellDefaultClass = odds.isBest
    ? isDarkMode
      ? "text-green-800 hover:text-green-500"
      : "text-green-200 hover:text-green-500"
    : odds.isSponsored
    ? isDarkMode
      ? "text-[#3D2E00]/40 hover:text-[#D4AF37]/60"
      : "text-[#D4AF37]/25 hover:text-[#D4AF37]/60"
    : isDarkMode
    ? "text-[#2a2a2a] hover:text-gray-500"
    : "text-gray-200 hover:text-gray-400";

  const handleCTAClick = () => {
    if (odds.affiliateUrl) {
      window.open(odds.affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={`w-full rounded-lg transition-all relative overflow-hidden ${
        odds.isSponsored ? "hover:scale-[1.01] hover:-translate-y-0.5" : ""
      } ${
        odds.isBest
          ? isDarkMode
            ? "bg-[#0a1a0a] border-2 border-green-500 shadow-lg"
            : "bg-green-50 border-2 border-green-500 shadow-lg"
          : odds.isSponsored
          ? isDarkMode
            ? "bg-[#111111] border-2 border-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.15)]"
            : "bg-gradient-to-br from-[#FFFDF7] via-[#FFF9E8] to-[#FFF3D0] border-2 border-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.2)]"
          : isDarkMode
          ? "bg-[#141414] border border-[#2a2a2a]"
          : "bg-white border border-gray-200"
      }`}
    >
      {/* Notification bell — top right corner */}
      {onToggleMatchSave && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMatchSave();
          }}
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-md transition-all ${
            isMatchSaved ? bellSavedClass : bellDefaultClass
          }`}
          title={saveTitle}
        >
          {isMatchSaved ? (
            <BellRing
              className={`w-4 h-4 fill-current ${
                odds.isBest
                  ? "text-green-500"
                  : odds.isSponsored
                  ? "text-[#D4AF37]"
                  : isDarkMode
                  ? "text-blue-400"
                  : "text-[#022179]"
              }`}
            />
          ) : (
            <Bell
              className={`w-4 h-4 ${
                odds.isSponsored
                  ? "text-[#D4AF37]/40"
                  : ""
              }`}
            />
          )}
        </button>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={odds.companyLogo}
                alt={odds.company}
                className={`w-8 h-8 object-contain ${
                  odds.isSponsored
                    ? "ring-2 ring-[#D4AF37]/40 rounded-full"
                    : ""
                }`}
              />
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {odds.company}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  {translations.liveLabel}
                </span>
              )}
              <span
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {relativeTime}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-7">
            {odds.isSponsored && (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#E8C94A] text-[#3D2E00] px-2.5 py-0.5 rounded-full border border-[#C9A84C]/60 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                <Crown className="w-3 h-3" />
                {translations.sponsored}
              </span>
            )}
            {odds.isBest && (
              <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                <Trophy className="w-3 h-3" />
                {translations.bestOdds}
              </div>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="mb-3">
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } mb-1`}
          >
            {translateSport(odds.sport)} • {translateLeague(odds.league)}
          </div>
          <div
            className={`font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {odds.match}
          </div>
        </div>

        {/* Odds */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`${
              odds.isSponsored
                ? isDarkMode
                  ? "bg-[#1C1808]/60 border-[#D4AF37]/30"
                  : "bg-[#FFF9E8] border-[#D4AF37]/40"
                : isDarkMode
                ? "bg-[#1a1a1a] border-[#333333]"
                : "bg-white border-gray-200"
            } rounded-lg p-3 text-center border`}
          >
            <div
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              {translations.home}
            </div>
            <div
              className={`text-lg font-bold ${
                odds.isSponsored
                  ? isDarkMode
                    ? "text-[#E8C94A]"
                    : "text-[#8B7320]"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {odds.odds.home.toFixed(2)}
            </div>
          </div>
          <div
            className={`${
              odds.isSponsored
                ? isDarkMode
                  ? "bg-[#1C1808]/60 border-[#D4AF37]/30"
                  : "bg-[#FFF9E8] border-[#D4AF37]/40"
                : isDarkMode
                ? "bg-[#1a1a1a] border-[#333333]"
                : "bg-white border-gray-200"
            } rounded-lg p-3 text-center border`}
          >
            <div
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              {translations.draw}
            </div>
            <div
              className={`text-lg font-bold ${
                odds.isSponsored
                  ? isDarkMode
                    ? "text-[#E8C94A]"
                    : "text-[#8B7320]"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {odds.odds.draw.toFixed(2)}
            </div>
          </div>
          <div
            className={`${
              odds.isSponsored
                ? isDarkMode
                  ? "bg-[#1C1808]/60 border-[#D4AF37]/30"
                  : "bg-[#FFF9E8] border-[#D4AF37]/40"
                : isDarkMode
                ? "bg-[#1a1a1a] border-[#333333]"
                : "bg-white border-gray-200"
            } rounded-lg p-3 text-center border`}
          >
            <div
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-1`}
            >
              {translations.away}
            </div>
            <div
              className={`text-lg font-bold ${
                odds.isSponsored
                  ? isDarkMode
                    ? "text-[#E8C94A]"
                    : "text-[#8B7320]"
                  : isDarkMode
                  ? "text-white"
                  : "text-gray-900"
              }`}
            >
              {odds.odds.away.toFixed(2)}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCTAClick}
          className={`w-full mt-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1.5 ${
            odds.isBest
              ? "bg-green-600 hover:bg-green-700 text-white"
              : odds.isSponsored
              ? "bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] hover:from-[#B8962E] hover:to-[#C5A028] text-white shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
              : isDarkMode
              ? "bg-[#1e1e1e] hover:bg-[#262626] text-gray-400"
              : "bg-gray-200 hover:bg-gray-300 text-gray-500"
          }`}
        >
          {translations.inspect}
          {odds.affiliateUrl && <ExternalLink className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
