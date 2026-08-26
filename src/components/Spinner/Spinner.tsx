import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Spinner.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  /**
   * Announced to assistive tech. Set to `null` when a visible label already
   * describes the wait, so screen readers don't hear it twice.
   */
  label?: string | null
}

/**
 * An indeterminate loading indicator.
 *
 * @example
 * <Spinner label="Syncing to CRM" />
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner({ size = 'md', label = 'Loading', className, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cx('deck-spinner', `deck-spinner--${size}`, className)}
        role={label ? 'status' : undefined}
        aria-hidden={label ? undefined : true}
        {...props}
      >
        <span className="deck-spinner__track" />
        {label ? <span className="deck-visually-hidden">{label}</span> : null}
      </span>
    )
  },
)
