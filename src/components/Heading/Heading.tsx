import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Heading.css'

/**
 * Heading steps span two Figma scales: the Heading ramp for in-page
 * hierarchy, and the Display ramp for hero/marketing moments.
 */
export type HeadingSize =
  | 'display-2xl'
  | 'display-xl'
  | 'display-lg'
  | 'display-md'
  | 'display-sm'
  | 'xl'
  | 'lg'
  | 'md'
  | 'sm'
  | 'xs'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type HeadingTone =
  | 'default'
  | 'muted'
  | 'inverse'
  | 'brand'
  | 'display'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading rank, which drives the rendered `h1`–`h6` tag. Choose this for
   * document structure, then adjust `size` if the visual weight should differ.
   */
  level?: HeadingLevel
  /** Visual size. Defaults to the natural size for `level`. */
  size?: HeadingSize
  tone?: HeadingTone
  truncate?: boolean
}

/** Visual default per rank — override with `size` when design calls for it. */
const sizeForLevel: Record<HeadingLevel, HeadingSize> = {
  1: 'xl',
  2: 'lg',
  3: 'md',
  4: 'sm',
  5: 'xs',
  6: 'xs',
}

/**
 * Section titles, card headers, and hero statements.
 *
 * Rank and appearance are separate: `level` keeps the document outline
 * correct for screen readers, `size` controls how big it looks.
 *
 * @example
 * <Heading level={1} size="display-sm">Your deck</Heading>
 * <Heading level={2}>Recent connections</Heading>
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    { level = 2, size, tone = 'default', truncate = false, className, ...props },
    ref,
  ) {
    const Tag = `h${level}` as const
    const resolved = size ?? sizeForLevel[level]

    return (
      <Tag
        ref={ref}
        className={cx(
          'deck-heading',
          `deck-heading--${resolved}`,
          `deck-heading--tone-${tone}`,
          truncate && 'deck-heading--truncate',
          className,
        )}
        {...props}
      />
    )
  },
)
