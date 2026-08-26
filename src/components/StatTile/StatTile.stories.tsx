import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { StatTile } from './StatTile'

const meta = {
  component: StatTile,
  args: {
    label: 'Connections captured',
    value: '1,284',
    caption: 'last 30 days',
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <StatTile {...args} />
    </div>
  ),
} satisfies Meta<typeof StatTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Rising: Story = {
  args: { trend: { direction: 'up', label: '12% vs. previous 30 days' } },
  play: async ({ canvas }) => {
    // Direction is spelled out, so the trend is not conveyed by color alone.
    await expect(canvas.getByText(/Up:/)).toBeInTheDocument()
  },
}

export const Falling: Story = {
  args: { trend: { direction: 'down', label: '8% vs. previous 30 days' } },
}

/**
 * A rise is not always good. Sync failures rising is bad, so
 * `positiveDirection` decides the tone rather than the arrow alone.
 */
export const RisingIsBad: Story = {
  args: {
    label: 'CRM sync failures',
    value: '17',
    positiveDirection: 'down',
    trend: { direction: 'up', label: '5 more than last month' },
  },
}

export const Flat: Story = {
  args: { trend: { direction: 'flat', label: 'No change' } },
}

/** The dashboard's headline row. */
export const DashboardRow: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}
    >
      <StatTile
        label="Connections captured"
        value="1,284"
        caption="last 30 days"
        trend={{ direction: 'up', label: '12%' }}
      />
      <StatTile
        label="Follow-up completion"
        value="68%"
        trend={{ direction: 'up', label: '4 pts' }}
      />
      <StatTile
        label="Meetings booked"
        value="94"
        trend={{ direction: 'flat', label: 'No change' }}
      />
      <StatTile
        label="CRM sync failures"
        value="3"
        positiveDirection="down"
        trend={{ direction: 'down', label: '9 fewer' }}
      />
    </div>
  ),
}
