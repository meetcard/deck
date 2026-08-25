import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Divider.css'

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  /** Use the higher-contrast border token. */
  strong?: boolean
  /**
   * Hide from assistive tech. Set this when the rule is purely visual and the
   * surrounding markup already conveys the grouping.
   */
  decorative?: boolean
}

/**
 * A one-pixel rule on the Hairline token.
 *
 * Renders `<hr>`, whose implicit ARIA role is already `separator`.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" decorative />
 */
export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = 'horizontal', strong = false, decorative = false, className, ...props },
  ref,
) {
  return (
    <hr
      ref={ref}
      className={cx(
        'deck-divider',
        `deck-divider--${orientation}`,
        strong && 'deck-divider--strong',
        className,
      )}
      aria-orientation={decorative ? undefined : orientation}
      aria-hidden={decorative || undefined}
      role={decorative ? 'presentation' : undefined}
      {...props}
    />
  )
})
