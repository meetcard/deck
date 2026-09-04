import { cx } from '../../lib/cx'
import type { ReactNode } from 'react'
import { Avatar } from '../Avatar/Avatar'
import { Link } from '../Link/Link'
import './PersonList.css'

export interface PersonListItem {
  name: string
  avatarSrc?: string
  /** Role or function, e.g. "Product Marketing". */
  role?: string
  company?: string
  /** Makes `company` a link. */
  companyHref?: string
  /** Makes the person's name a link to their profile. */
  href?: string
  /**
   * One trailing fact, at the end of the row — when you met, how long ago,
   * where. Text, not a control: the row's only interactive part is the name,
   * and a second target this small would be a hit area you cannot aim at.
   */
  meta?: ReactNode
}

export interface PersonListProps {
  people: PersonListItem[]
  /**
   * Names the list, and says which roster this is — "Who's attending",
   * "Recent connections". Required in spirit: a list of people with no name
   * is a list a screen reader cannot tell from the one above it.
   */
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
 * A roster of people — a compact identity row each, scannable down a column.
 *
 * The list form of a person, distinct from `PersonCard` and `ContactCard`:
 * this is a line you run your eye down, not the card you hand over or the
 * record you act on. `role`/`company` collapse to one muted line rather than
 * `PersonCard`'s separate fields, and there are no contact actions or footer.
 *
 * Deliberately not named for one screen. The same rows carry who is coming to
 * an event, who you met this week, and who works at a company — so the list
 * takes its subject from `label` rather than from its own name.
 *
 * @example
 * <PersonList
 *   label="Recent connections"
 *   people={[
 *     { name: 'Ben Ackles', role: 'Product Marketing', company: 'MeetCard',
 *       companyHref: '/companies/meetcard', href: '/ben', meta: '2h' },
 *   ]}
 * />
 */
export function PersonList({
  people,
  label = 'People',
  className,
}: PersonListProps) {
  return (
    <ul className={cx('deck-person-list', className)} aria-label={label}>
      {people.map((person, index) => {
        const detail = [person.role, person.company].filter(Boolean)

        return (
          <li key={index} className="deck-person-list__row">
            <Avatar name={person.name} src={person.avatarSrc} size="sm" />
            <span className="deck-person-list__text">
              <span className="deck-person-list__name">
                {person.href ? (
                  <Link href={person.href} tone="default" underline="hover">
                    {person.name}
                  </Link>
                ) : (
                  person.name
                )}
              </span>
              {detail.length > 0 && (
                <span className="deck-person-list__detail">
                  {person.role}
                  {person.role && person.company ? ' · ' : ''}
                  {person.company &&
                    (person.companyHref ? (
                      <Link
                        href={person.companyHref}
                        tone="muted"
                        underline="always"
                      >
                        {person.company}
                      </Link>
                    ) : (
                      person.company
                    ))}
                </span>
              )}
            </span>
            {person.meta ? (
              <span className="deck-person-list__meta">{person.meta}</span>
            ) : null}
            {person.href && (
              <span className="deck-person-list__open" aria-hidden="true">
                <OpenIcon />
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
