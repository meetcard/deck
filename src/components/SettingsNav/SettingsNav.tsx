import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Select } from '../Select/Select'
import { cx } from '../../lib/cx'
import './SettingsNav.css'

export interface SettingsNavItemProps {
  /** Stable key, usually the route. */
  id: string
  label: string
  icon: ReactNode
  href?: string
}

export interface SettingsNavGroup {
  /** Section heading, e.g. "User" or "Admin". Rendered upper-cased. */
  label: string
  items: SettingsNavItemProps[]
}

export interface SettingsNavProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  groups: SettingsNavGroup[]
  /** `id` of the section being shown. */
  currentId?: string
  onSelect?: (id: string) => void
  /** Accessible name of the landmark. */
  label?: string
  /** Accessible name of the narrow-screen control. */
  selectLabel?: string
}

/**
 * Switching between the sections of a settings page.
 *
 * Two controls for one job, chosen by width. From `md` up it is a list, which
 * shows every section at once and keeps the current one visible while you read
 * the panel beside it. Below that it is a `<select>` — eight destinations
 * stacked above the content would push the content itself off the screen, and
 * a native select opens as the platform's own picker, which is the one control
 * on a phone nobody has to learn.
 *
 * The swap is CSS, so there is no viewport JS to disagree with the server, and
 * whichever control is hidden is `display: none` and therefore out of the
 * accessibility tree rather than merely invisible.
 *
 * Groups survive the swap. The headings become `<optgroup>`s, because the
 * split between what is yours and what is your company's is the same
 * information at either width, and dropping it on the smaller screen is the
 * kind of quiet loss that makes a settings page hard to navigate.
 *
 * @example
 * <SettingsNav
 *   currentId="/settings/profile"
 *   groups={[{ label: 'User', items: [...] }]}
 *   onSelect={go}
 * />
 */
export const SettingsNav = forwardRef<HTMLElement, SettingsNavProps>(
  function SettingsNav(
    {
      groups,
      currentId,
      onSelect,
      label = 'Settings',
      selectLabel = 'Select settings option',
      className,
      ...props
    },
    ref,
  ) {
    const renderItem = (item: SettingsNavItemProps) => {
      const active = item.id === currentId
      const classes = cx(
        'deck-settings-nav__item',
        active && 'deck-settings-nav__item--active',
      )
      const content = (
        <>
          <span className="deck-settings-nav__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="deck-settings-nav__label">{item.label}</span>
        </>
      )

      return (
        <li key={item.id}>
          {item.href ? (
            <a
              href={item.href}
              className={classes}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              {content}
            </a>
          ) : (
            <button
              type="button"
              className={classes}
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
      <div className={cx('deck-settings-nav', className)}>
        <nav
          ref={ref}
          aria-label={label}
          className="deck-settings-nav__list-view"
          {...props}
        >
          {groups.map((group) => (
            <div key={group.label} className="deck-settings-nav__group">
              <h2 className="deck-settings-nav__group-label">{group.label}</h2>
              <ul className="deck-settings-nav__list">
                {group.items.map(renderItem)}
              </ul>
            </div>
          ))}
        </nav>

        <div className="deck-settings-nav__select-view">
          <Select
            label={selectLabel}
            value={currentId ?? ''}
            onChange={(event) => onSelect?.(event.target.value)}
            options={groups.map((group) => ({
              label: group.label,
              options: group.items.map((item) => ({
                value: item.id,
                label: item.label,
              })),
            }))}
          />
        </div>
      </div>
    )
  },
)
