# 75 Flex — Brand Guide

> **Purpose:** Design reference for Claude Code and anyone touching UI.
> This is the source of truth for colors, type, spacing, logo usage, and voice.
> When in doubt, match the patterns here — don't invent new ones.

---

## 1. Brand essence

**75 Flex is a supportive tracker for a flexible take on the 75 Hard challenge.**

The tone is the opposite of drill-sergeant fitness apps. It's calm, earthy, adult — a companion, not a coach. Think **trailhead signage** more than **gym wall**. The visual system reinforces this:

- Deep forest greens carry the "trail / grounded" feeling
- A **single red accent** — our logo heart — provides energy and warmth
- Paper-neutral backgrounds read calm and analog
- Type uses one family with weight contrast — disciplined, not decorative
- Copy is short, direct, kind. Never guilt-trippy. "Still here" > "You missed 3 days"

The heart mark is a deliberate, affectionate nod to 75 Hard's spade. Where 75 Hard is grit, we are **heart**.

---

## 2. Logo

### Files
- **`/assets/logo-full.png`** — primary lockup: heart mark + "FLEX" wordmark stacked. Use on marketing pages, auth screens, app-store listings.
- **`/assets/logo-mark.png`** — mark only: heart with white "75". Use in-app headers, avatars, favicons at larger sizes.
- **`/assets/favicon.svg`** — 64×64 browser favicon. Red heart on paper-cream rounded square.

### Usage rules
- **Minimum mark size:** 24px square. Below that, use favicon.svg.
- **Clear space:** equal to half the heart's width on all sides. Never crowd.
- **Do not recolor the heart.** Heart is always `#DC2D2B`. The "75" inside is always paper white (`#F4F1EA`).
- **Do not stretch, tilt, or add effects** (no shadows, no gradients, no outlines around the heart).
- **Background:** always place on `surface` (`#F4F1EA`) or darker greens (`green-800`/`green-900`). Never on pure white — the red vibrates. Never on red, pink, or orange surfaces.
- **Wordmark ("FLEX"):** in the full lockup, the wordmark is the same red (`#DC2D2B`) on light surface, paper-white on dark. Do not substitute forest green.

---

## 3. Color tokens

### Forest greens (primary)

| Token          | Hex       | Use                                                    |
|----------------|-----------|--------------------------------------------------------|
| `green-950`    | `#06120D` | Deepest shadow, status-bar backdrop                    |
| `green-900`    | `#0C1F17` | Device chrome, footer wells                            |
| `green-800`    | `#132E22` | **Page headers** — the signature dark band at top      |
| `green-700`    | `#1E4434` | Headings on light bg, primary-on-light                 |
| `green-600`    | `#2F5443` | Secondary heading, stat labels                         |
| `green-500`    | `#4A7A62` | Meta text on light bg, icons                           |
| `green-400`    | `#7FAA92` | Eyebrow text on dark header, muted elements            |
| `green-200`    | `#B2C8B0` | Complete-state card borders                            |
| `green-100`    | `#D2E0C4` | Complete-state card backgrounds                        |
| `green-50`     | `#E4EADD` | Rarely — soft tint for pressed states                  |

### Red (accent — from the logo)

| Token              | Hex       | Use                                                 |
|--------------------|-----------|-----------------------------------------------------|
| `heart` / `red`    | `#DC2D2B` | **THE accent** — progress bars, active chips, icons, primary CTAs |
| `heart-soft`       | `#F4D5D4` | Pressed red states only                             |
| `heart-deep`       | `#A81E1C` | Hover on primary CTAs; red text on light surface for WCAG contrast |

**One accent, one meaning.** Red = energy, progress, attention, action. Never use it for errors or destructive-only actions — the brand heart shouldn't feel dangerous. For destructive confirmations, use `heart-deep` with explicit destructive copy ("Permanently delete").

### State colors (done · partial · not started) — **Signal palette**

These sit on light backgrounds (`surface` or `card`) with the clarity of a traffic light but tuned to our paper tone.

