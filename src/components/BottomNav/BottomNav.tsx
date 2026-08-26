import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './BottomNav.css'

export interface BottomNavItemProps {
  /** Stable key, usually the route. */
  id: string
  label: string
  icon: ReactNode
  href?: string
  /** Small count, e.g. pending follow-ups. */
  badge?: number
}

export interface BottomNavProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: BottomNavItemProps[]
  /** `id` of the active destination. */
  currentId?: string
  onSelect?: (id: string) => void
  /**
   * The elevated center action. In MeetCard this is Exchange, which opens a
   * sheet rather than navigating — it is an action, not a destination, so it
   * is deliberately not part of `items`.
   */
  centerAction?: {
    label: string
    icon: ReactNode
    onClick: () => void
  }
  label?: string
}

/**
 * The app's primary navigation bar.
 *
 * Four destinations plus one elevated center action, following the shell's
 * organising principle: destinations are places you go, and Exchange is the
 * thing you do. The center action sits thumb-reachable so the product's
 * highest-frequency moment is one tap from anywhere.
 *
 * A destination with an `href` renders as a real link; without one it
 * renders as a button. `onSelect` fires either way, so a router can
 * intercept the click while the markup stays navigable and shareable.
 * The active item carries `aria-current="page"`, so it is announced rather
 * than only colored.
 *
 * @example
 * <BottomNav currentId="/connections" items={destinations}
 *   centerAction={{ label: 'Exchange', icon: <QrIcon />, onClick: openSheet }} />
 */
export const BottomNav = forwardRef<HTMLElement, BottomNavProps>(
  function BottomNav(
    {
      items,
      currentId,
      onSelect,
      centerAction,
      label = 'Primary',
      className,
      ...props
    },
    ref,
  ) {
    // The center action is inserted mid-list so it sits between destinations.
    const splitAt = Math.ceil(items.length / 2)
    const lead = items.slice(0, splitAt)
    const trail = items.slice(splitAt)

    const renderItem = (item: BottomNavItemProps) => {
      const active = item.id === currentId
      const hasBadge = typeof item.badge === 'number' && item.badge > 0
      // Set the name explicitly rather than letting it be assembled from
      // sibling text nodes, which inserts stray whitespace before the comma.
      const accessibleName = hasBadge
        ? `${item.label}, ${item.badge} pending`
        : undefined

      const content = (
        <>
          <span className="deck-bottom-nav__icon" aria-hidden="true">
            {item.icon}
            {hasBadge ? (
              <span className="deck-bottom-nav__badge">
                {(item.badge as number) > 99 ? '99+' : item.badge}
              </span>
            ) : null}
          </span>
          <span className="deck-bottom-nav__label">{item.label}</span>
        </>
      )

      const classes = cx(
        'deck-bottom-nav__item',
        active && 'deck-bottom-nav__item--active',
      )

      return (
        <li key={item.id} className="deck-bottom-nav__slot">
          {item.href ? (
            <a
              href={item.href}
              className={classes}
              aria-label={accessibleName}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              {content}
            </a>
          ) : (
            <button
              type="button"
              className={classes}
              aria-label={accessibleName}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              {content}
            </button>
          )}
        </li>
      )
    }

    return (
      <nav
        ref={ref}
        aria-label={label}
        className={cx('deck-bottom-nav', className)}
        {...props}
      >
        <ul className="deck-bottom-nav__list">
          {lead.map(renderItem)}

          {centerAction ? (
            <li className="deck-bottom-nav__slot deck-bottom-nav__slot--center">
              <button
                type="button"
                className="deck-bottom-nav__center"
                onClick={centerAction.onClick}
              >
                <span className="deck-bottom-nav__center-icon" aria-hidden="true">
                  {centerAction.icon}
                </span>
                <span className="deck-visually-hidden">
                  {centerAction.label}
                </span>
              </button>
              <span className="deck-bottom-nav__center-label" aria-hidden="true">
                {centerAction.label}
              </span>
            </li>
          ) : null}

          {trail.map(renderItem)}
        </ul>
      </nav>
    )
  },
)
