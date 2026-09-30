# DEPLOYMENT

## Vercel (recommended)

1. Push this repo to GitHub.
2. Import the project in Vercel (Framework Preset: Vite).
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Root directory is the repo root. Build command `npm run build`, output `dist`.

## Supabase

1. New project → SQL editor → paste `supabase/schema.sql`.
2. Authentication → Providers: Email enabled.
3. For a hackathon demo, disable “Confirm email” so sign-up is instant.
4. Database → Replication: confirm `leaderboard` is in `supabase_realtime`.

## Local

```bash
npm install
npm run dev
```

Without env vars the app is a full local demo (guest names + localStorage board).

## Smoke checklist

- Home shows four tracks
- A 60s round locks options on timeout
- Three hits fire combo overlay + confetti
- Daily result opens WhatsApp share URL
- Board updates after a scored answer (local poll or Realtime)
