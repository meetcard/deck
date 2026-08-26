import React from 'react'
import { addons } from 'storybook/manager-api'
import { deckTheme } from './theme'

/**
 * Atomic-design sidebar icons — every component's story `meta` carries a
 * `tags: ['atom' | 'molecule' | 'organism']` entry (set at the CSF level,
 * next to `component:`), and `renderLabel` below reads it back to pick the
 * icon. Docs pages and other untagged entries fall through to plain text.
 *
 *   atom      — a single filled circle: the smallest, indivisible unit
 *   molecule  — two overlapping filled circles: a couple of atoms working
 *               as one
 *   organism  — a 2×2 grid of filled squares: a composed section of UI
 */
type AtomicKind = 'atom' | 'molecule' | 'organism'

const ATOMIC_KINDS: AtomicKind[] = ['atom', 'molecule', 'organism']

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

const ICONS: Record<AtomicKind, () => React.ReactElement> = {
  atom: AtomIcon,
  molecule: MoleculeIcon,
  organism: OrganismIcon,
}

addons.setConfig({
  theme: deckTheme,
  sidebar: {
    showRoots: true,
    renderLabel: (item) => {
      const kind =
        item.type === 'component' ? atomicKindFromTags(item.tags) : null
      if (!kind) return item.name

      const Icon = ICONS[kind]
      return React.createElement(
        'span',
        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
        React.createElement(
          'span',
          { style: { display: 'inline-flex', color: '#2e6e5b' } },
          React.createElement(Icon),
        ),
        item.name,
      )
    },
  },
})

/**
 * `renderLabel` only replaces the text label — Storybook still renders its
 * own generic sprite icon (`svg[type="component"]`, the `#icon--component`
 * symbol) immediately before it for every `type: 'component'` entry, with
 * no config option to suppress it. Every component here carries an atomic
 * tag and gets its own icon above, so hiding the generic one is safe: no
 * entry is left iconless.
 */
const style = document.createElement('style')
style.textContent = `
  #storybook-explorer-tree svg[type='component'] {
    display: none;
  }
`
document.head.appendChild(style)
