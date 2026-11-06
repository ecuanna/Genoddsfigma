import { useCallback, useEffect, useRef, useState } from "react";
import type { BettingOdds, LeagueOption, SportOption } from "../types";
import { transformEvents } from "../services/oddsApi";
import type { TheOddsApiEvent } from "../services/oddsApi";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { MOCK_ODDS } from "../data/mockOddsData";
import { CURATED_LEAGUES, CURATED_SPORTS } from "../data/sportCatalog";

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dbae911f`;
const ODDS_ENDPOINT = `${SERVER_BASE}/odds`;
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1_000;

type CachedPayload = {
  events: TheOddsApiEvent[];
  fetchedAt: string;
};

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

const cacheKey = (sportKey: string) => `genodds:odds:${sportKey}`;

function readClientCache(sportKey: string): CachedPayload | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(sportKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (Date.now() - Date.parse(parsed.fetchedAt) > CLIENT_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeClientCache(sportKey: string, payload: CachedPayload) {
  try {
    sessionStorage.setItem(cacheKey(sportKey), JSON.stringify(payload));
  } catch {
    // Storage may be unavailable; server-side caching still protects quota.
  }
}

export function useOddsData(sportKey: string): UseOddsDataReturn {
  const [odds, setOdds] = useState<BettingOdds[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const requestId = useRef(0);

  const applyEvents = useCallback((events: TheOddsApiEvent[], fetchedAt: string, id: number) => {
    if (id !== requestId.current) return;
    setOdds(transformEvents(events));
    setIsMockData(false);
    setLastUpdated(new Date(fetchedAt));
  }, []);

  const applyMock = useCallback((selectedSportKey: string, id: number) => {
    if (id !== requestId.current) return;
    const matching = MOCK_ODDS.filter((item) => item.leagueId === selectedSportKey);
    setOdds(matching);
    setIsMockData(true);
    setLastUpdated(new Date());
  }, []);

  const load = useCallback(async (isInitial = false, preferClientCache = true) => {
    const id = ++requestId.current;
    if (!isInitial) setIsLoading(true);
    setError(null);

    if (preferClientCache) {
      const cached = readClientCache(sportKey);
      if (cached) {
        applyEvents(cached.events, cached.fetchedAt, id);
        setIsInitialLoading(false);
        setIsLoading(false);
        return;
      }
    }

    try {
      const url = new URL(ODDS_ENDPOINT);
      url.searchParams.set("sport", sportKey);
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(15_000),
      });

      const data = await response.json().catch(() => ({})) as {
        events?: TheOddsApiEvent[];
        fetchedAt?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error || `HTTP_${response.status}`);

      const events = Array.isArray(data.events) ? data.events : [];
      const fetchedAt = data.fetchedAt || new Date().toISOString();
      writeClientCache(sportKey, { events, fetchedAt });
      applyEvents(events, fetchedAt, id);
    } catch (loadError) {
      if (id !== requestId.current) return;
      const message = loadError instanceof Error ? loadError.message : String(loadError);
      setError(message);
      applyMock(sportKey, id);
    } finally {
      if (id === requestId.current) {
        setIsInitialLoading(false);
        setIsLoading(false);
      }
    }
  }, [applyEvents, applyMock, sportKey]);

  // One request on initial load and one when the user selects another league.
  // There is intentionally no background polling.
  useEffect(() => {
    setIsInitialLoading(true);
    void load(true, true);
  }, [load]);

  const refetch = useCallback(async () => {
    await load(false, false);
  }, [load]);

  return {
    odds,
    sports: CURATED_SPORTS,
    leagues: CURATED_LEAGUES,
    isLoading,
    isInitialLoading,
    error,
    isMockData,
    lastUpdated,
    refetch,
    eventCount: new Set(odds.map((item) => item.eventId)).size,
  };
}
