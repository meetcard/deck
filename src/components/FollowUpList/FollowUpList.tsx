import { useId } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Heading } from '../Heading/Heading'
import './FollowUpList.css'

export interface FollowUpItem {
  /** Stable key. */
  id: string
  name: string
  avatarSrc?: string
  /** Why they are on the list — "Met at RevOps", "Promised an intro". */
  reason?: string
  /** How long it has been waiting — "2 days ago", "Yesterday". */
  since?: string
  /** Where following up happens. Renders the row's action as a link. */
  href?: string
  /** Following up in place. Renders the row's action as a button. */
  onFollowUp?: () => void
}

export interface FollowUpListProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /**
   * Who is owed something, most pressing first. Left in the caller's order —
   * a queue that silently re-sorts itself hides whatever produced it.
   */
  items: FollowUpItem[]
  /** The panel's heading. Defaults to "Follow-up". */
  title?: ReactNode
  /** Heading rank, for the outline of the page this sits on. */
  level?: 2 | 3 | 4
  /** The wording on each row's action. Defaults to "Follow up". */
  actionLabel?: string
  /** What the panel says when nobody is waiting. */
  emptyMessage?: ReactNode
}

const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * The people you owe something, and the one control that discharges it.
 *
 * A queue, not a list: every row is a task, so every row ends in the action
 * that clears it. That is what separates this from `PersonList`, which is a
 * roster you read. The count is derived from the rows rather than passed in,
 * because a panel that said "3 due" over four people would be a bug you could
 * only find by counting.
 *
 * It carries the brand as a tint — the one module on a dashboard that is
 * asking for something rather than reporting, and colour is how it says so.
 * The asking is in words too: the heading, the count, and each row's action
 * all read as an obligation without the tint.
 *
 * Each action names the person it belongs to for assistive tech — three
 * links all called "Follow up" is a list a screen reader cannot navigate,
 * and the name is the only thing that distinguishes them.
 *
 * @example
 * <FollowUpList
 *   items={[
 *     { id: 'priya', name: 'Priya Shah', reason: 'Met at RevOps',
 *       since: '2 days ago', href: '/connections' },
 *   ]}
 * />
 */
export function FollowUpList({
  items,
  title = 'Follow-up',
  level = 3,
  actionLabel = 'Follow up',
  emptyMessage = 'Nobody is waiting on you.',
  className,
  ...props
}: FollowUpListProps) {
  const headingId = useId()

  return (
    <section
      className={cx('deck-follow-up-list', className)}
      aria-labelledby={headingId}
      {...props}
    >
      <div className="deck-follow-up-list__header">
        <Heading
          id={headingId}
          level={level}
          size="xs"
          className="deck-follow-up-list__title"
        >
          {title}
        </Heading>

        {items.length > 0 ? (
          <Badge tone="brand" variant="solid" size="sm">
            {items.length} due
          </Badge>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="deck-follow-up-list__empty">{emptyMessage}</p>
      ) : (
        <ul className="deck-follow-up-list__items">
          {items.map((item) => {
            const context = [item.reason, item.since].filter(Boolean).join(' · ')

            /* The visible word is the same on every row, which is right — it
               is the same task. The person's name rides along hidden, so the
               link's accessible name says which row it clears. */
            const label = (
              <>
                {actionLabel}
                <span className="deck-visually-hidden"> with {item.name}</span>
              </>
            )

            return (
              <li key={item.id} className="deck-follow-up-list__item">
                <Avatar
                  name={item.name}
                  src={item.avatarSrc}
                  size="sm"
                  decorative
                />

                <span className="deck-follow-up-list__text">
                  <span className="deck-follow-up-list__name">{item.name}</span>
                  {context ? (
                    <span className="deck-follow-up-list__context">
                      {context}
                    </span>
                  ) : null}
                </span>

                {/* A destination is a link and an action is a button, and
                    which one this is depends on where the product put
                    following up. The anchor borrows `Button`'s classes for
                    the same reason `LinkButton` does: `Button` is a real
                    `<button>` on purpose, and re-drawing the control here
                    would be a second copy of it. */}
                {item.href ? (
                  <a
                    href={item.href}
                    className="deck-button deck-button--primary deck-button--sm deck-follow-up-list__action"
                  >
                    {label}
                    <span className="deck-button__icon" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </a>
                ) : item.onFollowUp ? (
                  <Button
                    size="sm"
                    className="deck-follow-up-list__action"
                    iconEnd={<ArrowIcon />}
                    onClick={item.onFollowUp}
                  >
                    {label}
                  </Button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
