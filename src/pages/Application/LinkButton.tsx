import type { AnchorHTMLAttributes, ReactNode } from 'react'
import type { ButtonSize, ButtonVariant } from '../../components/Button/Button'
import { cx } from '../../lib/cx'
import '../../components/Button/Button.css'

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconStart?: ReactNode
  iconEnd?: ReactNode
  children: ReactNode
}

/**
 * A destination that looks like a button.
 *
 * Deck's `Button` is a real `<button>` and is deliberately not polymorphic,
 * but "Add event" and "Cancel" *go somewhere* — they are links, and the two
 * alternatives are both worse than this. Rendering them as buttons ships
 * controls that do nothing, because Deck has no router. Re-drawing the button
 * in page CSS duplicates a component that already exists.
 *
 * So this borrows `Button`'s own classes for an anchor. It lives here rather
 * than in `src/components` on purpose: it is a composition, not a new part of
 * the system. If the product wants button-shaped links permanently, the
 * honest fix is `href` support on `Button` itself, and this file goes away.
 */
export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  iconStart,
  iconEnd,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      href={href}
      className={cx(
        'deck-button',
        `deck-button--${variant}`,
        `deck-button--${size}`,
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
    </a>
  )
}
