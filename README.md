# OUTPUT // ARENA

Gamified CS fundamentals & code-output prediction arena for **RBIT Hackathon 2026 — Domain 8: EdTech & Learning (ED-01, Beginner)**.

First-year placement prep as a 60-second quiz sport: predict C / Java / Python / JS snippet output, earn combo XP, and climb a campus live board.

## What it implements

| ID | Requirement |
| --- | --- |
| FR-1 | Timed arena: snippet + 60s bar + 4 options |
| FR-2 | Tracks: C Pointers & Memory, Java Polymorphism, Python Scope & Generators, JS Event Loop |
| FR-3 | Instant compiler/runtime output + line-by-line why |
| FR-4 | 3-in-a-row combo streak → 2x XP, sound, confetti |
| FR-5 | Weekly live leaderboard (accuracy + speed + XP) |
| FR-6 | Daily 5-question workout + WhatsApp share card |
| NFR | Framer Motion + canvas-confetti, mobile-first, dense micro-animations |

## Stack

- Frontend: React 19, Vite, Tailwind CSS v4, Framer Motion, canvas-confetti
- Backend: Supabase (Auth, Postgres, Realtime)
- Hosting: Vercel

Open to everyone: guest handles auto-assign, and scores sync on a shared public board (no account). Optional Supabase still enables campus auth.

## Run locally

```bash
npm install
cp .env.example .env   # optional
npm run dev
```

Open the printed localhost URL.

## Supabase

1. Create a project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Realtime on `public.leaderboard` (the SQL adds it to the publication).
4. Put URL + anon key in `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Docs

- [PLANNING](docs/PLANNING.md)
- [PROGRESS](docs/PROGRESS.md)
- [DEPLOYMENT](docs/DEPLOYMENT.md)
- [DEFENSE_QA](docs/DEFENSE_QA.md)