| Token               | Hex       | Use                                                          |
|---------------------|-----------|--------------------------------------------------------------|
| `state-done`        | `#2F8746` | Emerald — done-state border, chip text                       |
| `state-done-bg`     | `#C7E7CE` | Emerald tint — done-state card background                    |
| `state-done-ink`    | `#154A1E` | Deep emerald — done-state on-card text (WCAG AA)             |
| `state-partial`     | `#C98B14` | Sunflower — partial-state border, chip text                  |
| `state-partial-bg`  | `#FBE6A3` | Sunflower tint — partial-state card background               |
| `state-partial-ink` | `#5E430A` | Deep sunflower — partial-state on-card text (WCAG AA)        |
| `state-none`        | `#9A927E` | Stone — not-started border                                   |
| `state-none-bg`     | `#E4E0D2` | Stone tint — not-started card background                     |
| `state-none-ink`    | `#3A372E` | Deep stone — not-started on-card text                        |

**Why Signal over "natural" options:** state legibility is a usability requirement, not an aesthetic one. The Signal palette keeps the three states readable at a glance on both `surface` and `card` backgrounds. It also frees the heart red to be **the brand accent only** — not a state color — which makes the rule "one red, one meaning" easier to hold.

State cards are always distinct from their background (see §6.1). Each state has enough chroma that the three are unambiguous even when scanned peripherally.

### Neutrals (paper)

| Token        | Hex       | Use                                         |
|--------------|-----------|---------------------------------------------|
| `surface`    | `#F4F1EA` | **Body background** across the whole app    |
| `card`       | `#FBF8F1` | **Card background** — lighter than `surface` |
| `ink`        | `#14170F` | Primary text                                |
| `ink.muted`  | `#2F3326` | Secondary text                              |
| `ink.soft`   | `#6E6858` | Tertiary / helper text                      |
| `ink.faint`  | `#A8A292` | Placeholder / disabled                      |
| `border`     | `#D7D2C2` | Card borders, dividers, input outlines      |

### Why these choices (for future edits)
- Greens sit at hue 160 in oklch space — cool pine, not Christmas. Don't warm them up.
- Red comes directly from the logo — single source of truth, one warm tone in the system.
- `surface` is paper `#F4F1EA` and `card` is a distinct lighter paper `#FBF8F1` — **they must never match**. See Rule §6.1.

---

## 4. Typography

**Single family: Space Grotesk.** Loaded via `next/font/google` in `web/src/app/layout.tsx`.

Hierarchy comes from **weight + size + tracking**, not font swaps.

| Role            | Font            | Weight | Size      | Tracking    | Classes                                          |
|-----------------|-----------------|--------|-----------|-------------|--------------------------------------------------|
| Display H1      | Space Grotesk   | 600    | 22–28px   | `-0.02em`   | `font-display font-semibold tracking-tight`      |
| Display H2      | Space Grotesk   | 600    | 18–20px   | `-0.02em`   | `font-display font-semibold tracking-tight`      |
| Body            | Space Grotesk   | 400    | 14px      | `normal`    | `font-sans`                                      |
| Body emphasis   | Space Grotesk   | 500    | 14px      | `normal`    | `font-sans font-medium`                          |
| Eyebrow / meta  | JetBrains Mono  | 400    | 9–10px    | `widest`    | `font-mono uppercase tracking-widest`            |
| Large numerics  | Space Grotesk   | 500    | 32–48px   | `-0.04em`   | `font-display font-medium tracking-tighter tabular-nums` |
| Chip labels     | JetBrains Mono  | 500    | 9px       | `widest`    | `font-mono uppercase tracking-widest font-medium`|

**Rules:**
- **Never italicize.** Serif italics and geometric sans italics both fight the system.
- **Numbers always get `tabular-nums`** so counters don't jitter.
- **Eyebrow text is always uppercase mono** — "DAY 35 OF 75", "HYDRATION", "NOT STARTED".
- Two fonts maximum: Space Grotesk + JetBrains Mono. Don't add a third.

---

## 5. Spacing & shape

- **Border radius:** `14px` for cards (`rounded-card`), `10px` for chips/buttons, `99px` for pills and progress bars. Never hard corners on cards.
- **Card padding:** `12–14px` internal. Don't go below `12px` on touchable cards.
- **Page gutters:** `16px` mobile, `20px` for dark headers.
- **Vertical rhythm between cards:** `10–12px` gap. Let the white space breathe.
- **Border weight:** `1.5px` on cards. `1px` on dividers. The slightly-heavy card border is a brand choice — it makes cards feel like **objects**, not regions.

