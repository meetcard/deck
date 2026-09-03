import { useState } from 'react'
import { MailPlus, UserPlus, Users, X } from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { Select } from '../../components/Select/Select'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { UsageMeter } from '../../components/UsageMeter/UsageMeter'
import { LinkButton } from './LinkButton'
import { SettingsPanel, SettingsSection } from './SettingsPanel'
import { SEATS, TEAM } from './settingsData'
import type { TeamMember, TeamRole } from './settingsData'

const ROLES: { value: TeamRole; label: string }[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Member', label: 'Member' },
]

/* ---- Page --------------------------------------------------------------- */

export interface SettingsTeamProps {
  members?: TeamMember[]
  /** Seats bought — which is not the same as seats filled. */
  seats?: number
}

/**
 * Team — who is on the account, and what they can do.
 *
 * Seats first, because every other control on the page is limited by them:
 * inviting someone with no seat left is a purchase, and the panel should say
 * so before you fill in an email rather than after. "Manage seats" goes to
 * Billing, where the money is.
 *
 * Invitations sit in the same list as members rather than in a pending tray
 * of their own. An invited person occupies a seat from the moment you send
 * it, so a list that hides them would be lying about the count directly
 * above it.
 *
 * Roles are a `Select` in the row rather than an overflow menu. There are two
 * of them, and a menu would hide a one-step change behind two — plus Deck has
 * no menu component, and a "⋯" that opens nothing is worse than a control
 * that works.
 */
export function SettingsTeam({
  members: initialMembers = TEAM,
  seats = SEATS.total,
}: SettingsTeamProps) {
  const [members, setMembers] = useState(initialMembers)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TeamRole>('Member')
  const [sent, setSent] = useState<string | null>(null)

  const used = members.length
  const available = Math.max(seats - used, 0)
  const full = available === 0

  function invite() {
    const email = inviteEmail.trim()
    if (!email || full) return

    setMembers((all) => [
      ...all,
      {
        id: `invite-${Date.now()}`,
        email,
        role: inviteRole,
        status: 'Invited',
      },
    ])
    setSent(email)
    setInviteEmail('')
    setInviteRole('Member')
    setInviting(false)
  }

  const setRole = (id: string, role: TeamRole) =>
    setMembers((all) =>
      all.map((member) => (member.id === id ? { ...member, role } : member)),
    )

  const remove = (id: string) =>
    setMembers((all) => all.filter((member) => member.id !== id))

  return (
    <SettingsPanel
      eyebrow="Team"
      icon={<Users />}
      title="Team"
      description="Invite teammates, set their role, and keep an eye on your seat usage."
    >
      <SettingsSection
        title="Seats"
        divided={false}
        actions={
          <LinkButton href="/settings/billing" size="sm" variant="secondary">
            Manage seats
          </LinkButton>
        }
      >
        <UsageMeter
          label="Seats"
          value={used}
          max={seats}
          formatValue={(value, max) => `${value} of ${max} seats used`}
          footer={
            full
              ? 'Every seat is taken. Add one in Billing to invite anyone else.'
              : `${available} ${available === 1 ? 'seat' : 'seats'} available`
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Team members"
        gap={12}
        actions={
          <Button
            size="sm"
            iconStart={<UserPlus />}
            disabled={full}
            onClick={() => setInviting(true)}
          >
            Invite member
          </Button>
        }
      >
        {sent ? (
          <Banner
            tone="success"
            title="Invitation sent"
            onDismiss={() => setSent(null)}
          >
            {sent} has been invited and is holding a seat until they accept.
          </Banner>
        ) : null}

        <Stack as="ul" gap={8} className="settings__list">
          {members.map((member) => {
            /* An invitation has no name yet, so the email is the name and
               the second line says what is actually happening instead of
               repeating it. */
            const name = member.name ?? member.email

            return (
              <li key={member.id} className="settings__member">
                {member.name ? (
                  <Avatar name={member.name} size="sm" decorative />
                ) : (
                  <Avatar name="?" size="sm" decorative />
                )}

                <div className="settings__member-text">
                  <p className="settings__member-name">
                    {name}
                    {member.isYou ? (
                      <Badge tone="brand" size="sm">
                        You
                      </Badge>
                    ) : null}
                    <Badge
                      tone={member.status === 'Active' ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      {member.status}
                    </Badge>
                  </p>
                  <p className="settings__member-email">
                    {member.name ? member.email : 'Invitation pending'}
                  </p>
                </div>

                <div className="settings__member-role">
                  <Select
                    label={`Role for ${name}`}
                    hideLabel
                    size="sm"
                    options={ROLES}
                    value={member.role}
                    /* You cannot demote yourself out of the only account
                       that can promote anyone back. */
                    disabled={member.isYou}
                    onChange={(changeEvent) =>
                      setRole(member.id, changeEvent.target.value as TeamRole)
                    }
                  />
                </div>

                {member.isYou ? null : (
                  <IconButton
                    label={
                      member.status === 'Invited'
                        ? `Cancel invitation to ${name}`
                        : `Remove ${name}`
                    }
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() => remove(member.id)}
                  />
                )}
              </li>
            )
          })}
        </Stack>
      </SettingsSection>

      <Sheet
        open={inviting}
        onClose={() => setInviting(false)}
        placement="center"
        title="Invite a teammate"
        description={`They take one of your ${available} remaining ${
          available === 1 ? 'seat' : 'seats'
        } as soon as you send this.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button
              iconStart={<MailPlus />}
              disabled={inviteEmail.trim().length === 0}
              onClick={invite}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <Stack gap={16}>
          <Input
            label="Work email"
            type="email"
            placeholder="teammate@northwind.studio"
            value={inviteEmail}
            onChange={(changeEvent) => setInviteEmail(changeEvent.target.value)}
          />
          <Select
            label="Role"
            options={ROLES}
            value={inviteRole}
            description="Admins can change billing, company branding, and the team."
            onChange={(changeEvent) =>
              setInviteRole(changeEvent.target.value as TeamRole)
            }
          />
          <Text size="xs" tone="muted">
            Nothing is sent — Deck has no data layer. In the product this is
            where the invitation goes out.
          </Text>
        </Stack>
      </Sheet>
    </SettingsPanel>
  )
}
