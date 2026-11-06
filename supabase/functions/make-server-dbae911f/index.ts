import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Retry-After"],
    maxAge: 600,
  }),
);

const ALLOWED_SPORT_KEYS = new Set([
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "basketball_nba",
  "basketball_euroleague",
  "tennis_atp_paris_masters",
  "icehockey_nhl",
  "baseball_mlb",
]);

const DEFAULT_BOOKMAKERS = [
  "betfair_ex_uk",
  "betfair_sb_uk",
  "williamhill",
  "unibet_uk",
  "sport888",
  "paddypower",
];

const BOOKMAKERS = (Deno.env.get("ODDS_BOOKMAKERS")?.split(",") ?? DEFAULT_BOOKMAKERS)
  .map((value) => value.trim())
  .filter(Boolean)
  .slice(0, 10);

const BLOCKED_COUNTRIES = new Set(
  (Deno.env.get("BLOCKED_COUNTRIES") ?? "TR")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean),
);

const CACHE_TTL_MS = 5 * 60 * 1_000;
const STALE_TTL_MS = 15 * 60 * 1_000;
const RATE_LIMIT_PER_MINUTE = 30;
const MAX_EVENTS = 20;

interface OddsCache {
  events: unknown[];
  fetchedAt: number;
  quotaRemaining?: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

const cache = new Map<string, OddsCache>();
const inFlight = new Map<string, Promise<OddsCache>>();
const rateBuckets = new Map<string, RateBucket>();

const getCountry = (headers: Headers) =>
  (headers.get("cf-ipcountry") || headers.get("x-vercel-ip-country") || "").toUpperCase();

const checkRateLimit = (headers: Headers) => {
  const now = Date.now();
  const ip = (headers.get("x-forwarded-for") || "unknown").split(",")[0].trim().slice(0, 80);
  const bucket = rateBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true, retryAfter: 0 };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= RATE_LIMIT_PER_MINUTE,
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
  };
};

async function fetchSportOdds(apiKey: string, sportKey: string): Promise<OddsCache> {
  const url = new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("bookmakers", BOOKMAKERS.join(","));
  url.searchParams.set("markets", "h2h");
  url.searchParams.set("oddsFormat", "decimal");
  url.searchParams.set("dateFormat", "iso");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json", "User-Agent": "GENODDS/1.0" },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 404 || response.status === 422) {
    return { events: [], fetchedAt: Date.now() };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[odds] Upstream ${response.status} for ${sportKey}: ${detail.slice(0, 240)}`);
    throw new Error(`UPSTREAM_${response.status}`);
  }

  const raw = await response.json();
  if (!Array.isArray(raw)) throw new Error("INVALID_UPSTREAM_PAYLOAD");

  const quotaHeader = response.headers.get("x-requests-remaining");
  const quotaRemaining = quotaHeader ? Number.parseInt(quotaHeader, 10) : undefined;
  const events = raw
    .filter((event) => event && typeof event === "object" && Array.isArray(event.bookmakers))
    .sort((a, b) => Date.parse(a.commence_time) - Date.parse(b.commence_time))
    .slice(0, MAX_EVENTS);

  return {
    events,
    fetchedAt: Date.now(),
    ...(Number.isFinite(quotaRemaining) ? { quotaRemaining } : {}),
  };
}

async function getSportOdds(apiKey: string, sportKey: string) {
  const cached = cache.get(sportKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { value: cached, cached: true };
  }

  let pending = inFlight.get(sportKey);
  if (!pending) {
    pending = fetchSportOdds(apiKey, sportKey)
      .then((value) => {
        cache.set(sportKey, value);
        return value;
      })
      .finally(() => inFlight.delete(sportKey));
    inFlight.set(sportKey, pending);
  }

  try {
    return { value: await pending, cached: false };
  } catch (error) {
    if (cached && Date.now() - cached.fetchedAt < STALE_TTL_MS) {
      return { value: cached, cached: true };
    }
    throw error;
  }
}

app.get("/make-server-dbae911f/health", (c) => {
  c.header("Cache-Control", "public, max-age=60");
  return c.json({ status: "ok", liveDataConfigured: Boolean(Deno.env.get("ODDS_API_KEY")) });
});

app.get("/make-server-dbae911f/odds", async (c) => {
  const country = getCountry(c.req.raw.headers);
  if (country && BLOCKED_COUNTRIES.has(country)) {
    c.header("Cache-Control", "private, no-store");
    return c.json({ error: "REGION_UNAVAILABLE" }, 451);
  }

  const rate = checkRateLimit(c.req.raw.headers);
  if (!rate.allowed) {
    c.header("Retry-After", String(rate.retryAfter));
    c.header("Cache-Control", "private, no-store");
    return c.json({ error: "TOO_MANY_REQUESTS" }, 429);
  }

  const sportKey = c.req.query("sport");
  if (!sportKey || !ALLOWED_SPORT_KEYS.has(sportKey)) {
    c.header("Cache-Control", "private, no-store");
    return c.json({ error: "INVALID_SPORT" }, 400);
  }

  const apiKey = Deno.env.get("ODDS_API_KEY");
  if (!apiKey) {
    c.header("Cache-Control", "private, no-store");
    return c.json({ error: "LIVE_DATA_NOT_CONFIGURED" }, 503);
  }

  try {
    const { value, cached } = await getSportOdds(apiKey, sportKey);
    c.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=900");
    return c.json({
      events: value.events,
      sport: sportKey,
      eventCount: value.events.length,
      bookmakerCount: BOOKMAKERS.length,
      cached,
      fetchedAt: new Date(value.fetchedAt).toISOString(),
      ...(Number.isFinite(value.quotaRemaining) ? { quotaRemaining: value.quotaRemaining } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    c.header("Cache-Control", "private, no-store");
    if (message === "UPSTREAM_401") return c.json({ error: "LIVE_DATA_AUTH_FAILED" }, 502);
    if (message === "UPSTREAM_429") return c.json({ error: "LIVE_DATA_QUOTA_EXHAUSTED" }, 503);
    return c.json({ error: "LIVE_DATA_UNAVAILABLE" }, 502);
  }
});

Deno.serve(app.fetch);
