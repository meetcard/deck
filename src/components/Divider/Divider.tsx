import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode, Ref } from 'react'
import { cx } from '../../lib/cx'
import './Divider.css'

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Use the higher-contrast border token. */
  strong?: boolean
  /**
   * Hide from assistive tech. Set this when the rule is purely visual and the
   * surrounding markup already conveys the grouping.
   */
  decorative?: boolean
  /**
   * Caption set into the middle of the rule — the "OR" between a sign-in form
   * and its provider row. Horizontal only.
   *
   * Keep it to a word or two. This is a separator that happens to say what it
   * separates, not a heading: if the text explains rather than labels, it
   * wants to be a `Heading` or `Text` above the group instead.
   */
  label?: ReactNode
}

/**
 * A one-pixel rule on the Hairline token.
 *
 * Renders `<hr>`, whose implicit ARIA role is already `separator`.
 *
 * The one exception is `label`: `<hr>` is a void element and cannot contain
 * text, so a captioned rule renders a `<div role="separator">` holding two
 * rules and the caption. Same token, same role — different element, because
 * the semantic one has nowhere to put the words.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" decorative />
 * <Divider label="OR" />
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    strong = false,
    decorative = false,
    label,
    className,
    ...props
  },
  ref,
) {
  // A vertical rule has no room for a caption, and stacking one inside a
  // 1px column would silently produce a very tall divider rather than an
  // obvious mistake. Horizontal is the only orientation the caption supports.
  const captioned = label !== undefined && orientation === 'horizontal'

  const classes = cx(
    'deck-divider',
    `deck-divider--${orientation}`,
    strong && 'deck-divider--strong',
    captioned && 'deck-divider--labelled',
    className,
  )

  const aria = {
    'aria-orientation': decorative ? undefined : orientation,
    'aria-hidden': decorative || undefined,
    role: decorative ? 'presentation' : undefined,
  } as const

  if (captioned) {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={classes}
        {...aria}
        role={decorative ? 'presentation' : 'separator'}
        {...props}
      >
        <span className="deck-divider__rule" aria-hidden="true" />
        <span className="deck-divider__label">{label}</span>
        <span className="deck-divider__rule" aria-hidden="true" />
      </div>
    )
  }

  return (
    <hr
      ref={ref as Ref<HTMLHRElement>}
      className={classes}
      {...aria}
      {...props}
    />
  )
})