---

## 6. Non-negotiable rules

### 6.1 Cards must never match their background

**The card color and the page background color must always be different.** Contrast between them is what makes cards feel like objects instead of empty regions. If a card ends up on a surface of the same color, do one of:

- Lighten the card (`surface` → `card`) — preferred default
- Darken the background (swap in `green-50` or `green-100` beneath)
- Add a **1.5px border** in `border` — only acceptable as a fallback if the palette truly can't support a fill difference

Concretely in this system:
- **Page body is `surface` (`#F4F1EA`)**
- **Cards on body are `card` (`#FBF8F1`)** with `1.5px border` in `border`
- **Cards on dark headers are `surface` or `green-700`** — never the same as the header's `green-800`

This rule also applies to modals, popovers, sheets, and dropdowns. Any contained surface must differentiate from what's behind it.

### 6.2 One red per screen

The heart red is attention. Use it for **exactly one** thing per screen: the primary progress, the primary CTA, or the active state — not all three. Multiple reds cancel each other out.

### 6.3 Never pure white, never pure black

Pure `#FFFFFF` and `#000000` don't exist in this system. Text is `ink` (`#14170F`), light surfaces are `surface`/`card`, dark surfaces are the green scale. Pure values read clinical and clash with the paper-and-forest feel.

---

## 7. Component patterns

### Page header (dark band)

```tsx
<div className="bg-green-800 px-5 pt-8 pb-4">
  <p className="font-mono text-[10px] text-green-400 uppercase tracking-widest mb-0.5">
    Day 35 of 75
  </p>
  <h1 className="font-display text-[22px] font-semibold tracking-tight text-surface">
    Good afternoon
  </h1>
  <div className="mt-4 bg-green-900 rounded-full h-[3px]">
    <div className="bg-heart h-[3px] rounded-full" style={{ width: '47%' }} />
  </div>
  <p className="font-mono text-[9px] text-green-400 mt-1">47% complete</p>
</div>
```

### Commitment card (three states)

| State       | Bg                    | Border                 | Chip text                |
|-------------|-----------------------|------------------------|--------------------------|
| none        | `bg-state-none-bg`    | `border-state-none`    | `text-state-none-ink`    |
| partial     | `bg-state-partial-bg` | `border-state-partial` | `text-state-partial-ink` |
| complete    | `bg-state-done-bg`    | `border-state-done`    | `text-state-done-ink`    |

All three state backgrounds differ from both `surface` and `card`, satisfying §6.1 without needing a fallback border-only treatment.

Each card: category eyebrow (mono) → name (body medium) → optional definition (body small soft) → state chip (mono, top-right).

### Cross-card state consistency (required)

Any progress card that represents completion status, including **Photo** and **Note**, must use the same state surfaces:

- `none` → `bg-state-none-bg border-state-none`
- `partial` → `bg-state-partial-bg border-state-partial`
- `complete` → `bg-state-done-bg border-state-done`

Do not use neutral `bg-card` for these status cards. If a card is in-progress (for example photo upload or a short draft note), map it to `partial` instead of inventing a new color treatment.

### Buttons

- **Primary:** `bg-heart text-surface hover:bg-heart-deep` (rare — only for the most important action on a screen)
- **Dark:** `bg-green-700 text-surface` (default for most "primary-ish" actions in supportive contexts — register-day, continue, save)
- **Outline:** `bg-card border-[1.5px] border-border text-ink` (most footer actions, cancel, secondary)

Never more than **one heart button per screen** (see §6.2).

### Progress bars

- Track: `bg-green-900` on dark headers, `bg-border` on light.
- Fill: `bg-heart`, always.
- Height: `3px` in headers (subtle), `10px` in hero displays.
- Rounded: `rounded-full` (pill, not rectangle).

---

## 8. Voice & copy

