import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { IconButton } from '../IconButton/IconButton'
import './Banner.css'

export type BannerTone = 'info' | 'success' | 'warning' | 'error' | 'brand'

/* `title` is overridden: the HTML attribute is a string tooltip, whereas a
   Banner heading is renderable content. */
export interface BannerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: BannerTone
  title?: ReactNode
  /** Trailing controls, e.g. an "Upgrade" or "Retry sync" Button. */
  actions?: ReactNode
  /** Shows a dismiss control. Dismissal state is the caller's to hold. */
  onDismiss?: () => void
  dismissLabel?: string
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * An inline message attached to the surface it concerns.
 *
 * Deck's workhorse for CRM sync failures, plan-cap warnings, the recipient
 * "create your own MeetCard" invite, and offline notices.
 *
 * `error` and `warning` announce themselves via `role="alert"`; the quieter
 * tones use `role="status"` so they don't interrupt. Tone is never the only
 * signal — always write a title or body that carries the meaning.
 *
 * @example
 * <Banner tone="warning" title="You're near your Solo limit"
 *   actions={<Button size="sm">Upgrade</Button>}>
 *   92 of 100 connections used.
 * </Banner>
 */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    tone = 'info',
    title,
    actions,
    onDismiss,
    dismissLabel = 'Dismiss',
    className,
    children,
    ...props
  },
  ref,
) {
  const urgent = tone === 'error' || tone === 'warning'

  return (
    <div
      ref={ref}
      className={cx('deck-banner', `deck-banner--${tone}`, className)}
      role={urgent ? 'alert' : 'status'}
      {...props}
    >
      <span className="deck-banner__marker" aria-hidden="true" />

      <div className="deck-banner__content">
        {title ? <p className="deck-banner__title">{title}</p> : null}
        {children ? <div className="deck-banner__body">{children}</div> : null}
      </div>

      {actions ? <div className="deck-banner__actions">{actions}</div> : null}

      {onDismiss ? (
        <IconButton
          label={dismissLabel}
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="deck-banner__dismiss"
        />
      ) : null}
    </div>
  )
})
