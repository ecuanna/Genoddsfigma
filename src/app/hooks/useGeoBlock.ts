import { useState, useEffect } from "react";

export type GeoStatus = "checking" | "allowed" | "blocked";

const CACHE_KEY = "genodds_geo_status";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CachedGeo {
  status: "allowed" | "blocked";
  ts: number;
  country?: string;
}

async function detectCountry(): Promise<string | null> {
  // Primary: api.country.is — no-key, CORS-friendly
  try {
    const res = await fetch("https://api.country.is/", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.country) return String(data.country).toUpperCase();
    }
  } catch { /* fall through */ }

  // Fallback: freeipapi.com
  try {
    const res = await fetch("https://freeipapi.com/api/json/", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.countryCode) return String(data.countryCode).toUpperCase();
    }
  } catch { /* fall through */ }

  return null; // Can't determine — fail open (allow)
}

const BLOCKED_COUNTRIES = new Set(["TR"]);

export function useGeoBlock(): { status: GeoStatus; country: string | null } {
  const [status, setStatus] = useState<GeoStatus>("checking");
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    // Keep production restrictions intact while allowing local UI QA.
    if (import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      setStatus("allowed");
      setCountry("LOCAL");
      return;
    }

    // Check sessionStorage cache first
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedGeo = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL) {
          setStatus(cached.status);
          setCountry(cached.country ?? null);
          return;
        }
      }
    } catch { /* ignore parse errors */ }

    let cancelled = false;

    detectCountry().then((c) => {
      if (cancelled) return;
      const resolved = c ?? null;
      const blocked = resolved !== null && BLOCKED_COUNTRIES.has(resolved);
      const newStatus = blocked ? "blocked" : "allowed";
      setStatus(newStatus);
      setCountry(resolved);

      // Cache result
      try {
        const cached: CachedGeo = { status: newStatus, ts: Date.now(), country: resolved ?? undefined };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      } catch { /* ignore */ }
    });

    return () => { cancelled = true; };
  }, []);

  return { status, country };
}
