# 08 — Future Growth & Roadmap

## Post-MVP Features (Not in v1.0)

These are planned but deferred to keep MVP focused.

### Insights & Analytics
- Stats dashboard: Total days, average show-up rate, longest streak across all challenges
- Trend graphs: Show-up rate over time
- Achievements/badges: "7-day streak unlocked", etc.
- Comparison: How this challenge compares to previous ones

### Data Export
- Download challenge history as CSV or PDF
- Export photos as zip file
- Share challenge summary (no personal data)

### Community (Post-MVP)
- Public challenge templates (user-submitted)
- Leaderboard or social features (very far future)
- Challenge recommendations based on category

### Additional Tracking
- Progress Photo camera shortcut inline on card (currently in Plan Builder only)
- Custom metrics beyond our templates
- Weighted commitments (some count as 1.5x)

### Platform Expansion
- Web app full feature parity (currently simplified UX on web)
- Smartwatch integration (Apple Watch, Wear OS)
- Calendar integration (iCal, Google Calendar sync)

### Advanced Features
- Automated reminders (currently basic, post-MVP: contextual)
- Dark mode (currently light only)
- Customizable themes (color picking)
- Multiple simultaneous challenges (currently one active)

## Scaling Considerations

### Database Growth
As user base grows:

**Photo storage:** Each user might add 5-20 photos per challenge. At scale (100k users, avg 2 challenges): potential terabytes. Monitor Supabase Storage costs.

**Query optimization:** Add indexes on (user_id, log_date, challenge_id) as needed. Use pagination for large result sets.

**Archiving strategy:** Old challenges (> 2 years) might be archived to cold storage (post-MVP decision).

### API Rate Limiting
Supabase enforces per-project rate limits. Scaling to 10k+ concurrent users may require:
- Caching layer (Redis)
- Read replicas for analytics queries
- Batch operations for bulk updates

### Mobile App Size
- Current: ~30-50MB (React Native + libraries)
- Growth: Minimize dependencies, lazy-load features
- Use EAS Build optimization features

### Web Performance
- Current: ~100KB gzipped (Next.js optimized)
- Growth: Keep under 200KB with code splitting

## Revenue & Monetization Evolution

### Current (v1.0)
Free tier: 4 commitments  
Paid tier: 6 commitments + future benefits

### Phase 2 (Post-MVP)
- Premium insights ($2.99/mo or $19.99/yr)
- Advanced export formats ($4.99/mo)
- Template library ($1.99/mo)

### Phase 3 (1+ year out)
- Team/family challenges (paid tier)
- Coach/trainer features (B2B)

## Community & User Growth

### Phase 1 (MVP launch)
- Beta testers (closed, 100-500 users)
- Feedback-driven iteration

### Phase 2 (Public launch)
- Product Hunt or similar
- Launch with 75 Hard / 75 Soft community outreach
- Subreddits, YouTube, TikTok

### Phase 3 (Growth)
- Public challenge templates
- User testimonials + success stories
- Referral program (post-MVP)

## Technical Debt & Refactoring

### Known Simplifications (MVP)
- Error handling is basic (show banner, retry)
- State management could be optimized (large Redux tree)
- No offline conflict resolution for concurrent edits
- Mobile camera/gallery integration is basic (could support cropping, filters)

### Post-MVP Improvements
- More granular error types
- Refactor state management if it becomes unwieldy
- Implement real offline queue (currently just local cache)
- Add image preprocessing (crop, compress) before upload

## Team & Maintenance

### MVP (Small team)
- 1 backend engineer (Supabase setup, schema, RLS)
- 1 mobile engineer (React Native)
- 1 web engineer (Next.js)
- 1 design / product

### Growth Phase
- Add QA / testing specialist
- Add DevOps / infrastructure engineer
- Add customer support

## Success Metrics

### Launch Target
- 1,000 users in first month
- 30% retention (log in at least once per week)
- 4.0+ app store rating

### Year 1 Target
- 50,000 registered users
- 10,000 active monthly users
- 50+ 5-star reviews on app stores
- Break-even on hosting costs

### Year 2 Target
- 200,000 registered users
- 50,000 active monthly users
- Profitability (paid tier adoption 5-10%)

## Post-Launch Learning

### What We'll Learn from Users
- Which commitment categories are most popular?
- Do users prefer 75 Hard strict or 75 Soft flexible?
- What causes churn? (Missing features? Motivation? App bugs?)
- How many restarts per user? (Voluntary restart adoption)
- Are photos / benchmarks actually used?

### What We'll Iterate On
- Onboarding flow (drop-off analysis)
- Re-engagement messaging (what works?)
- Commitment templates (which are hardest?)
- Pricing (is 6 commitments enough incentive to upgrade?)

## Long-term Vision (2-3 years)

75 Flex becomes a platform for personal accountability and habit building, not just 75-day challenges. Possible evolution:

- Custom duration challenges (30 days, 100 days, 1-year habits)
- Group challenges (families, teams, communities)
- Coaching integration (1-on-1 accountability partners)
- Integration with other apps (Apple Health, Fitbit, etc.)

But MVP stays focused: 75 days, individual, your rules, no forced resets.
