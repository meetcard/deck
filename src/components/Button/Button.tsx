import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to fill the container — useful in card footers and forms. */
  fullWidth?: boolean
  /** Decorative leading icon. Hidden from assistive tech automatically. */
  iconStart?: ReactNode
  /** Decorative trailing icon. Hidden from assistive tech automatically. */
  iconEnd?: ReactNode
}

/**
 * The primary action control.
 *
 * Defaults to `type="button"` — an explicit opt-in is required to submit a
 * form, which avoids the single most common accidental-submit bug.
 *
 * @example
 * <Button variant="primary">Share card</Button>
 * <Button variant="secondary" iconStart={<PlusIcon />}>Add to CRM</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    iconStart,
    iconEnd,
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'deck-button',
        `deck-button--${variant}`,
        `deck-button--${size}`,
        fullWidth && 'deck-button--full-width',
        className,
      )}
      {...props}
    >
      {iconStart ? (
        <span className="deck-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      {children}
      {iconEnd ? (
        <span className="deck-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
    </button>
  )
})
