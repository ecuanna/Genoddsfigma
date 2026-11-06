# GENODDS

GENODDS is a Vite/React odds-comparison frontend backed by a Supabase Edge Function. The Odds API credential is server-only and the application requests exactly one allowlisted competition at a time.

## Quota protection

- No browser-side The Odds API key or direct upstream request.
- One selected sport key, one `h2h` market and at most 10 configured bookmakers per request.
- No background polling.
- Five-minute browser and Edge Function caches, 15-minute stale fallback.
- Concurrent requests for the same competition share one upstream request.
- Public rate limit and a maximum of 20 returned events.
- There is intentionally no “fetch all sports” endpoint.

## Local development

```bash
npm install
npm run dev
```

The frontend falls back to limited demo data when the Supabase function or live-data secret is unavailable.

## Production configuration

The previously committed Odds API key must be rotated before deployment. Configure the replacement only as a Supabase Edge Function secret:

```bash
supabase secrets set ODDS_API_KEY=your_new_key
supabase secrets set ODDS_BOOKMAKERS=betfair_ex_uk,betfair_sb_uk,williamhill,unibet_uk,sport888,paddypower
supabase functions deploy make-server-dbae911f
```

Never create `VITE_ODDS_API_KEY`; every `VITE_` variable is compiled into the public browser bundle.

Optional server secret:

```bash
supabase secrets set BLOCKED_COUNTRIES=TR
```

Deploy the frontend to Vercel after the Edge Function. `vercel.json` contains the SPA routing and security headers.

## Verification

```bash
npm run build
```

After deployment, verify the health endpoint and one competition only:

```text
https://<project>.supabase.co/functions/v1/make-server-dbae911f/health
https://<project>.supabase.co/functions/v1/make-server-dbae911f/odds?sport=soccer_epl
```

The original Figma design is available at https://www.figma.com/design/Lmxr4VsM4HmwZEpRrhoMWC/GENODDS.
