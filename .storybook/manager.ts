import React from 'react'
import { addons } from 'storybook/manager-api'
import { deckTheme } from './theme'

/**
 * Atomic-design sidebar icons — every component's story `meta` carries a
 * `tags: ['atom' | 'molecule' | 'organism' | 'page']` entry (set at the CSF
 * level, next to `component:`), and `renderLabel` below reads it back to
 * pick the icon. Docs pages and other untagged entries fall through to
 * plain text.
 *
 *   atom      — a single filled circle: the smallest, indivisible unit
 *   molecule  — two overlapping filled circles: a couple of atoms working
 *               as one
 *   organism  — a 2×2 grid of filled squares: a composed section of UI
 *   page      — a single large filled square: a full, real screen (as
 *               opposed to an organism, which is a section within one)
 */
type AtomicKind = 'atom' | 'molecule' | 'organism' | 'page'

const ATOMIC_KINDS: AtomicKind[] = ['atom', 'molecule', 'organism', 'page']

function atomicKindFromTags(tags: string[] | undefined): AtomicKind | null {
  if (!tags) return null
  return ATOMIC_KINDS.find((kind) => tags.includes(kind)) ?? null
}

const iconSvgProps = {
  width: 14,
  height: 14,
  viewBox: '0 0 14 14',
  'aria-hidden': true,
  focusable: false,
  style: { flexShrink: 0 },
}

function AtomIcon() {
  return React.createElement(
    'svg',
    iconSvgProps,
    React.createElement('circle', { cx: 7, cy: 7, r: 5, fill: 'currentColor' }),
  )
}

function MoleculeIcon() {
  return React.createElement(
    'svg',
    iconSvgProps,
    React.createElement('circle', {
      cx: 5,
      cy: 7,
      r: 4.5,
      fill: 'currentColor',
      opacity: 0.5,
    }),
    React.createElement('circle', { cx: 9.5, cy: 7, r: 4.5, fill: 'currentColor' }),
  )
}

function OrganismIcon() {
  return React.createElement(
    'svg',
    iconSvgProps,
    React.createElement('rect', { x: 1, y: 1, width: 5, height: 5, rx: 1, fill: 'currentColor' }),
    React.createElement('rect', { x: 8, y: 1, width: 5, height: 5, rx: 1, fill: 'currentColor' }),
    React.createElement('rect', { x: 1, y: 8, width: 5, height: 5, rx: 1, fill: 'currentColor' }),
    React.createElement('rect', { x: 8, y: 8, width: 5, height: 5, rx: 1, fill: 'currentColor' }),
  )
}

function PageIcon() {
  return React.createElement(
    'svg',
    iconSvgProps,
    React.createElement('rect', { x: 1, y: 1, width: 12, height: 12, rx: 2, fill: 'currentColor' }),
  )
}

const ICONS: Record<AtomicKind, () => React.ReactElement> = {
  atom: AtomIcon,
  molecule: MoleculeIcon,
  organism: OrganismIcon,
  page: PageIcon,
}

/**
 * Icons for the top-level Deck docs pages, keyed by sidebar item id. Unlike
 * the atomic icons above (filled shapes), these are outline strokes — the
 * docs pages aren't part of the atom/molecule/organism taxonomy, so keeping
 * a visually distinct icon style avoids implying they are.
 */
const docIconProps = {
  width: 14,
  height: 14,
  viewBox: '0 0 14 14',
  'aria-hidden': true,
  focusable: false,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { flexShrink: 0 },
}

function FoundationsIcon() {
  return React.createElement(
    'svg',
    docIconProps,
    React.createElement('rect', { x: 1, y: 1, width: 5, height: 5, rx: 1 }),
    React.createElement('rect', { x: 8, y: 1, width: 5, height: 5, rx: 1 }),
    React.createElement('rect', { x: 1, y: 8, width: 5, height: 5, rx: 1 }),
    React.createElement('rect', { x: 8, y: 8, width: 5, height: 5, rx: 1 }),
  )
}

