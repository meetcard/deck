import { forwardRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './Link.css'

export type LinkTone = 'brand' | 'default' | 'muted' | 'inverse'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone?: LinkTone
  /** `hover` keeps prose clean; `always` is clearer for standalone links. */
  underline?: 'always' | 'hover'
  /**
   * Opens in a new tab with safe `rel`, and appends a visually hidden
   * "(opens in a new tab)" so the behaviour is announced, not just implied.
   */
  external?: boolean
}

/**
 * A navigational anchor.
 *
 * Framework-agnostic by design: it renders a plain `<a>`. To use a router,
 * pass its link component's props through, or wrap this in your app.
 *
 * @example
 * <Link href="/deck">Back to your deck</Link>
 * <Link href="https://meetcard.com" external>meetcard.com</Link>
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    tone = 'brand',
    underline = 'hover',
    external = false,
    className,
    children,
    target,
    rel,
    ...props
  },
  ref,
) {
  return (
    <a
      ref={ref}
      className={cx(
        'deck-link',
        `deck-link--tone-${tone}`,
        `deck-link--underline-${underline}`,
        className,
      )}
      target={external ? (target ?? '_blank') : target}
      rel={external ? (rel ?? 'noopener noreferrer') : rel}
      {...props}
    >
      {children}
      {external ? (
        <span className="deck-visually-hidden"> (opens in a new tab)</span>
      ) : null}
    </a>
  )
})