- **Short. Specific. Kind.**
- **Time-of-day greetings** beat generic ones. "Good afternoon" > "Welcome back".
- **Acknowledge effort without flattery.** "That's real progress." > "Amazing job!!!"
- **No guilt about missed days.** "Still here" re-engages without scolding. Never "You missed X days."
- **Optimism floor at 0%.** Even "not started" copy should be forward-looking. "75% — almost there" not "25% remaining".
- **Mono text is for meta and state labels**, never for full sentences. Prose goes in Space Grotesk.
- **Heart language.** Small nods to the mark are welcome when they're earned — "All in" > "Complete" as a label variant — but don't force heart puns. Restraint.

---

## 9. What to avoid

- ❌ Gradients (unless extremely subtle — a single 5% tint at most)
- ❌ Drop shadows on cards (borders do the work)
- ❌ Saturated greens (anything past chroma 0.08 — keep it pine, not grass)
- ❌ Pure white or pure black (see §6.3)
- ❌ Italic anything
- ❌ Multiple accent colors — **heart red is the only warm tone in the system**
- ❌ Cards that share a color with their background (see §6.1)
- ❌ More than one primary/heart action per screen (see §6.2)
- ❌ Emoji outside the existing domain-specific uses (📷 for progress photos is grandfathered; don't add more)
- ❌ Rounded squircle-style tabs or segmented controls — we use underlines
- ❌ Generic icon-set iconography (Feather, Heroicons) without careful weight-matching — prefer custom, 1.8px stroke, matching our line weight
- ❌ Any font that isn't Space Grotesk or JetBrains Mono
- ❌ Heart icons other than the logo mark. If you need a UI heart (e.g. favorites), use a stroke outline heart in `ink` or `green-700` — not filled red. The red filled heart is **the logo** and nothing else.

---

## 10. Implementation contract (for Claude Code)

- Tokens live in **`web/tailwind.config.ts`** — never hardcode hex values in components
- Fonts are **CSS variables** wired in `web/src/app/layout.tsx` via `next/font/google` — don't import fonts elsewhere
- Commitment category names are canonical and fixed in **`web/src/lib/categories.ts`**. Do not introduce per-user custom category titles for system categories.
- Use Tailwind classes, not inline style objects
- When adding a new surface color, add it to `theme.extend.colors` first, then use it
- State colors use the `state-*` token family — never raw hex, never `heart-soft` for partial state
- Logo files live in `/public/brand/` (copy from `/assets/` during implementation)
- Favicon: link `/public/favicon.svg` from `app/layout.tsx` via `icons.icon`

### `tailwind.config.ts` extend

```ts
colors: {
  green: {
    950: '#06120D', 900: '#0C1F17', 800: '#132E22',
    700: '#1E4434', 600: '#2F5443', 500: '#4A7A62',
    400: '#7FAA92', 200: '#B2C8B0', 100: '#D2E0C4', 50: '#E4EADD',
  },
  heart: { DEFAULT: '#DC2D2B', soft: '#F4D5D4', deep: '#A81E1C' },
  state: {
    done:        '#2F8746',
    'done-bg':   '#C7E7CE',
    'done-ink':  '#154A1E',
    partial:        '#C98B14',
    'partial-bg':   '#FBE6A3',
    'partial-ink':  '#5E430A',
    none:        '#9A927E',
    'none-bg':   '#E4E0D2',
    'none-ink':  '#3A372E',
  },
  surface: '#F4F1EA',
  card:    '#FBF8F1',
  ink: { DEFAULT: '#14170F', muted: '#2F3326', soft: '#6E6858', faint: '#A8A292' },
  border: '#D7D2C2',
},
fontFamily: {
  display: ['var(--font-display)', 'sans-serif'],
  sans:    ['var(--font-sans)',    'sans-serif'],
  mono:    ['var(--font-mono)',    'monospace'],
},
borderRadius: { card: '14px' },
```

---

## 11. Reference

Visual reference lives at `75 Flex - Colors & Type.html` (design canvas):
- **Brand marks** — logo lockups + favicon
- **Hydration detail** — token application on an existing reference sheet
- **Today screen** — full mobile redesign in iOS frame
- **Final tokens** — the exact `tailwind.config.ts` + `layout.tsx` diff

When producing new screens, match the Today screen's patterns exactly — dark header, tab row, commitment-card rhythm, paper body, heart-red progress, mono meta. Don't improvise new structural patterns without review.
