import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import './MemberRow.css'

export type MemberStatus = 'active' | 'invited' | 'suspended'

export interface MemberRowProps
  /* `role` is the domain word here — the seat someone holds — so the DOM
     attribute of the same name is given up rather than shadowed. The row is
     a plain `div` whose ARIA role is nothing the caller should be setting. */
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role'> {
  /**
   * The person. For an invitation nobody has accepted yet this is the email
   * address, because that is genuinely all the team knows about them.
   */
  name: string
  email?: ReactNode
  avatarSrc?: string
  /** Marks the signed-in person, so nobody removes their own seat by mistake. */
  isYou?: boolean
  status?: MemberStatus
  /** The role: a `Select` where it can be changed, a `Badge` where it can't. */
  role?: ReactNode
  /** Resend, revoke, remove — whatever this row can do. */
  actions?: ReactNode
}

const STATUS: Record<
  MemberStatus,
  { label: string; tone: 'success' | 'warning' | 'neutral' }
> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'warning' },
  suspended: { label: 'Suspended', tone: 'neutral' },
}

/**
 * One person on the team: who they are, where their invitation stands, what
 * they can do, and what you can do about it.
 *
 * Invited and active are the same row on purpose. A seat is spent the moment
 * an invitation goes out, so a pending teammate belongs in the roster they
 * are already being counted in — not in a separate list below it that makes
 * the seat maths look wrong.
 *
 * `isYou` is a guard as much as a label: the row you must not remove is the
 * one worth marking.
 *
 * @example
 * <MemberRow name="Sam Oyelaran" email="sam@meetcard.io" status="active"
 *   role={<Select label="Role" hideLabel size="sm" options={roles} />} />
 */
export const MemberRow = forwardRef<HTMLDivElement, MemberRowProps>(
  function MemberRow(
    {
      name,
      email,
      avatarSrc,
      isYou,
      status = 'active',
      role,
      actions,
      className,
      ...props
    },
    ref,
  ) {
    const preset = STATUS[status]

    return (
      <div ref={ref} className={cx('deck-member-row', className)} {...props}>
        {/* Decorative: the name is text on the row directly beside it, so an
            announced avatar would say it twice. */}
        <Avatar name={name} src={avatarSrc} size="md" decorative />

        <div className="deck-member-row__body">
          <div className="deck-member-row__heading">
            <span className="deck-member-row__name">{name}</span>
            {isYou ? (
              <Badge tone="neutral" size="sm">
                You
              </Badge>
            ) : null}
            <Badge tone={preset.tone} size="sm">
              {preset.label}
            </Badge>
          </div>

          {email ? <p className="deck-member-row__email">{email}</p> : null}
        </div>

        {role ? <div className="deck-member-row__role">{role}</div> : null}
        {actions ? (
          <div className="deck-member-row__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
