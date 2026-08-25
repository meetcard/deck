/**
 * Deck — token manifest.
 *
 * A typed mirror of the CSS custom properties, for the cases CSS can't serve:
 * breakpoints inside `matchMedia`, token pickers in docs, and design-tool
 * sync. The CSS files remain the runtime source of truth — values here are
 * the token *names*, not duplicated colors, so the two cannot drift.
 */

/** Space steps, in px. Base 4px, Tailwind-aligned. */
export const space = [
  0, 1, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80, 96,
] as const
export type Space = (typeof space)[number]

/** `var(--deck-space-16)` for a given step. */
export const spaceVar = (step: Space) => `var(--deck-space-${step})`

export const radius = {
  none: 'var(--deck-radius-none)',
  sm: 'var(--deck-radius-sm)',
  md: 'var(--deck-radius-md)',
  lg: 'var(--deck-radius-lg)',
  xl: 'var(--deck-radius-xl)',
  '2xl': 'var(--deck-radius-2xl)',
  '3xl': 'var(--deck-radius-3xl)',
  full: 'var(--deck-radius-full)',
} as const
export type Radius = keyof typeof radius

export const shadow = {
  xs: 'var(--deck-shadow-xs)',
  sm: 'var(--deck-shadow-sm)',
  md: 'var(--deck-shadow-md)',
  lg: 'var(--deck-shadow-lg)',
  xl: 'var(--deck-shadow-xl)',
  '2xl': 'var(--deck-shadow-2xl)',
} as const
export type Shadow = keyof typeof shadow

/** Breakpoint minimums, in px. Not specified in Figma — Deck defaults. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const
export type Breakpoint = keyof typeof breakpoints

/** `(min-width: 768px)` — for use with `window.matchMedia`. */
export const mediaQuery = (bp: Breakpoint) =>
  `(min-width: ${breakpoints[bp]}px)`

/** Typographic scales and their available steps. */
export const typeScales = {
  display: ['2xl', 'xl', 'lg', 'md', 'sm'],
  heading: ['xl', 'lg', 'md', 'sm', 'xs'],
  body: ['xl', 'lg', 'md', 'sm', 'xs'],
  label: ['lg', 'md', 'sm', 'xs'],
} as const

export type DisplaySize = (typeof typeScales.display)[number]
export type HeadingSize = (typeof typeScales.heading)[number]
export type BodySize = (typeof typeScales.body)[number]
export type LabelSize = (typeof typeScales.label)[number]

/**
 * Semantic color token names, grouped by role. Use these to build
 * `var(--deck-color-<group>-<name>)` references.
 */
export const colorTokens = {
  background: [
    'default',
    'subtle',
    'elevated',
    'overlay',
    'brand',
    'brand-subtle',
  ],
  text: [
    'default',
    'muted',
    'disabled',
    'inverse',
    'brand',
    'display',
    'error',
    'warning',
  ],
  border: ['default', 'strong', 'focus', 'error', 'brand'],
  action: [
    'primary',
    'primary-hover',
    'primary-pressed',
    'primary-disabled',
    'primary-text',
    'secondary',
    'secondary-border',
    'secondary-text',
    'destructive',
    'destructive-hover',
    'destructive-text',
  ],
  status: [
    'success-background',
    'success-text',
    'success-border',
    'warning-background',
    'warning-text',
    'warning-border',
    'error-background',
    'error-text',
    'error-border',
  ],
} as const

export type ColorGroup = keyof typeof colorTokens

/** `var(--deck-color-action-primary)` */
export const colorVar = <G extends ColorGroup>(
  group: G,
  name: (typeof colorTokens)[G][number],
) => `var(--deck-color-${group}-${name})`
