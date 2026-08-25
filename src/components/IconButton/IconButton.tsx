import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import type { ButtonSize, ButtonVariant } from '../Button/Button'
import './IconButton.css'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Accessible name, required. An icon alone announces as "button" to a
   * screen reader, so Deck makes the label impossible to forget.
   */
  label: string
  /** The icon itself. Rendered `aria-hidden` — `label` is the name. */
  icon: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** Render as a circle. Good for avatars, overflow menus, and toolbars. */
  round?: boolean
}

/**
 * A square (or round) button containing only an icon.
 *
 * @example
 * <IconButton label="Share card" icon={<ShareIcon />} variant="ghost" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      icon,
      variant = 'ghost',
      size = 'md',
      round = false,
      type = 'button',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cx(
          'deck-icon-button',
          `deck-icon-button--${variant}`,
          `deck-icon-button--${size}`,
          round && 'deck-icon-button--round',
          className,
        )}
        {...props}
      >
        <span className="deck-icon-button__icon" aria-hidden="true">
          {icon}
        </span>
      </button>
    )
  },
)
