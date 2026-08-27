import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Link } from '../Link/Link'
import './AttendeeList.css'

export interface EventAttendee {
  name: string
  avatarSrc?: string
  /** Role or function, e.g. "Product Marketing". */
  role?: string
  company?: string
  /** Makes `company` a link. */
  companyHref?: string
  /** Makes the whole row a link to the attendee's profile. */
  href?: string
}

export interface AttendeeListProps {
  attendees: EventAttendee[]
  /** Accessible name for the list region. */
  label?: string
  className?: string
}

const OpenIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 4h6v6M12 4L4 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Who's coming to an event — a compact identity row per attendee, distinct
 * from `PersonCard`: this is a scannable list entry, not the full business
 * card. `role`/`company` collapse to one muted line rather than `PersonCard`'s
 * separate fields, and there's no contact actions or footer.
 *
 * @example
 * <AttendeeList
 *   attendees={[
 *     { name: 'Ben Ackles', role: 'Product Marketing', company: 'MeetCard',
 *       companyHref: '/companies/meetcard', href: '/ben' },
 *   ]}
 * />
 */
export function AttendeeList({
  attendees,
  label = "Who's attending",
  className,
}: AttendeeListProps) {
  return (
    <ul className={cx('deck-attendee-list', className)} aria-label={label}>
      {attendees.map((attendee, index) => {
        const detail = [attendee.role, attendee.company].filter(Boolean)

        return (
          <li key={index} className="deck-attendee-list__row">
            <Avatar name={attendee.name} src={attendee.avatarSrc} size="sm" />
            <span className="deck-attendee-list__text">
              <span className="deck-attendee-list__name">
                {attendee.href ? (
                  <Link href={attendee.href} tone="default" underline="hover">
                    {attendee.name}
                  </Link>
                ) : (
                  attendee.name
                )}
              </span>
              {detail.length > 0 && (
                <span className="deck-attendee-list__detail">
                  {attendee.role}
                  {attendee.role && attendee.company ? ' · ' : ''}
                  {attendee.company &&
                    (attendee.companyHref ? (
                      <Link href={attendee.companyHref} tone="muted" underline="always">
                        {attendee.company}
                      </Link>
                    ) : (
                      attendee.company
                    ))}
                </span>
              )}
            </span>
            {attendee.href && (
              <span className="deck-attendee-list__open" aria-hidden="true">
                <OpenIcon />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
