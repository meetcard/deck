# Deck Design System

**Deck is MeetCard's flagship React design system — a composable foundation of
accessible, production-ready components for building card-centric experiences.**

MeetCard is a digital business-card and networking platform, and its product
metaphor is a deck of cards: people, companies, and contacts are cards you
view, share, exchange, and organize. Deck makes those surfaces fast to build,
consistent, and accessible by default.

- **Package:** `@meetcard/deck`
- **Stack:** React 19 · TypeScript · Vite · CSS custom properties
- **Tooling:** Storybook 10 · Vitest · Testing Library · Playwright · Chromatic

## Quick start

```bash
npm install
npm run storybook
```

Storybook runs at <http://localhost:6006> and is the primary development
environment.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite playground app (`src/App.tsx`) |
| `npm run storybook` | Storybook dev server on port 6006 |
| `npm run build` | Build the library to `dist/` (ESM + CSS + types) |
| `npm run build-storybook` | Production Storybook build to `storybook-static/` |
| `npm test` | Run all tests (unit + story) once |
| `npm run test:watch` | Tests in watch mode |
| `npm run test:unit` | Testing Library specs only (jsdom) |
| `npm run test:storybook` | Story tests only (real Chromium) |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b` across the project |
| `npm run chromatic` | Publish Storybook and run visual regression |

## Using Deck

```tsx
import '@meetcard/deck/styles.css'
import { Button, Card, PersonCard } from '@meetcard/deck'
```

Add `deck-root` to your app shell to adopt Deck's background, text color, and
font stack:

```tsx
<div className="deck-root">{/* … */}</div>
```

Deck expects **Inter** and deliberately does not bundle or fetch it — load it
however your app loads fonts. The stack falls back to system UI.

## Architecture

```text
src/
├── components/          One folder per component
│   └── Button/
│       ├── Button.tsx
│       ├── Button.css
│       ├── Button.stories.tsx
│       ├── Button.test.tsx
│       └── index.ts
├── foundations/
│   └── tokens/          primitives.css, semantic.css, scales.css, tokens.ts
├── styles/
│   └── deck.css         Stylesheet entry (imports the token layers)
├── lib/                 Internal helpers — not part of the public API
├── docs/                Storybook MDX pages
└── index.ts             The public API
```

Only `src/index.ts` is public. Internal modules stay free to change.

## Tokens

Three layers, and components only ever touch the middle one:

```text
Primitive             Semantic                  Component
--deck-primitive-*  → --deck-color-action-*  →  .deck-button--primary
#2e6e5b               action/primary            background-color
```

Color values come from Figma → *Deck Design System* → **Brand guidelines →
MeetCard - Brand Colors** (July 2026). Type, spacing, radius, and elevation
come from the **Foundations** page.

Figma publishes light mode only. Dark values are derived — each was generated
by holding brand hue and tuning lightness until it cleared WCAG AA against its
own surface, then verified programmatically. See `src/foundations/tokens/semantic.css`.

Because every component reads semantic tokens, a palette change is a one-file
change and dark mode needs no per-component work.

## Accessibility

Deck encodes accessibility in the API rather than leaving it to memory:

- Form controls and `IconButton` **require** a `label` — unlabelled controls
  are unrepresentable.
- `error` sets `aria-invalid` and announces via `role="alert"`.
- `Link` with `external` gets safe `rel` plus an announced "opens in a new tab".
- Semantic HTML first: `<hr>`, `<fieldset>`/`<legend>`, `<dl>`, native `<select>`.
- One shared focus treatment across every interactive component.

The a11y addon runs axe on every story. It's set to `'todo'` in
`.storybook/preview.tsx`; switch to `'error'` to make violations fail CI.

## Testing

Two Vitest projects, both run by `npm test`:

- **`unit`** — Testing Library specs (`*.test.tsx`) in jsdom. Behaviour,
  keyboard interaction, and ARIA wiring.
- **`storybook`** — every story rendered in real Chromium via Playwright,
  running each story's `play` function.

Tests target behaviour, not implementation. Where the two engines disagree
(for example jsdom's accessible-name whitespace handling), the browser project
holds the exact assertion.

## Chromatic

Visual regression runs against the built Storybook.

```bash
export CHROMATIC_PROJECT_TOKEN=<token>   # never commit this
npm run chromatic
```

In CI, set `CHROMATIC_PROJECT_TOKEN` as a repository secret. The workflow
skips publishing when the secret is absent, so forks don't fail. The project
id lives in `chromatic.config.json`; the **token does not** and must never be
committed.

## CI

`.github/workflows/ci.yml` runs on push and pull request: install → lint →
typecheck → test → build library → build Storybook → publish to Chromatic.
Any failing gate fails the build.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for component conventions, the token
rules, and what a new component needs before it ships.
