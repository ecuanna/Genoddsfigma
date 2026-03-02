import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchOddsData,
  getPollingInterval,
  ApiError,
  type OddsDataResult,
} from "../services/oddsApi";
import type { BettingOdds, SportOption, LeagueOption } from "../types";

export interface UseOddsDataReturn {
  /** All odds entries (unfiltered, from API/mock) */
  odds: BettingOdds[];
  /** Available sports from the data source */
  sports: SportOption[];
  /** Available leagues from the data source */
  leagues: LeagueOption[];
  /** True during initial load or background refetch */
  isLoading: boolean;
  /** True only during the very first load (no data yet) */
  isInitialLoading: boolean;
  /** Error message if the last fetch failed */
  error: string | null;
  /** Whether we're using mock/fallback data */
  isMockData: boolean;
  /** Last successful update timestamp */
  lastUpdated: Date | null;
  /** Manually trigger a refetch */
  refetch: () => Promise<void>;
}

export function useOddsData(): UseOddsDataReturn {
  const [odds, setOdds] = useState<BettingOdds[]>([]);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);

    try {
      const result: OddsDataResult = await fetchOddsData();

      if (!mountedRef.current) return;

      setOdds(result.odds);
      setSports(result.sports);
      setLeagues(result.leagues);
      setError(null);
      setIsMockData(!import.meta.env.VITE_ODDS_API_URL);
      setLastUpdated(new Date());

      // Schedule next poll based on live/upcoming events
      const interval = getPollingInterval(result.odds);
      pollingRef.current = setTimeout(() => fetchData(false), interval);
    } catch (err) {
      if (!mountedRef.current) return;

      const message =
        err instanceof ApiError
          ? `API ${err.status}: ${err.message}`
          : err instanceof Error
          ? err.message
          : "Unknown error";

      setError(message);

      // On error, retry after 10 seconds
      pollingRef.current = setTimeout(() => fetchData(false), 10_000);
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
    await fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(true);

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
    isMockData,
    lastUpdated,
    refetch,
  };
}
