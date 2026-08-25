import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Text.css'

export type TextSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

export type TextTone =
  | 'default'
  | 'muted'
  | 'disabled'
  | 'inverse'
  | 'brand'
  | 'display'
  | 'error'
  | 'warning'

export type TextWeight = 'regular' | 'medium' | 'semibold'

/** Constrained on purpose: `Text` is for prose, not arbitrary elements. */
export type TextElement = 'p' | 'span' | 'div'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Body scale step. Defaults to `md` (16/24), the standard reading size. */
  size?: TextSize
  /** Semantic color role. */
  tone?: TextTone
  weight?: TextWeight
  /** Rendered element. Use `span` for inline text inside another block. */
  as?: TextElement
  /** Clamp to a single line with an ellipsis. */
  truncate?: boolean
}

/**
 * Body copy at Deck's Body type scale.
 *
 * @example
 * <Text tone="muted" size="sm">Connected 3 days ago</Text>
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    size = 'md',
    tone = 'default',
    weight = 'regular',
    as: Tag = 'p',
    truncate = false,
    className,
    ...props
  },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={cx(
        'deck-text',
        `deck-text--${size}`,
        `deck-text--tone-${tone}`,
        `deck-text--weight-${weight}`,
        truncate && 'deck-text--truncate',
        className,
      )}
      {...props}
    />
  )
})
