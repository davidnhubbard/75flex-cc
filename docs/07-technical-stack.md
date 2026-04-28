# 07 — Technical Stack

## Frontend

### Mobile: React Native (Expo)

**Why Expo?**
- Fast iteration (EAS build pipeline)
- Managed services (no native code setup needed)
- iOS + Android from single codebase
- Great community + libraries

**Key libraries:**
- React Navigation (tab-based routing)
- Redux Toolkit (state management)
- AsyncStorage (local persistence)
- Expo Camera + ImagePicker (photos)
- NativeWind (Tailwind on React Native)

**Styling approach:**
NativeWind brings Tailwind CSS utility classes to React Native. Familiar syntax for web developers. Compiled to React Native stylesheet format at build time.

### Web: Next.js 15 (App Router)

**Why Next.js?**
- Server-side rendering + static export
- File-based routing (simple)
- API routes (if needed)
- Vercel deployment ready
- Ecosystem (Tailwind, TypeScript, etc.)

**Key libraries (current):**
- `next` 15
- `react` 19
- `react-dom` 19
- `@supabase/ssr` + `@supabase/supabase-js`
- Tailwind CSS
- SWR (available for server state patterns)

**Styling approach:**
Tailwind CSS. Tokens are defined in `web/tailwind.config.ts`. Brand direction is in `docs/brand-guide.md`.

## Backend

### Supabase (PostgreSQL + Auth + Storage)

**Why Supabase?**
- PostgreSQL out of the box (structured data)
- Built-in auth (email, OAuth)
- Realtime subscriptions (optional, for future)
- Row-Level Security (RLS) for data protection
- File storage (for photos)
- Reasonable pricing at scale

**Database:** PostgreSQL 14+

**Auth:** Supabase Auth (email/password, OAuth via Google/Apple)

**Storage:** Supabase Storage for benchmark photos + progress photos (if added)

**See `03-data-model.md` for full schema.**

## API Design

**Real-time sync:**
- Client reads from local cache first (instant UX)
- On network available, syncs to Supabase
- On network failure, shows quiet banner (see `04-edge-cases.md` decision C35)

**Data flow:**
```
Frontend (local state) ↔ Supabase (source of truth)
   ↓ (offline)
AsyncStorage / LocalStorage (persistence)
```

**Authentication:**
- Supabase JWT tokens stored in secure storage (mobile) or httpOnly cookies (web)
- Auto-refresh on token expiry
- Logout clears all local data

## Type Safety

**Strongly recommended: TypeScript**

Generate types from Supabase schema:
```bash
npx supabase gen types typescript --schema public > web/src/lib/database.types.ts
```

This ensures frontend types match database schema automatically.

## State Management

### Mobile (React Native)
Redux Toolkit for:
- Global challenges state
- Daily logs cache
- UI state (current day, tab selection)
- User settings

Persist to AsyncStorage after every save.

### Web (Next.js)
Local component state + query helper functions in `web/src/lib/queries.ts`, with SWR available where useful.

## Build & Deployment

### Mobile
- EAS Build (Expo's CI/CD)
- iOS: App Store (Testflight for beta)
- Android: Google Play (Internal Testing for beta)
- Minimum OS: iOS 14, Android 10

### Web
- Vercel (Next.js optimized)
- Environment variables for API endpoints
- Preview deployments on PR

## Development Workflow

```
1. Clone repo
2. Install: npm install (mobile) / npm install (web)
3. Setup Supabase:
   - Create Supabase project
   - Run migrations (in /supabase/migrations)
   - Set environment variables
4. Generate types (optional but recommended after schema changes):
   - `supabase gen types typescript --schema public > web/src/lib/database.types.ts`
5. Dev server:
   - Mobile: expo start
   - Web: npm run dev
```

## Environment Variables

**Required (web):**
```
NEXT_PUBLIC_SUPABASE_URL=<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**Optional:**
```
NEXT_PUBLIC_ENV=development|staging|production
```

## Performance Considerations

**Mobile:**
- Lazy load screens (React Navigation handles this)
- Memoize heavy components
- Debounce API calls (e.g., on plan edits)
- Images: compress before upload, use Expo Image for caching

**Web:**
- Next.js Image component (automatic optimization)
- Code splitting via dynamic imports
- CSS minification (Tailwind handles this)

**Database:**
- Index on (user_id, challenge_id, log_date) for fast queries
- Pagination for large result sets (post-MVP)
- Monitor query performance in Supabase dashboard

## Security

**Authentication:** Supabase handles OAuth + session management.

**Authorization:** RLS policies enforce data ownership (see `02-architecture.md`).

**Photos:** Stored in Supabase Storage with RLS (users can only access their own).

**API Keys:** Anon key for frontend (limited permissions), Service key for backend (full permissions, never expose).

**HTTPS:** All communication encrypted in transit.

## Testing Strategy

**Unit tests:** Jest + React Native Testing Library (mobile), Jest + React Testing Library (web)

**Integration tests:** Supabase local emulator for database testing

**E2E tests:** Detox (mobile), Playwright (web) — post-MVP

## Monitoring & Analytics

**Post-MVP:**
- Error tracking: Sentry or similar
- Analytics: Plausible or PostHog (privacy-friendly)
- Performance monitoring: Vercel Analytics (web)
