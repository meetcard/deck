import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Badge.css'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error'

export type BadgeVariant = 'subtle' | 'solid' | 'outline'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  /** Show a leading status dot. */
  dot?: boolean
}

/**
 * A compact status or category label.
 *
 * Badges are not interactive and carry no implicit ARIA role. When the badge
 * communicates a state change (for example, "Sync failed"), announce it from
 * a live region in the surrounding UI rather than relying on colour.
 *
 * @example
 * <Badge tone="success" dot>Connected</Badge>
 * <Badge tone="warning" variant="solid">Follow up</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = 'neutral',
    variant = 'subtle',
    size = 'md',
    dot = false,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(
        'deck-badge',
        `deck-badge--${tone}`,
        `deck-badge--${variant}`,
        `deck-badge--${size}`,
        className,
      )}
      {...props}
    >
      {dot ? <span className="deck-badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
})
