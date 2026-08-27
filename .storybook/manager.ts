import React from 'react'
import { addons } from 'storybook/manager-api'
import { deckTheme } from './theme'
import {
  atomicKindIcons,
  type AtomicKind,
} from '../src/foundations/icons/atomicKind'

/**
 * Atomic-design sidebar icons — every component's story `meta` carries a
 * `tags: ['atom' | 'molecule' | 'organism' | 'page']` entry (set at the CSF
 * level, next to `component:`), and `renderLabel` below reads it back to
 * pick the icon. Docs pages and other untagged entries fall through to
 * plain text.
 *
 * The shapes come from `atomicKindIcons`, which the Astro landing page draws
 * from too — the two used to keep separate hand-drawn sets and had drifted
 * apart. Geometry is shared; the colour and 14px size stay local to the
 * sidebar.
 */

const ATOMIC_KINDS: AtomicKind[] = ['atom', 'molecule', 'organism', 'page']

function atomicKindFromTags(tags: string[] | undefined): AtomicKind | null {
  if (!tags) return null
  return ATOMIC_KINDS.find((kind) => tags.includes(kind)) ?? null
}

const iconSvgProps = {
  width: 14,
  height: 14,
  'aria-hidden': true,
  focusable: false,
  style: { flexShrink: 0 },
}

/** Renders one shared icon definition as a filled `currentColor` SVG. */
function atomicIcon(kind: AtomicKind) {
  const { viewBox, shapes } = atomicKindIcons[kind]
  return () =>
    React.createElement(
      'svg',
      { ...iconSvgProps, viewBox },
      ...shapes.map((shape, i) =>
        shape.kind === 'circle'
          ? React.createElement('circle', {
              key: i,
              cx: shape.cx,
              cy: shape.cy,
              r: shape.r,
              fill: 'currentColor',
            })
          : React.createElement('rect', {
              key: i,
              x: shape.x,
              y: shape.y,
              width: shape.width,
              height: shape.height,
              rx: shape.rx,
              fill: 'currentColor',
            }),
      ),
    )
}

const ICONS: Record<AtomicKind, () => React.ReactElement> = {
  atom: atomicIcon('atom'),
  molecule: atomicIcon('molecule'),
  organism: atomicIcon('organism'),
  page: atomicIcon('page'),
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
  'design-system-foundations--docs': FoundationsIcon,
  'design-system-introduction--docs': IntroductionIcon,
  'design-system-design-principles--docs': DesignPrinciplesIcon,
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
`
document.head.appendChild(style)
