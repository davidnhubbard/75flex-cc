# 05 — Visual System

## Color Palette

**Primary Green (Dark Forest)**
- Hex: `#1A3D22`
- Usage: Headers, navigation, primary backgrounds
- Tone: Grounding, nature-inspired, trustworthy

**Green Accents**
- `#2E6B40` — Medium green for active states, CTAs
- `#3A8A52` — Mid-green for UI elements
- `#52A86E` — Light green for secondary actions
- `#7EC498` — Soft green for disabled states
- `#B4DEC4` — Very light green for backgrounds
- `#DCF0E4` — Almost white green for surfaces

**Citrus Yellow (Primary Accent)**
- Hex: `#D4E832`
- Usage: Progress bars, today highlight, streak indicator, done states
- Brightness: High contrast, energetic, positive

**Warm Light (Backgrounds)**
- `#F0FAF4` — App background (very light green)
- `#FFFDF5` — Card backgrounds, clean white with warm tint

**Neutral (Text & Borders)**
- `#1C1409` — Dark text on light backgrounds
- `#3D2E1E` — Medium-dark for secondary text
- `#7A6558` — Warm grey for muted text
- `#C0A882` — Light neutral for disabled text
- `#EDE5D8` — Very light for borders

**Amber (Partial State)**
- `#F59E0B` — Partial completion indicator
- `#FEF3C7` — Light amber background

**Important: No red anywhere.** Missed days are quiet white cells or muted amber. Never red, never alarming.

## Typography

**Display Font: Playfair Display**
- Usage: Headlines, section titles, numbers (like streak count)
- Weights: 700 (bold), 900 (extra bold)
- Sizes: 22px (hero), 18px (section), 15px (card title), 13px (label)
- Tone: Elegant, confident, celebration-ready

**Body Font: DM Sans**
- Usage: All body text, labels, buttons, form inputs
- Weights: 400 (regular), 500 (medium), 600 (semibold)
- Sizes: 12px (body), 11px (secondary), 10px (small), 9px (tiny)
- Tone: Modern, accessible, friendly

**Monospace: DM Mono**
- Usage: Status labels, chip labels, data display ("Day 1", "NOT STARTED")
- Weight: 400, 500
- Sizes: 10px (standard), 8px (small label)
- Tone: Technical, precise, machine-like

## Spacing System

**Base unit: 4px**

- `2px` — Minimal (border widths)
- `4px` — Micro spacing (between small elements)
- `8px` — Small (between card sections)
- `12px` — Medium (between cards)
- `16px` — Standard (padding inside cards, between rows)
- `24px` — Large (section gaps)
- `32px` — Extra large (page padding)

**iOS safe area:** Respect notch + home indicator. Add 16px padding on mobile.

## Component System

**Buttons**
- Primary (citrus): `#D4E832` background, `#0A1F0F` text, 11px semibold, 11px padding, 10px border-radius
- Secondary (outlined): transparent background, `#2E6B40` border, `#2E6B40` text
- Ghost (text): transparent background, `#52A86E` text, no border
- States: Hover (lighten bg), Active (darken text), Disabled (opacity 0.4)

**Cards**
- Background: white (`#FFFDF5`)
- Border: 1.5px solid `#E2EDE5` (light grey)
- Padding: 12px (mobile), 16px (desktop)
- Radius: 12px (mobile), 14px (desktop)
- Variants: Completed (soft green bg + green border), Partial (amber bg + amber border), Default (white)

**Input Fields**
- Background: Very light green `#F4F9F5`
- Border: 1.5px solid `#C8DDD0`
- Padding: 8px 10px
- Radius: 8px
- Focus: Border becomes `#3A8A52` (medium green)

**Progress Bar**
- Background: Light grey `#F1EFE8`
- Fill: Citrus `#D4E832`
- Height: 3px (header), 10px (detail screen)
- Radius: 99px (fully rounded)

**Pills / Labels**
- Background: Light green `#F1EFE8`
- Text: Dark grey `#7A6558`
- Padding: 4px 8px
- Radius: 99px
- Variants: Done (green), Partial (amber), Not started (neutral)

**Tab Navigation**
- Active: Bottom border 2px `#2E6B40`
- Text: `#1C1409` when active, `#C0A882` when inactive
- No background fill (just border-bottom)

**Bottom Navigation (3 tabs)**
- Background: White
- Icons: `#7A6558` (inactive), `#2E6B40` (active)
- Icon size: 15px
- Label size: 8px (monospace)
- Height: 48px total (icon + label)

## Dark Screens (Onboarding, Completion, About)

These screens use `#122A18` background (dark forest).

Text: `#FFFDF5` (warm white)
Buttons: Citrus with dark text
Cards: `#1A3D22` (slightly lighter dark)

? Help button treatment: `rgba(212,232,50,.15)` background, citrus border and text

## Light Screens (Daily Log, Progress, Plan, Profile)

Background: `#F4F9F5` (very light green)
Header: `#1A3D22` (dark forest)
Text: `#1C1409` (dark)

? Help button treatment: `#DCF0E4` (light green) background, `#3A8A52` (medium green) text and border

## Component Patterns

**? Help Button (Global)**
- Appears top-right of every screen header
- Width: 18px, height: 18px
- Radius: 50% (circle)
- Dark screens: citrus tint background + citrus text
- Light screens: soft green tint background + medium green text
- onTap: Opens help sheet (bottom-modal)

**Detail Bar (Progress View)**
- Appears below calendar when past day is tapped
- Background: White with subtle border
- Shows: Day number + date, status dot, status text, supporting copy
- No shadow (flat, integrated)

**Re-engagement Card**
- Background: White with green border
- Eyebrow: "Still here" (citrus color)
- Headline: Large (Playfair, 13px) calling out days logged
- Stats grid: 3 columns, light green background, centered numbers
- Body: Warm, honest copy
- CTA: Dark green button

## Accessibility Notes

- Contrast ratio: All text meets WCAG AA minimum (4.5:1)
- Color not primary indicator: States use color + border + text together
- Font sizes: Minimum 10px (monospace labels), 11px body
- Touch targets: Minimum 44x44px (buttons, tappable cards)
- No animation on load (respect prefers-reduced-motion)

## Mobile vs. Desktop

| Element | Mobile | Desktop |
|---------|--------|---------|
| Padding | 12px | 16px |
| Border radius | 11-12px | 13-14px |
| Font size (body) | 11px | 12px |
| Button padding | 10px | 11px |
| Card max-width | Full screen | 480-600px |

Mobile is the default design. Desktop is slightly more spacious.
