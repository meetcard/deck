import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Badge } from '../Badge/Badge'
import './IntegrationRow.css'

export type IntegrationStatus = 'connected' | 'disconnected' | 'attention'

export interface IntegrationRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The service, as its own users call it — "HubSpot", "Google Calendar". */
  name: ReactNode
  /** The service's mark. Decorative: `name` is what gets announced. */
  logo?: ReactNode
  /** What connecting it buys you. */
  description?: ReactNode
  /**
   * Which identity the connection runs as — `ben@meetcard.io`, `benackles`.
   * The question people actually have about a connected account is *which*
   * account, so it sits on the row rather than behind "Manage".
   */
  account?: ReactNode
  status?: IntegrationStatus
  /**
   * Overrides the pill's words. The states are shared but their vocabulary
   * is not: a calendar is "Calendar enabled", a CRM is "Connected".
   */
  statusLabel?: ReactNode
  /** Connect, Manage, Disconnect — whatever this row can do. */
  actions?: ReactNode
}

const STATUS: Record<IntegrationStatus, { label: string; tone: 'success' | 'neutral' | 'warning' }> =
  {
    connected: { label: 'Connected', tone: 'success' },
    disconnected: { label: 'Not connected', tone: 'neutral' },
    attention: { label: 'Needs permission', tone: 'warning' },
  }

/**
 * One external service and where you stand with it.
 *
 * The same row does CRM connections, SSO providers, and calendars, because
 * from the person's side they are one question asked repeatedly: is this
 * connected, as whom, and what can I do about it. Three states rather than a
 * boolean — a connection whose permissions have lapsed is neither on nor off,
 * and that is exactly the row someone came to this screen to fix.
 *
 * The state is a `Badge` with words in it, never a colored dot, so it survives
 * being read aloud or printed.
 *
 * @example
 * <IntegrationRow name="HubSpot" logo={<HubSpotMark />} status="connected"
 *   account="acme.hubspot.com"
 *   description="Sync connections and their notes as contacts."
 *   actions={<Button variant="secondary" size="sm">Disconnect</Button>} />
 */
export const IntegrationRow = forwardRef<HTMLDivElement, IntegrationRowProps>(
  function IntegrationRow(
    {
      name,
      logo,
      description,
      account,
      status = 'disconnected',
      statusLabel,
      actions,
      className,
      ...props
    },
    ref,
  ) {
    const preset = STATUS[status]

    return (
      <div
        ref={ref}
        className={cx('deck-integration-row', className)}
        {...props}
      >
        {logo ? (
          <span className="deck-integration-row__logo" aria-hidden="true">
            {logo}
          </span>
        ) : null}

        <div className="deck-integration-row__body">
          <div className="deck-integration-row__heading">
            <span className="deck-integration-row__name">{name}</span>
            <Badge tone={preset.tone} size="sm">
              {statusLabel ?? preset.label}
            </Badge>
          </div>

          {account ? (
            <p className="deck-integration-row__account">{account}</p>
          ) : null}

          {description ? (
            <p className="deck-integration-row__description">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="deck-integration-row__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
