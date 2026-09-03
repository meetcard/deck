import { expect } from 'storybook/test'

/**
 * An element's aspect ratio, having first checked it has a box at all.
 *
 * `offsetWidth / offsetHeight` on an element that did not lay out is `0 / 0`,
 * which is `NaN` — and every comparison against `NaN` is false, so the whole
 * suite of ratio assertions fails at once with `expected NaN to be greater
 * than 0.55`. That reads as a card of the wrong shape. It is not: it is a
 * card of no shape, usually because an ancestor gave it no width.
 *
 * The distinction cost real time to find once (a `CardPile` in a shrink-to-fit
 * parent rendered every card at 0x0 while the ratio assertions reported a
 * ratio problem), so the check is written down rather than remembered.
 *
 * @example
 * const ratio = aspectRatioOf(card, 'front card')
 * await expect(ratio).toBeGreaterThan(0.55)
 */
export function aspectRatioOf(element: HTMLElement, name = 'element'): number {
  // Asserted, not thrown: a failed expectation shows up in the interactions
  // panel next to the assertion that would have followed it.
  expect(
    element.offsetWidth,
    `${name} has no width — it did not lay out, so there is no ratio to check`,
  ).toBeGreaterThan(0)
  expect(
    element.offsetHeight,
    `${name} has no height — it did not lay out, so there is no ratio to check`,
  ).toBeGreaterThan(0)

  return element.offsetWidth / element.offsetHeight
}
