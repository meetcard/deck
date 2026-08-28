import { describe, expect, it } from 'vitest'
import { atomicKindIcons, type AtomicKind } from './atomicKind'

/*
 * This module has two consumers and neither is reachable from a test:
 * `.storybook/manager.ts` is bundled by esbuild for the manager shell, and
 * `src/site/components/BuildingBlocks.astro` is compiled by Astro. So nothing
 * else renders these shapes here, and the drift this module exists to prevent
 * would go unnoticed. These assert the invariants the docblock claims.
 */

const KINDS: AtomicKind[] = ['atom', 'molecule', 'organism', 'page']

describe('atomicKindIcons', () => {
  it('covers every atomic kind', () => {
    expect(Object.keys(atomicKindIcons).sort()).toEqual([...KINDS].sort())
  })

  it.each(KINDS)('draws %s on the shared 16x16 grid', (kind) => {
    // The whole point of sharing the set: one optical grid across both
    // consumers. A shape drawn against a different viewBox renders at the
    // wrong visual weight beside the other three.
    expect(atomicKindIcons[kind].viewBox).toBe('0 0 16 16')
    expect(atomicKindIcons[kind].shapes.length).toBeGreaterThan(0)
  })

  it.each(KINDS)('keeps every %s shape inside the viewBox', (kind) => {
    for (const shape of atomicKindIcons[kind].shapes) {
      if (shape.kind === 'circle') {
        expect(shape.cx - shape.r).toBeGreaterThanOrEqual(0)
        expect(shape.cy - shape.r).toBeGreaterThanOrEqual(0)
        expect(shape.cx + shape.r).toBeLessThanOrEqual(16)
        expect(shape.cy + shape.r).toBeLessThanOrEqual(16)
      } else {
        expect(shape.x).toBeGreaterThanOrEqual(0)
        expect(shape.y).toBeGreaterThanOrEqual(0)
        expect(shape.x + shape.width).toBeLessThanOrEqual(16)
        expect(shape.y + shape.height).toBeLessThanOrEqual(16)
      }
    }
  })

  /*
   * The specific regression that prompted the shared module: the sidebar drew
   * `molecule` as two equal circles sitting level, which reads as two atoms
   * rather than a bond. Unequal radii and a diagonal offset are the meaning.
   */
  it('draws molecule as two unequal, diagonally offset circles', () => {
    const shapes = atomicKindIcons.molecule.shapes
    expect(shapes).toHaveLength(2)
    const [a, b] = shapes
    if (a.kind !== 'circle' || b.kind !== 'circle') {
      throw new Error('molecule is drawn from circles')
    }
    expect(a.r).not.toBe(b.r)
    expect(a.cx).not.toBe(b.cx)
    expect(a.cy).not.toBe(b.cy)
  })

  it('draws organism as a 2x2 grid of equal cells', () => {
    const shapes = atomicKindIcons.organism.shapes
    expect(shapes).toHaveLength(4)
    const sizes = new Set(
      shapes.map((s) => (s.kind === 'rect' ? `${s.width}x${s.height}` : 'circle')),
    )
    expect(sizes.size).toBe(1)
  })

  it('draws atom and page as a single shape each', () => {
    expect(atomicKindIcons.atom.shapes).toHaveLength(1)
    expect(atomicKindIcons.page.shapes).toHaveLength(1)
  })
})
