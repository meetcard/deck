import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './AppBar.css'

export interface AppBarProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Brand mark, at the left. Usually the MeetCard app mark. */
  brand?: ReactNode
  /** Page title, shown when a mark alone is not enough context. */
  title?: ReactNode
  /** Right-hand slot — the "Me" account entry point. */
  actions?: ReactNode
  /** Keeps the bar pinned while content scrolls beneath it. */
  sticky?: boolean
}

/**
 * The persistent application header.
 *
 * Per the app shell: the mark sits at the left, and account access ("Me")
 * at the right. Pair with `BottomNav` for the full PWA shell.
 *
 * @example
 * <AppBar brand={<Logo />} actions={<IconButton label="Me" icon={<Avatar …/>} />} />
 */
export const AppBar = forwardRef<HTMLElement, AppBarProps>(function AppBar(
  { brand, title, actions, sticky = true, className, children, ...props },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cx('deck-app-bar', sticky && 'deck-app-bar--sticky', className)}
      {...props}
    >
      <div className="deck-app-bar__lead">
        {brand ? <span className="deck-app-bar__brand">{brand}</span> : null}
        {title ? <span className="deck-app-bar__title">{title}</span> : null}
      </div>

      {children ? <div className="deck-app-bar__center">{children}</div> : null}

      {actions ? <div className="deck-app-bar__actions">{actions}</div> : null}
    </header>
  )
})
