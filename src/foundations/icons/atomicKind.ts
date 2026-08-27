/**
 * Icon geometry for the atomic-design kinds — atom, molecule, organism, page.
 *
 * Shared because these are drawn in two places that cannot import each
 * other's markup: the Storybook sidebar (`.storybook/manager.ts`, bundled by
 * esbuild and building elements through `React.createElement`) and the Astro
 * landing page (`src/site/components/BuildingBlocks.astro`, inline SVG). Both
 * previously carried their own hand-drawn set, and they had drifted — most
 * visibly on `molecule`, where the sidebar drew two equal circles side by
 * side while the site drew an unequal, diagonally offset pair.
 *
 * Geometry only. Size and colour belong to the consumer: the sidebar renders
 * these at 14px in `currentColor`, the landing page at 14px in the brand
 * solid. All four share a 16x16 viewBox so they sit on one optical grid.
 */

export type AtomicKind = 'atom' | 'molecule' | 'organism' | 'page'

export type IconShape =
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | {
      readonly kind: 'rect'
      readonly x: number
      readonly y: number
      readonly width: number
      readonly height: number
      readonly rx: number
    }

export interface AtomicKindIcon {
  /** Shared by all four so they sit on one optical grid. */
  readonly viewBox: string
  readonly shapes: readonly IconShape[]
}

/**
 * A single filled dot: the smallest indivisible piece.
 */
const atom: AtomicKindIcon = {
  viewBox: '0 0 16 16',
  shapes: [{ kind: 'circle', cx: 8, cy: 8, r: 3.4 }],
}

/**
 * Two bonded dots of unequal size, diagonally offset. The offset is the point
 * — a molecule is parts joined into something with structure, which two equal
 * circles sitting level with each other do not convey.
 */
const molecule: AtomicKindIcon = {
  viewBox: '0 0 16 16',
  shapes: [
    { kind: 'circle', cx: 6, cy: 9.5, r: 3.4 },
    { kind: 'circle', cx: 10.5, cy: 6, r: 2.6 },
  ],
}

/**
 * A 2x2 grid: many parts arranged into a composed whole.
 */
const organism: AtomicKindIcon = {
  viewBox: '0 0 16 16',
  shapes: [
    { kind: 'rect', x: 2, y: 2, width: 5, height: 5, rx: 1.2 },
    { kind: 'rect', x: 9, y: 2, width: 5, height: 5, rx: 1.2 },
    { kind: 'rect', x: 2, y: 9, width: 5, height: 5, rx: 1.2 },
    { kind: 'rect', x: 9, y: 9, width: 5, height: 5, rx: 1.2 },
  ],
}

/**
 * One filled panel: a whole screen rather than a piece of one. Only the
 * sidebar draws this — the landing page lists the three building blocks.
 */
const page: AtomicKindIcon = {
  viewBox: '0 0 16 16',
  shapes: [{ kind: 'rect', x: 2, y: 2, width: 12, height: 12, rx: 2.5 }],
}

export const atomicKindIcons: Readonly<Record<AtomicKind, AtomicKindIcon>> = {
  atom,
  molecule,
  organism,
  page,
}
