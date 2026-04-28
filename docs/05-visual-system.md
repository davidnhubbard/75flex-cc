# 05 - Visual System

This file is intentionally brief. The previous version drifted from implementation.

## Source of truth

- Primary reference: `docs/brand-guide.md`
- Token implementation: `web/tailwind.config.ts`
- Font wiring: `web/src/app/layout.tsx`

If this file conflicts with `brand-guide.md`, follow `brand-guide.md`.

## Current implementation summary

### Typography
- `Space Grotesk` for `font-sans` and `font-display`
- `JetBrains Mono` for `font-mono`
- Do not add a third font.

### Color direction
- Primary family: forest greens (`green.950` through `green.50`)
- Single accent family: heart red (`heart`, `heart-soft`, `heart-deep`)
- State colors: `state.done`, `state.partial`, `state.none` (+ `-bg`, `-ink` variants)
- Base surfaces: `surface`, `card`, `border`, `ink`

### Hard rules
- Never hardcode hex values in components; use Tailwind tokens.
- State cards must contrast against the page surface.
- Do not use `paper` token classes in app code (not defined in Tailwind config).
- Use heart red with restraint (one primary accent intention per screen).

### Component patterns
- Main app screens use a dark `PageHeader` band with paper body (`bg-surface`).
- Commitment cards use state token families, not neutral card colors.
- Bottom nav stays fixed with `bg-surface` + `border-border`.

## Maintenance note

When visual decisions change, update **both**:
- `docs/brand-guide.md`
- `web/tailwind.config.ts`

Treat this file as a quick index, not the detailed design spec.
