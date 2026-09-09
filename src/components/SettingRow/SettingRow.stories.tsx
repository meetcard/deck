import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import { SettingRow } from './SettingRow'

const meta = {
  component: SettingRow,
  title: 'Build/Molecules/SettingRow',
  tags: ['molecule'],
  args: {
    title: 'New connection',
    description: 'When someone adds you to their connections.',
  },
  render: (args) => (
    <Card style={{ maxWidth: 560 }}>
      <SettingRow {...args} />
    </Card>
  ),
} satisfies Meta<typeof SettingRow>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The default shape of a preference: a switch whose label is the row's own
 * title, so the words are part of the hit target.
 */
export const Toggle: Story = {
  args: { checked: true },
  render: function Render(args) {
    const [on, setOn] = useState(true)
    return (
      <Card style={{ maxWidth: 560 }}>
        <SettingRow {...args} checked={on} onCheckedChange={setOn} />
      </Card>
    )
  },
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: 'New connection' })
    await expect(control).toBeChecked()
    // Tapping the title works, because the title *is* the label.
    await userEvent.click(canvas.getByText('New connection'))
    await expect(control).not.toBeChecked()
  },
}

export const Off: Story = {
  args: { checked: false },
}

/** Not every setting is on or off. `control` takes whatever changes it. */
export const WithAction: Story = {
  args: {
    title: 'Export my data',
    description: 'Download a copy of your cards, connections, and notes as JSON.',
    control: (
      <Button variant="secondary" size="sm">
        Export
      </Button>
    ),
  },
}

/** A read-only row: the state is reported, and changing it happens elsewhere. */
export const WithStatus: Story = {
  args: {
    title: 'Browser push',
    description: "Push is blocked for this site and can't be reset from here.",
    control: <Badge tone="error">Blocked</Badge>,
  },
}

/**
 * A setting that reveals a follow-on choice. The detail is indented under the
 * row it belongs to, so it reads as part of that setting rather than the next.
 */
export const WithDetail: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(true)
    const [cadence, setCadence] = useState('weekly')

    return (
      <Card style={{ maxWidth: 560 }}>
        <SettingRow
          {...args}
          title="Follow-up reminders"
          description="Get nudged to follow up with people you've exchanged cards with."
          checked={on}
          onCheckedChange={setOn}
        />
        {on ? (
          <SettingRow
            title="Default cadence"
            description="How often to surface follow-up reminders."
          >
            <ChoiceGroup
              label="Default cadence"
              hideLabel
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              value={cadence}
              onChange={setCadence}
            />
          </SettingRow>
        ) : null}
      </Card>
    )
  },
}

/** Consecutive rows rule themselves off, so a group needs no wrapper. */
export const Group: Story = {
  render: function Render() {
    const [state, setState] = useState({ connection: true, lead: false, sync: true })
    const set = (key: keyof typeof state) => (next: boolean) =>
      setState((all) => ({ ...all, [key]: next }))

    return (
      <Card style={{ maxWidth: 560 }}>
        <SettingRow
          title="New connection"
          description="When someone adds you to their connections."
          checked={state.connection}
          onCheckedChange={set('connection')}
        />
        <SettingRow
          title="New lead"
          description="When a connection is flagged as a potential lead."
          checked={state.lead}
          onCheckedChange={set('lead')}
        />
        <SettingRow
          title="Sync failure"
          description="When a CRM sync fails and needs attention."
          checked={state.sync}
          onCheckedChange={set('sync')}
        />
      </Card>
    )
  },
}

export const Disabled: Story = {
  args: { checked: false, disabled: true },
}
