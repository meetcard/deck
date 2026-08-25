# Contributing to Deck

## Adding a component

Every component is a folder under `src/components/`:

```text
src/components/Badge/
├── Badge.tsx            Implementation
├── Badge.css            Colocated styles
├── Badge.stories.tsx    Stories (CSF 3)
├── Badge.test.tsx       Testing Library specs
└── index.ts             Public re-exports for this component
```

Then export it from `src/index.ts`. A component is not shipped until it is
exported there.

## Component conventions

**Props**

- Strongly typed, no `any`. Prefer closed unions (`'sm' | 'md' | 'lg'`) over
  `string`, so editors and coding agents can complete them.
- Name for intent: `tone`, `variant`, `surface`, `elevation`, `size`.
- Extend the underlying element's props (`ButtonHTMLAttributes<HTMLButtonElement>`)
  and spread the rest, so callers keep `id`, `data-*`, and event handlers.
- Forward refs on anything a caller might need to focus or measure.
- Make a prop **required** when omitting it would produce an accessibility bug
  — this is why `label` is required on form controls and `IconButton`.

**Class names**

BEM-ish, prefixed: `deck-badge`, `deck-badge--solid`, `deck-badge__dot`. Build
them with `cx` from `src/lib/cx.ts`. Always append the incoming `className`
last so callers can override.

**Sizing**

`sm`/`md`/`lg` map to 32/40/48px across Button, IconButton, and the form
controls. Keep new controls on that grid so they align in a row.

## Token rules

1. **Never put a raw value in a component.** No hex colors, no px spacing, no
   shadows, no radii. If a value is missing, add a token.
2. **Components reference semantic tokens only** (`--deck-color-action-primary`),
   never primitives (`--deck-primitive-signal-green`). Primitives are fixed;
   semantics are what change between light and dark.
3. **Adding a semantic token means adding it in both modes** — the light block
   and both dark blocks in `semantic.css`.
4. **Verify contrast before committing a color.** Body text needs 4.5:1
   against its own surface, UI boundaries and large text need 3:1. Derived
   dark values in this repo were generated and checked programmatically; hold
   new ones to the same bar.

## Accessibility expectations

Before a component ships:

- It is reachable and operable by keyboard alone, with a visible focus ring.
- It has an accessible name, and state is exposed (`aria-invalid`,
  `aria-checked`, `aria-expanded`) rather than implied by styling.
- Meaning is never carried by color alone — pair it with text, an icon, or a
  dot.
- Errors are announced (`role="alert"`), not just rendered.
- The a11y panel shows no violations for any of its stories.

Prefer a native element over an ARIA reimplementation. `Select` wraps a real
`<select>` on purpose: platform keyboard behaviour, mobile pickers, and screen
reader support come for free.

## Stories

Use CSF 3. Autodocs is enabled globally in `.storybook/preview.tsx`, so a
component does not need its own `autodocs` tag.

- One story per meaningful state, not per prop permutation.
- Give stories intent-revealing names (`NeedsFollowUp`, not `Story3`).
- Add a `play` function when it proves something the render alone doesn't:
  an interaction, an ARIA attribute, async content, or a computed style.
- Don't add a `play` to a static variant — the render already fails if the
  component throws.
- Write a doc comment above a story when it explains *when* to use that state.

## Tests

Test behaviour, not implementation. Do not write tests to move coverage.

Worth testing: user interaction, keyboard operation, ARIA wiring, state
changes, and any DOM property with no HTML attribute (like
`indeterminate`). Not worth testing: that a class name is present, or that a
prop is spread.

Run everything with `npm test`. Story tests run in real Chromium; unit tests
run in jsdom. Where the engines disagree, pin the exact assertion in the
browser project and use a pattern in jsdom — with a comment saying why.

## Before opening a PR

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

CI runs the same gates plus a Storybook build and a Chromatic publish. Review
and accept intentional visual changes in Chromatic.
