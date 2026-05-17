import { useState, useEffect, useCallback } from "react";
import type { BettingOdds, SportOption, LeagueOption } from "../types";
import { transformEvents, buildSportsAndLeagues } from "../services/oddsApi";
import type { TheOddsApiEvent } from "../services/oddsApi";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { MOCK_ODDS, MOCK_SPORTS, MOCK_LEAGUES } from "../data/mockOddsData";

// ─── Backend URL ──────────────────────────────────────────────
const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dbae911f`;
const ODDS_ENDPOINT = `${SERVER_BASE}/odds`;

// Poll every 5 minutes
const POLL_INTERVAL_MS = 5 * 60 * 1_000;

// Sentinel value: mock event IDs always start with "mock_"
const isMockOdds = (o: BettingOdds[]) =>
  o.length > 0 && o[0].eventId.startsWith("mock_");

// ─── Types ────────────────────────────────────────────────────
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

// ─── Hook ─────────────────────────────────────────────────────
// IMPORTANT: hook count / order must stay stable across renders.
// Do NOT add new hooks here without removing an equivalent one.
export function useOddsData(): UseOddsDataReturn {
  const [odds, setOdds]       = useState<BettingOdds[]>([]);
  const [sports, setSports]   = useState<SportOption[]>([]);
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading]               = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // isMockData is derived from current odds — no extra useState needed
  const isMockData = isMockOdds(odds);

  const load = useCallback(async (isInitial = false) => {
    if (!isInitial) setIsLoading(true);
    setError(null);

    // ── Inline mock-fallback helper (no extra useCallback hook) ──
    const applyMock = (_reason?: string) => {
      setOdds(MOCK_ODDS);
      setSports(MOCK_SPORTS);
      setLeagues(MOCK_LEAGUES);
      setLastUpdated(new Date());
    };

    const isApiKeyError = (msg: string) =>
      msg.includes("INVALID_KEY") ||
      msg.includes("401") ||
      msg.includes("API key") ||
      msg.includes("All UK sport requests failed");

    try {
      const res = await fetch(ODDS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        const msg = json.error || `HTTP ${res.status}`;
        if (res.status === 401 || res.status === 502 || isApiKeyError(msg)) {
          applyMock(msg);
          return;
        }
        throw new Error(msg);
      }

      const data = await res.json() as { events?: TheOddsApiEvent[]; error?: string };

      if (data.error) {
        if (isApiKeyError(data.error)) {
          applyMock(data.error);
          return;
        }
        throw new Error(data.error);
      }

      const rawEvents: TheOddsApiEvent[] = Array.isArray(data.events)
        ? data.events
        : [];

      if (rawEvents.length === 0) {
        applyMock("No events returned from API");
        return;
      }

      const bettingOdds = transformEvents(rawEvents);
      const { sports: s, leagues: l } = buildSportsAndLeagues(bettingOdds);

      setOdds(bettingOdds);
      setSports(s);
      setLeagues(l);
      setLastUpdated(new Date());
      console.log(
        `[useOddsData] Loaded ${bettingOdds.length} odds from ${rawEvents.length} real events`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (
        isApiKeyError(message) ||
        message.includes("Failed to fetch") ||
        message.includes("timeout") ||
        message.includes("AbortError")
      ) {
        applyMock(message);
        return;
      }

      console.error("[useOddsData] Error fetching odds:", message);
      setError(message);
      applyMock(message); // still show something useful
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load + polling
  useEffect(() => {
    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const refetch = useCallback(async () => {
    await load(false);
  }, [load]);

  const eventCount = new Set(odds.map((o) => o.eventId)).size;

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
    eventCount,
  };
}