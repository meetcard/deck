import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { spaceVar, type Space } from '../../foundations/tokens'
import './Stack.css'

export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

/** Layout containers only — `Stack` never renders interactive elements. */
export type StackElement =
  | 'div'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'ul'
  | 'ol'
  | 'li'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  direction?: 'row' | 'column'
  /** Gap as a Deck space step (px). Defaults to 16. */
  gap?: Space
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
  /** Render as `inline-flex` instead of `flex`. */
  inline?: boolean
  as?: StackElement
}

/**
 * The workhorse layout primitive: a flex container with token-bound spacing.
 *
 * Reach for `Stack` instead of one-off margins — it keeps rhythm consistent
 * and means components never need layout props of their own.
 *
 * @example
 * <Stack direction="row" gap={8} align="center">
 *   <Avatar name="Ada Lovelace" />
 *   <Text>Ada Lovelace</Text>
 * </Stack>
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 16,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    inline = false,
    as: Tag = 'div',
    className,
    style,
    ...props
  },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={cx(
        'deck-stack',
        `deck-stack--${direction}`,
        `deck-stack--align-${align}`,
        `deck-stack--justify-${justify}`,
        wrap && 'deck-stack--wrap',
        inline && 'deck-stack--inline',
        className,
      )}
      style={{ '--deck-stack-gap': spaceVar(gap), ...style } as CSSProperties}
      {...props}
    />
  )
})
