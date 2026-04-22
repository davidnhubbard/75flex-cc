# 01 — Product Specification

## What is 75 Flex?

75 Flex is a personal challenge engine that lets users build and track any 75-day commitment program. Users define their own rules, their own commitments, and their own definitions of success — rather than following a rigid template.

The most famous 75-day challenge is "75 Hard" (strict, all-or-nothing). 75 Flex is positioned as the humane alternative: same structure, your rules.

## Core Philosophy

**Consistency over perfection.** Users are rewarded for showing up, even on hard days. Partial effort counts. Progress is never erased.

**No forced resets — ever.** Missing a day doesn't restart the challenge. Users can voluntarily restart if they want, but history is always preserved.

**Partial completion is a first-class state.** Not "done" or "not done" — but also "partial." A user who logged half their commitments on Day 35 is still moving forward.

**Plans should be realistic and adapt to real life.** Commitments can be changed anytime. Life happens. The app shouldn't punish flexibility.

## Target User

Primary: Someone who tried 75 Hard, burned out, and wants something sustainable. The app must feel like it's on their side from the first screen.

## What Makes It Different

| Feature | 75 Hard | 75 Flex |
|---------|---------|---------|
| Rules | Strict, fixed | Fully customizable |
| Completion | All-or-nothing | Partial counts |
| Miss a day | Restart from Day 1 | Keep going, no reset |
| Workout definition | Two 45-min workouts, one outside | You define what counts |
| Personal dev | 10 pages non-fiction only | Reading, YouTube, courses, podcasts |
| Diet | Strict rules | You define it |
| History | Lost on reset | Permanently preserved |

## Core Features (MVP)

**Onboarding** — 4-slide intro + 3-step plan builder. Users pick a template (75 Hard strict or 75 Soft flexible) and customize it.

**Daily logging** — Tap-based interface. Three commitment states: not started, partial, complete. No forms. Under 5 seconds to log.

**Progress view** — 75-day calendar. See streaks, show-up rate, full days vs. partial days. Past days show what happened; future days are locked.

**Plan management** — Edit commitments anytime. Changes take effect tomorrow (or today if unlogged). No forced resets. Voluntary restart supported.

**Benchmark capture** — Optional starting photos + notes. Retained permanently across challenge runs.

**Re-engagement** — If user misses 3+ days, a supportive card appears (no guilt, no shame).

## Design Principles

- **Fast to use** — Under 5 seconds per daily session
- **Minimal friction** — Tap-based, no forms
- **Warm and supportive** — Never punitive or clinical
- **No red anywhere** — Missed days are quiet, not alarming
- **Honest without harsh** — Show what happened, don't shame

## Monetization

- **Free tier:** Full core functionality + up to 4 commitments
- **Paid tier:** Up to 6 commitments + future insights/export
- Monetization never makes core experience harder

## Tech Stack Overview

**Mobile:** React Native (Expo) + NativeWind  
**Web:** Next.js + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + auth + storage)  
**Design tokens:** Deep forest green (#1A3D22) + citrus yellow (#D4E832)

See `07-technical-stack.md` for full details.

## Non-MVP (Deferred)

- Community and shared templates
- Insights and analytics dashboard
- Data export
- Multiple simultaneous challenges
- Progress Photo camera shortcut inline
- Weighted commitments or custom complete day definitions
