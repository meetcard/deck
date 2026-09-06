import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '../../../components/Button/Button'
import { MemberRow } from '../../../components/MemberRow/MemberRow'
import { Select } from '../../../components/Select/Select'
import { Stack } from '../../../components/Stack/Stack'
import { UsageMeter } from '../../../components/UsageMeter/UsageMeter'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

type Role = 'owner' | 'admin' | 'member'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'invited'
  isYou?: boolean
}

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
]

const MEMBERS: Member[] = [
  {
    id: 'ben',
    name: 'Ben Ackles',
    email: 'ben@meetcard.io',
    role: 'owner',
    status: 'active',
    isYou: true,
  },
  {
    id: 'sam',
    name: 'Sam Oyelaran',
    email: 'sam@meetcard.io',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'prisha',
    name: 'Prisha Nair',
    email: 'prisha@meetcard.io',
    role: 'member',
    status: 'active',
  },
  {
    id: 'maya',
    name: 'Maya Sorensen',
    email: 'maya@meetcard.io',
    role: 'member',
    status: 'active',
  },
  {
    id: 'dana',
    name: 'dana@meetcard.io',
    email: 'Invitation pending',
    role: 'member',
    status: 'invited',
  },
]

const SEATS = 10

/**
 * The team roster and the seats it is spending.
 *
 * Invitations sit in the same list as everyone else, because a seat is spent
 * the moment one goes out. Filing pending invites separately below the roster
 * is how a team ends up surprised by the bill.
 *
 * No save bar: changing a role or revoking an invitation takes effect on the
 * row, and there is nothing left over to commit.
 */
export function Team() {
  const [members, setMembers] = useState(MEMBERS)

  const setRole = (id: string, role: Role) =>
    setMembers((all) =>
      all.map((member) => (member.id === id ? { ...member, role } : member)),
    )

  const revoke = (id: string) =>
    setMembers((all) => all.filter((member) => member.id !== id))

  const used = members.length

  return (
    <SettingsPanel
      eyebrow="Team"
      title="Team"
      description="Invite teammates, set their role, and keep an eye on your seat usage."
    >
      <Stack gap={24}>
        <SettingsGroup
          title="Seats"
          description="Invitations count against your seats as soon as they are sent."
        >
          <div className="settings__seats">
            <UsageMeter
              label="Seats used"
              value={used}
              max={SEATS}
              formatValue={(value, max) => `${value} of ${max} seats used`}
              footer={
                <Button size="sm" variant="secondary">
                  Manage seats
                </Button>
              }
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Team members"
          action={
            <Button size="sm" iconStart={<UserPlus aria-hidden="true" />}>
              Invite member
            </Button>
          }
        >
          {members.map((member) => (
            <MemberRow
              key={member.id}
              name={member.name}
              email={member.email}
              status={member.status}
              isYou={member.isYou}
              role={
                <Select
                  label={`Role for ${member.name}`}
                  hideLabel
                  size="sm"
                  options={ROLES}
                  value={member.role}
                  onChange={(event) =>
                    setRole(member.id, event.target.value as Role)
                  }
                />
              }
              actions={
                /* The owner's own seat has no remove control at all, rather
                   than a disabled one — there is no state in which removing
                   yourself from your own team is the answer, so offering it
                   greyed out only invites the question. */
                member.isYou ? undefined : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => revoke(member.id)}
                  >
                    <span className="deck-visually-hidden">
                      {member.status === 'invited'
                        ? `Revoke invitation for ${member.name}`
                        : `Remove ${member.name}`}
                    </span>
                    <span aria-hidden="true">
                      {member.status === 'invited' ? 'Revoke' : 'Remove'}
                    </span>
                  </Button>
                )
              }
            />
          ))}
        </SettingsGroup>
      </Stack>
    </SettingsPanel>
  )
}
