import { cx } from '../../lib/cx'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import './RsvpControl.css'

export type RsvpStatus = 'yes' | 'maybe' | 'no'

export interface RsvpCounts {
  yes: number
  maybe: number
  no: number
}

export interface RsvpControlProps {
  value?: RsvpStatus
  onChange?: (status: RsvpStatus) => void
  /** Tallies shown below the control. */
  counts: RsvpCounts
  label?: string
  name?: string
  className?: string
}

const YesIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 8.5l3.5 3.5L13 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MaybeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M6.3 6.2a1.8 1.8 0 1 1 2.6 1.7c-.6.3-.9.7-.9 1.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11.2" r="0.15" fill="currentColor" stroke="none" />
  </svg>
)

const NoIcon = () => (
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
 * Tri-state RSVP for an event, with the running tally kept alongside it.
 *
 * Built on `ChoiceGroup` rather than duplicating its selection behavior —
 * the icons live in the option `label`, and the tally is the one thing a
 * plain choice group doesn't carry.
 *
 * @example
 * <RsvpControl
 *   value={status}
 *   onChange={setStatus}
 *   counts={{ yes: 12, maybe: 3, no: 1 }}
 * />
 */
export function RsvpControl({
  value,
  onChange,
  counts,
  label = 'Are you attending?',
  name,
  className,
}: RsvpControlProps) {
  return (
    <div className={cx('deck-rsvp-control', className)}>
      <ChoiceGroup
        label={label}
        name={name}
        variant="pill"
        value={value}
        onChange={(next) => onChange?.(next as RsvpStatus)}
        options={[
          {
            value: 'yes',
            label: (
              <span className="deck-rsvp-control__option">
                <YesIcon />
                Yes
              </span>
            ),
          },
          {
            value: 'maybe',
            label: (
              <span className="deck-rsvp-control__option">
                <MaybeIcon />
                Maybe
              </span>
            ),
          },
          {
            value: 'no',
            label: (
              <span className="deck-rsvp-control__option">
                <NoIcon />
                No
              </span>
            ),
          },
        ]}
      />
      <p className="deck-rsvp-control__tally">
        {counts.yes} attending · {counts.maybe} maybe · {counts.no} not attending
      </p>
    </div>
  )
}
