# 75 Flex — Complete Project Specification

**Version:** 1.5  
**Date:** April 2026  
**Format:** Modular Markdown (recommended for Claude Code)

---

## Quick Navigation

This specification is organized into modular documents. Start here, then jump to what you need.

### Core Understanding
- **[01-product-spec.md](01-product-spec.md)** — What is 75 Flex? Philosophy, positioning, core features
- **[02-architecture.md](02-architecture.md)** — How does it work? System design, API structure, state management

### Build Details
- **[03-data-model.md](03-data-model.md)** — Database schema, tables, relationships, indexing
- **[04-edge-cases.md](04-edge-cases.md)** — All 36 design decisions with reasoning (organized by domain)
- **[05-visual-system.md](05-visual-system.md)** — Colors, typography, spacing, component design patterns
- **[06-screens.md](06-screens.md)** — Complete screen inventory (01.1 through 08.2) with descriptions

### Technical Reference
- **[07-technical-stack.md](07-technical-stack.md)** — Frontend, backend, mobile tech choices and justification
- **[08-future-growth.md](08-future-growth.md)** — Post-MVP features, scalability, roadmap

---

## How to Use This Spec

### For Claude Code
1. Read `01-product-spec.md` first to understand the product
2. Read `02-architecture.md` to understand system design
3. Hand Claude Code the entire `/spec` folder
4. When Claude Code asks about a specific decision, reference the relevant section in `04-edge-cases.md`
5. For visual questions, reference `05-visual-system.md` and the HTML reference sheets

### For Team Reference
- **Starting a sprint?** Read `01-product-spec.md` + relevant sections of `04-edge-cases.md`
- **Styling a component?** See `05-visual-system.md`
- **Confused about data flow?** Check `02-architecture.md` and `03-data-model.md`
- **Building a screen?** See `06-screens.md` for the inventory, then cross-reference with HTML sheets

### Expanding the Spec
If any file becomes too large:
- `04-edge-cases.md` → split into `04-01-onboarding-decisions.md`, `04-02-logging-decisions.md`, etc.
- `03-data-model.md` → split into `03-01-schema.md`, `03-02-relationships.md`, etc.
- `07-technical-stack.md` → split into `07-01-backend-details.md`, `07-02-frontend-architecture.md`, etc.

All sub-files inherit the parent number (e.g., `04-02-*` is part of the edge cases domain).

---

## Visual Reference

**HTML reference sheets** (companion to this spec):
- `75flex_sheet_01_onboarding.html` through `75flex_sheet_08_incremental.html`
- These show actual screen designs for every state
- Use alongside `06-screens.md` for complete picture

---

## Key Decisions Log

This spec preserves:
- ✓ All 36 edge case decisions with reasoning
- ✓ Complete visual design system (not just colors, but why)
- ✓ Data model with notes on structure choices
- ✓ Architecture decisions (API, state, offline strategy)
- ✓ Trade-offs considered and rejected
- ✓ Screen inventory with design rationale

---

## Version History

- **v1.5** (Apr 2026) — Converted to modular markdown. Added architecture, edge case reasoning, decision rationale.
- **v1.4** (Apr 2026) — Docx version. Condensed format.
- **v1.3** (Apr 2026) — Added "no forced resets" philosophy, challenge archiving, dev scaffold spec
- **v1.2** (Apr 2026) — Initial spec

---

## Contact / Questions

If clarification is needed on any decision, check the reasoning in the relevant file before asking. If a decision contradicts another section, flag it — this spec should be internally consistent.
