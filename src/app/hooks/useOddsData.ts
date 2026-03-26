import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchOddsData,
  getPollingInterval,
  ApiError,
  type OddsDataResult,
} from "../services/oddsApi";
import type { BettingOdds, SportOption, LeagueOption } from "../types";

export interface UseOddsDataReturn {
  odds: BettingOdds[];
  sports: SportOption[];
  leagues: LeagueOption[];
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  /** Always false — we only use the real API now */
  isMockData: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  eventCount: number;
}

export function useOddsData(): UseOddsDataReturn {
  const [odds, setOdds] = useState<BettingOdds[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isInitial = false, force = false) => {
    if (isInitial) setIsLoading(true);

    try {
      const result: OddsDataResult = await fetchOddsData({ force });

      if (!mountedRef.current) return;

      setOdds(result.odds);
      setSports(result.sports);
      setLeagues(result.leagues);
      setError(null);
      setLastUpdated(new Date());

      const uniqueEvents = new Set(result.odds.map((o) => o.eventId));
      setEventCount(uniqueEvents.size);

      // Schedule next poll
      const interval = getPollingInterval(result.odds);
      pollingRef.current = setTimeout(() => fetchData(false, false), interval);
    } catch (err) {
      if (!mountedRef.current) return;

      const message =
        err instanceof ApiError
          ? `API ${err.status}: ${err.message}`
          : err instanceof Error
          ? err.message
          : "Bilinmeyen hata";

      setError(message);
      // Retry after 20 seconds on error
      pollingRef.current = setTimeout(() => fetchData(false, false), 20_000);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        if (isInitial) setIsInitialLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    if (pollingRef.current) clearTimeout(pollingRef.current);
    setIsLoading(true);
    setError(null);
    await fetchData(false, true);
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(true, false);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [fetchData]);

  return {
    odds,
    sports,
    leagues,
    isLoading,
    isInitialLoading,
    error,
    isMockData: false, // Always using real API
    lastUpdated,
    refetch,
    eventCount,
  };
}
