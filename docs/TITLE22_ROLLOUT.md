# Title22 integration — rollout guide

Three features ship behind flags: the **Morning Briefing** tab, the **Ask Tello**
assistant, and **modern alerts**. All three are off by default. Deploying this
branch changes nothing that a live user sees until somebody turns a flag on.

## What is in the code

| Piece | File |
|---|---|
| Feature flags | `src/config/featureFlags.ts` |
| Briefing + Tello UI | `src/components/title22-complete.tsx` |
| Partner-admin toggle panel | `src/components/FeatureFlagAdmin.tsx` |
| Dashboard wiring | `src/pages/TrainingDashboard.tsx` |
| Briefing endpoint | `functions/api/briefing.js` |
| Tello endpoint | `functions/api/tello.js` |
| Cloudflare config | `wrangler.toml` |

## How a flag is decided

Lowest to highest precedence:

1. **Off** — the built-in default for every flag.
2. **`VITE_FEATURE_FLAGS`** — a JSON object read at build time, e.g.
   `{"briefing":true,"tello":false}`. This moves the default for everyone.
3. **`localStorage`** — `feature:briefing`, `feature:tello`,
   `feature:modern-alerts`. A per-browser override, used for internal testing.

Flags are read once at page load, so a change applies on the next reload.

## Environment variables

Set these in Cloudflare Pages → Settings → Variables and Secrets. **Never put a
key in `wrangler.toml`** — that file is committed to git.

| Variable | Where | Needed for |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | Tello. Without it `/api/tello` returns 503. |
| `SUPABASE_URL` | plaintext | Briefing data, and Tello auth checks. |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | Briefing data. Without it the briefing returns zeros and says the source is unavailable. |
| `SUPABASE_ANON_KEY` | secret | Verifying the caller's session on `/api/tello`. |
| `BRIEFING_FACILITY_COLUMN` | plaintext | Optional. The column on `caregiver_training_progress` holding the facility id. Leave unset if there is no such column — the briefing then covers every row. |
| `VITE_FEATURE_FLAGS` | plaintext | Build-time flag defaults. |

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler pages secret put SUPABASE_ANON_KEY
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` must both be set for `/api/tello` to
require a signed-in caller. If either is missing the endpoint answers anyone who
finds the URL, and every call spends Anthropic credit — set them before enabling
the Tello flag for anyone.

## Deploy

Deploy the branch as usual. Every flag is off, so the dashboard behaves exactly
as it does today. Confirm after deploying:

- the Courses grid renders and quizzes still save;
- no Briefing tab and no "Ask Tello" button appear;
- the browser console is clean.

## Test in preview

In the preview deployment, from the browser console:

```js
localStorage.setItem('feature:briefing', 'true'); location.reload();
```

Check that the Briefing tab appears, the stats load, and switching back to
Courses leaves the grid intact. Then:

```js
localStorage.setItem('feature:tello', 'true'); location.reload();
```

Open the drawer, ask a Title 22 question, confirm an answer comes back within a
few seconds, and confirm Escape and the backdrop both close it.

A partner admin (`title22_is_partner_admin = true` in Supabase user metadata)
sees the internal-testing panel on the dashboard and can flip the same flags
without touching the console.

## Watch these

- Console errors on the dashboard, especially around the tab switch.
- `/api/briefing` response time and status codes.
- `/api/tello` status codes — 401 means callers are not sending a session token,
  429 means Anthropic is rate-limiting, 503 means the API key is missing.
- Anthropic spend, which is driven entirely by Tello traffic.
- Supabase load from the briefing aggregation, which reads every progress row
  for the facility on each request.

## Roll out gradually

Start with partner admins only (per-browser localStorage), then move the
build-time default once it has been quiet for a day:

```
VITE_FEATURE_FLAGS = '{"briefing":true,"tello":false,"modern-alerts":false}'
```

Rebuild to apply. Turn on one flag at a time so a problem points at one feature.

## Roll back

Per browser, no deploy:

```js
localStorage.removeItem('feature:briefing');
localStorage.removeItem('feature:tello');
location.reload();
```

For everyone, set `VITE_FEATURE_FLAGS` back to
`{"briefing":false,"tello":false,"modern-alerts":false}` and rebuild. Because a
user's `localStorage` override beats the environment default, a browser that was
opted in stays opted in until its key is cleared — testers should clear theirs.

To kill Tello instantly without any deploy, remove `ANTHROPIC_API_KEY` from the
Pages environment: the endpoint then returns 503 and the drawer shows an inline
"unavailable" message instead of breaking the page.
