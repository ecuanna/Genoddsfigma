import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Logger
app.use("*", logger(console.log));

// CORS — open for all origins
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ─── Health check ──────────────────────────────────────────────────────────
app.get("/make-server-dbae911f/health", (c) => {
  return c.json({ status: "ok", ts: new Date().toISOString() });
});

// ─── UK / England Football League Keys ────────────────────────────────────
// Only England-specific leagues are fetched.
const UK_SPORT_KEYS: string[] = [
  "soccer_epl",               // English Premier League
  "soccer_england_championship", // Championship
  "soccer_england_efl_cup",   // EFL Cup (Carabao Cup)
  "soccer_england_fa_cup",    // FA Cup
  "soccer_england_league1",   // League 1
];

// ─── In-memory cache (kept warm between requests on the same instance) ────
interface OddsCache {
  events: unknown[];
  cachedAt: number;
}
let _cache: OddsCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

// ─── Fetch UK odds from The Odds API ──────────────────────────────────────
async function fetchUKOdds(apiKey: string, force = false): Promise<unknown[]> {
  const age = _cache ? Date.now() - _cache.cachedAt : Infinity;

  if (!force && _cache && age < CACHE_TTL_MS) {
    console.log(`[odds] Cache hit — age ${Math.round(age / 1000)}s`);
    return _cache.events;
  }

  console.log("[odds] Fetching fresh data from The Odds API…");

  const results = await Promise.allSettled(
    UK_SPORT_KEYS.map(async (sportKey) => {
      const url = new URL(
        `https://api.the-odds-api.com/v4/sports/${sportKey}/odds`,
      );
      url.searchParams.set("apiKey", apiKey);
      url.searchParams.set("regions", "uk,eu");
      url.searchParams.set("markets", "h2h");
      url.searchParams.set("oddsFormat", "decimal");

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) {
        // 404 / 422 → no active events for this sport right now — not an error
        if (res.status === 404 || res.status === 422) return [];
        const text = await res.text().catch(() => "");
        throw new Error(
          `Odds API ${res.status} for ${sportKey}: ${text.slice(0, 300)}`,
        );
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }),
  );

  const allEvents: unknown[] = [];
  const errors: string[] = [];

  for (const r of results) {
    if (r.status === "fulfilled") {
      allEvents.push(...r.value);
    } else {
      const msg = r.reason instanceof Error
        ? r.reason.message
        : String(r.reason);
      errors.push(msg);
      console.log("[odds] Sport fetch error:", msg);
    }
  }

  // Only throw if every single request failed AND we got zero events
  if (allEvents.length === 0 && errors.length === UK_SPORT_KEYS.length) {
    throw new Error(`All UK sport requests failed. First: ${errors[0]}`);
  }

  _cache = { events: allEvents, cachedAt: Date.now() };
  console.log(`[odds] Cached ${allEvents.length} events (${UK_SPORT_KEYS.length - errors.length}/${UK_SPORT_KEYS.length} sports OK)`);
  return allEvents;
}

// ─── GET /odds ─────────────────────────────────────────────────────────────
app.get("/make-server-dbae911f/odds", async (c) => {
  // Prefer the secret; fall back to the key already embedded in the frontend
  const apiKey =
    Deno.env.get("ODDS_API_KEY") ||
    "9341c1e0914b8a3b6efe5a0d74764620";

  const force = c.req.query("force") === "1";

  try {
    const events = await fetchUKOdds(apiKey, force);
    return c.json({
      events,
      eventCount: events.length,
      cachedAt: _cache?.cachedAt
        ? new Date(_cache.cachedAt).toISOString()
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log("[odds] Handler error:", message);
    return c.json(
      { error: `Failed to fetch odds: ${message}` },
      502,
    );
  }
});

Deno.serve(app.fetch);