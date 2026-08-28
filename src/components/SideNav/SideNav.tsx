import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './SideNav.css'

export interface SideNavItemProps {
  /** Stable key, usually the route. */
  id: string
  label: string
  icon: ReactNode
  href?: string
  /** Small count, e.g. pending follow-ups. */
  badge?: number
}

export interface SideNavProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: SideNavItemProps[]
  /** `id` of the active destination. */
  currentId?: string
  onSelect?: (id: string) => void
  /**
   * Destinations pinned to the foot of the rail, below a flexible gap —
   * Settings in MeetCard. They are the same kind of thing as `items`, only
   * reached less often, so they render inside the same navigation landmark
   * as a second list rather than in a landmark of their own.
   */
  footerItems?: SideNavItemProps[]
  /**
   * Accessible name of the landmark. Deliberately not "Primary": the shell
   * renders this and `BottomNav` into the same document, and two navigation
   * landmarks may not share a name.
   */
  label?: string
}

/**
 * The desktop navigation rail.
 *
 * `BottomNav`'s counterpart above the `md` breakpoint, and a deliberate
 * sibling of it rather than a port: the two carry different destinations
 * because the devices are used differently. The rail leads with managing
 * your own cards and connections; the bar leads with Exchange, which is a
 * thing you do standing in front of someone with a phone in your hand.
 *
 * The root is a `<nav>`, not the `<aside>` the visual design implies.
 * `<aside>` maps to the `complementary` landmark — "tangentially related to
 * the main content" — which the app's own navigation is not. The rail look
 * comes from CSS; the semantics stay honest.
 *
 * `footerItems` renders as a second list inside that same landmark, pinned
 * down by a flexible margin. Splitting it into its own `<nav>` would either
 * add an unnamed landmark or a second one competing for the same name, for
 * a result CSS already gives us.
 *
 * A destination with an `href` renders as a real link; without one it
 * renders as a button. `onSelect` fires either way, so a router can
 * intercept the click while the markup stays navigable and shareable.
 * The active item carries `aria-current="page"`, so it is announced rather
 * than only colored.
 *
 * @example
 * <SideNav
 *   currentId="/connections"
 *   items={destinations}
 *   footerItems={[settings]}
 * />
 */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav(
  {
    items,
    currentId,
    onSelect,
    footerItems,
    label = 'Global',
    className,
    ...props
  },
  ref,
) {
  const renderItem = (item: SideNavItemProps) => {
    const active = item.id === currentId
    const hasBadge = typeof item.badge === 'number' && item.badge > 0
    // Set the name explicitly rather than letting it be assembled from
    // sibling text nodes, which inserts stray whitespace before the comma.
    const accessibleName = hasBadge
      ? `${item.label}, ${item.badge} pending`
      : undefined

    const content = (
      <>
        <span className="deck-side-nav__icon" aria-hidden="true">
          {item.icon}
        </span>
        <span className="deck-side-nav__label">{item.label}</span>
        {hasBadge ? (
          <span className="deck-side-nav__badge" aria-hidden="true">
            {(item.badge as number) > 99 ? '99+' : item.badge}
          </span>
        ) : null}
      </>
    )

    const classes = cx(
      'deck-side-nav__item',
      active && 'deck-side-nav__item--active',
    )

    return (
      <li key={item.id}>
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
      className={cx('deck-side-nav', className)}
      {...props}
    >
      <ul className="deck-side-nav__list">{items.map(renderItem)}</ul>

      {footerItems?.length ? (
        <ul className="deck-side-nav__list deck-side-nav__list--footer">
          {footerItems.map(renderItem)}
        </ul>
      ) : null}
    </nav>
  )
})
