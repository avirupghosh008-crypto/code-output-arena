# PLANNING

## Problem

Placement-bound 1st/2nd year CSIT students grind output-prediction questions from PDFs. There is no timer pressure, no social rank, and no instant “why” after a miss.

## Users

Campus coding-club members and placement aspirants who need C pointers, Java polymorphism, Python scope/generators, and the JS event loop.

## 32-hour slice

Ship one addictive vertical: **predict → explain → streak → rank**. Do not build a full LMS or a sandboxed compiler farm.

## Architecture

```
React (Vite) ── Auth / scores ── Supabase Postgres
     │                                │
     ├── Framer Motion + confetti     └── Realtime channel on leaderboard
     └── Curated question bank (src/data/questions.ts)
```

Question answers are **precomputed compiler/runtime outputs**. That keeps rounds sub-50ms and avoids executing untrusted code in the browser.

## Scoring

- Base 100 XP on a hit
- +2 XP per leftover second
- Streak of 3 consecutive hits enables 2x XP
- Miss or timeout resets streak
- Weekly rank: XP, then accuracy, then average time (faster wins)

## Risks

| Risk | Mitigation |
| --- | --- |
| No Supabase keys at demo | LocalStorage board + guest handles |
| Audio blocked until gesture | SFX only after first tap |
| Question disputes | Line-by-line explanation next to stdout |
| Mobile layout | Single column, sticky nav, large tap targets |

## Non-goals

Live compilation, multiplayer rooms, admin CMS, LMS gradebook.
