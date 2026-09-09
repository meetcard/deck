import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { Select } from '../Select/Select'
import { MemberRow } from './MemberRow'

const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
]

const roleSelect = (name: string, value: string) => (
  <Select
    label={`Role for ${name}`}
    hideLabel
    size="sm"
    options={ROLES}
    defaultValue={value}
  />
)

const meta = {
  component: MemberRow,
  title: 'Build/Molecules/MemberRow',
  tags: ['molecule'],
  args: {
    name: 'Sam Oyelaran',
    email: 'sam@meetcard.io',
    status: 'active',
  },
  render: (args) => (
    <Card style={{ maxWidth: 620 }}>
      <MemberRow {...args} />
    </Card>
  ),
} satisfies Meta<typeof MemberRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { role: roleSelect('Sam Oyelaran', 'member') },
}

/** The row you must not remove is the one worth marking. */
export const You: Story = {
  args: {
    name: 'Ben Ackles',
    email: 'ben@meetcard.io',
    isYou: true,
    role: roleSelect('Ben Ackles', 'owner'),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('You')).toBeVisible()
  },
}

/**
 * An invitation nobody has accepted. The email is all the team knows, so it
 * stands in for the name — and the row stays in the roster, because the seat
 * is already spent.
 */
export const Invited: Story = {
  args: {
    name: 'dana@meetcard.io',
    email: 'Invitation pending',
    status: 'invited',
    actions: (
      <>
        <Button size="sm" variant="ghost">
          Resend
        </Button>
        <Button size="sm" variant="ghost">
          Revoke
        </Button>
      </>
    ),
  },
}

export const Suspended: Story = {
  args: {
    name: 'Marcus Lee',
    email: 'marcus@meetcard.io',
    status: 'suspended',
    actions: (
      <Button size="sm" variant="secondary">
        Reactivate
      </Button>
    ),
  },
}

/** The whole roster, active and pending in one list, as the seat count sees it. */
export const Roster: Story = {
  render: () => (
    <Card style={{ maxWidth: 620 }}>
      <MemberRow
        name="Ben Ackles"
        email="ben@meetcard.io"
        isYou
        role={roleSelect('Ben Ackles', 'owner')}
      />
      <MemberRow
        name="Sam Oyelaran"
        email="sam@meetcard.io"
        role={roleSelect('Sam Oyelaran', 'admin')}
      />
      <MemberRow
        name="Prisha Nair"
        email="prisha@meetcard.io"
        role={roleSelect('Prisha Nair', 'member')}
      />
      <MemberRow
        name="dana@meetcard.io"
        email="Invitation pending"
        status="invited"
        actions={
          <Button size="sm" variant="ghost">
            Revoke
          </Button>
        }
      />
    </Card>
  ),
}
