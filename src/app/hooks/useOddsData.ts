import { useState, useEffect } from "react";
import type { BettingOdds, SportOption, LeagueOption } from "../types";
import { MOCK_ODDS, MOCK_SPORTS, MOCK_LEAGUES } from "../mockData";

export interface UseOddsDataReturn {
  odds: BettingOdds[];
  sports: SportOption[];
  leagues: LeagueOption[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  isMockData: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  eventCount: number;
}

export function useOddsData(): UseOddsDataReturn {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simüle edilmiş kısa yükleme (UX için)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
      setLastUpdated(new Date());
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const eventCount = new Set(MOCK_ODDS.map((o) => o.eventId)).size;

  const refetch = async () => {
    setLastUpdated(new Date());
  };

  return {
    odds: MOCK_ODDS,
    sports: MOCK_SPORTS,
    leagues: MOCK_LEAGUES,
    isLoading: false,
    isInitialLoading,
    error: null,
    isMockData: true,
    lastUpdated,
    refetch,
    eventCount,
  };
}
