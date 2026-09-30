# DEFENSE Q&A

**Why not a real compiler in the loop?**  
Interview prep is about *predicting* a known output, not waiting on a sandbox. Precomputed stdout keeps the UI under 50ms and avoids executing student-supplied code.

**How is combo 2x XP implemented?**  
`awardXp` in `src/lib/scoring.ts`. After a hit, if consecutive streak ≥ 3, XP is multiplied by 2. A miss or timeout sets streak to 0.

**How does the live campus board work?**  
Authenticated runs upsert `public.leaderboard`. The client subscribes to Postgres changes. Rank = weekly XP, then accuracy, then average millisecond time.

**What if the internet dies during the demo?**  
Guest mode writes the same shape of rows to `localStorage` and the board polls. The arena itself is fully client-side.

**How is the daily set chosen?**  
`dailyQuestions()` shuffles the bank with a UTC date seed so every campus sees the same five items that day.

**Why React 19 + Tailwind + Framer Motion?**  
Hackathon rubric weights UX. Motion for option/result transitions, canvas-confetti for combo, Tailwind for a mobile-first terminal-arcade look.

**Security?**  
RLS: users insert only their attempts/profile/leaderboard row. Anon key is a public client key; service role is never shipped.

**What would you build next in 8 more hours?**  
Authoring UI for club seniors, more tracks, and a printed “score ticket” PNG for WhatsApp status.