function IntroductionIcon() {
  return React.createElement(
    'svg',
    docIconProps,
    React.createElement('circle', { cx: 7, cy: 7, r: 5.5 }),
    React.createElement('line', { x1: 7, y1: 6.3, x2: 7, y2: 10 }),
    React.createElement('circle', {
      cx: 7,
      cy: 4.2,
      r: 0.15,
      fill: 'currentColor',
      stroke: 'none',
    }),
  )
}

function DesignPrinciplesIcon() {
  return React.createElement(
    'svg',
    docIconProps,
    React.createElement('circle', { cx: 7, cy: 7, r: 5.5 }),
    React.createElement('path', {
      d: 'M9.2 4.8 6.4 6.4 4.8 9.2 7.6 7.6 9.2 4.8Z',
      strokeLinejoin: 'round' as const,
    }),
  )
}

const DOC_ICONS: Record<string, () => React.ReactElement> = {
  'meet-deck-foundations--docs': FoundationsIcon,
  'meet-deck-introduction--docs': IntroductionIcon,
  'meet-deck-design-principles--docs': DesignPrinciplesIcon,
}

/**
 * A line under each root saying what that section is for, keyed by root id.
 * The three roots are a sequence — learn it, see it working, then build with
 * it — and the labels alone don't carry that; the descriptions do.
 */
const ROOT_DESCRIPTIONS: Record<string, string> = {
  'meet-deck': 'Understand what Deck is.',
  experience: 'See Deck in a real product.',
  build: 'Explore the building blocks.',
}

addons.setConfig({
  theme: deckTheme,
  sidebar: {
    showRoots: true,
    renderLabel: (item) => {
      const iconSpan = (icon: React.ReactElement) =>
        React.createElement(
          'span',
          { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          React.createElement(
            'span',
            { style: { display: 'inline-flex', color: '#2e6e5b' } },
            icon,
          ),
          item.name,
        )

      if (item.type === 'component') {
        const kind = atomicKindFromTags(item.tags)
        if (kind) return iconSpan(React.createElement(ICONS[kind]))
      }

      if (item.type === 'docs') {
        const DocIcon = DOC_ICONS[item.id]
        if (DocIcon) return iconSpan(React.createElement(DocIcon))
      }

      if (item.type === 'root') {
        const description = ROOT_DESCRIPTIONS[item.id]
        if (description) {
          return React.createElement(
            'span',
            { className: 'deck-root-label' },
            React.createElement('span', null, item.name),
            React.createElement(
              'span',
              { className: 'deck-root-label__description' },
              description,
            ),
          )
        }
      }

      return item.name
    },
  },
})

/**
 * `renderLabel` only replaces the text label — Storybook still renders its
 * own generic sprite icon (`svg[type="component"]`/`svg[type="document"]`,
 * the `#icon--component`/`#icon--document` symbols) immediately before it,
 * with no config option to suppress it. Hidden here for every component
 * (all carry an atomic tag and get their own icon above) and for the three
 * specific docs pages that get a custom icon — other docs entries (e.g.
 * "App / Docs") are untouched and keep the default document icon.
 */
const style = document.createElement('style')
style.textContent = `
  #storybook-explorer-tree svg[type='component'] {
    display: none;
  }
  ${Object.keys(DOC_ICONS)
    .map((id) => `#storybook-explorer-tree [data-item-id='${id}'] svg[type='document']`)
    .join(',\n  ')} {
    display: none;
  }

  /*
    Root headers are laid out for a single uppercase word, so the label
    stacks its description and the row grows to fit.
  */
  .deck-root-label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  /* Opts out of the caps treatment Storybook applies to root headers. */
  .deck-root-label__description {
    font-size: 11px;
    font-weight: 400;
    line-height: 1.4;
    text-transform: none;
    letter-spacing: 0;
    color: #6b6b6b;
  }
`
document.head.appendChild(style)
