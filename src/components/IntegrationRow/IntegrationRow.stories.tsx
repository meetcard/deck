import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { CalendarDays, Cloud, Database } from 'lucide-react'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { IntegrationRow } from './IntegrationRow'

const meta = {
  component: IntegrationRow,
  title: 'Build/Molecules/IntegrationRow',
  tags: ['molecule'],
  args: {
    name: 'HubSpot',
    logo: <Database aria-hidden="true" />,
    description: 'Sync connections and their notes as contacts and activities.',
  },
  render: (args) => (
    <Card style={{ maxWidth: 620 }}>
      <IntegrationRow {...args} />
    </Card>
  ),
} satisfies Meta<typeof IntegrationRow>

export default meta
type Story = StoryObj<typeof meta>

export const Connected: Story = {
  args: {
    status: 'connected',
    account: 'acme.hubspot.com',
    actions: (
      <>
        <Button size="sm" variant="secondary">
          Manage
        </Button>
        <Button size="sm" variant="ghost">
          Disconnect
        </Button>
      </>
    ),
  },
  play: async ({ canvas }) => {
    // State is words, not a colored dot — it survives being read aloud.
    await expect(canvas.getByText('Connected')).toBeVisible()
  },
}

export const NotConnected: Story = {
  args: {
    name: 'Salesforce',
    logo: <Cloud aria-hidden="true" />,
    description: 'Push new connections as Leads and log card exchanges as tasks.',
    actions: <Button size="sm">Connect</Button>,
  },
}

/**
 * The state this row exists for. A connection whose permissions lapsed is
 * neither on nor off, and it is the one someone opened this screen to fix.
 */
export const NeedsPermission: Story = {
  args: {
    name: 'Outlook Calendar',
    logo: <CalendarDays aria-hidden="true" />,
    status: 'attention',
    account: 'ben.ackles@meetcard.io',
    description: 'Book with can only show real availability once this is enabled.',
    actions: <Button size="sm">Enable calendar</Button>,
  },
}

/** The states share a shape, not a vocabulary — a calendar is "enabled". */
export const CustomStatusLabel: Story = {
  args: {
    name: 'Google Calendar',
    logo: <CalendarDays aria-hidden="true" />,
    status: 'connected',
    statusLabel: 'Calendar enabled',
    account: 'ben@meetcard.io',
    description: undefined,
    actions: (
      <Button size="sm" variant="ghost">
        Disconnect
      </Button>
    ),
  },
}

/** A read-only roster: who is connected, with nothing to act on here. */
export const Roster: Story = {
  render: () => (
    <Card style={{ maxWidth: 620 }}>
      <IntegrationRow
        name="Ben Ackles"
        status="connected"
        statusLabel="Calendar enabled"
        description="Google Calendar"
      />
      <IntegrationRow
        name="Dana Whitfield"
        status="connected"
        statusLabel="Calendar enabled"
        description="Outlook Calendar"
      />
      <IntegrationRow
        name="Priya Raman"
        status="disconnected"
        statusLabel="Not enabled"
        description="No calendar connected"
      />
    </Card>
  ),
}
