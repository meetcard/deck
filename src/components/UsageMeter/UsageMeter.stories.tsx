import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { UsageMeter } from './UsageMeter'

const meta = {
  component: UsageMeter,
  args: { label: 'Connections', value: 42, max: 100 },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <UsageMeter {...args} />
    </div>
  ),
} satisfies Meta<typeof UsageMeter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const meter = canvas.getByRole('meter', { name: 'Connections' })
    await expect(meter).toHaveAttribute('aria-valuenow', '42')
    await expect(meter).toHaveAttribute('aria-valuetext', '42 of 100')
  },
}

/**
 * Nearing the Solo cap. Surfacing consumption is how MeetCard triggers an
 * upgrade at the moment of realised value, rather than by withholding.
 */
export const ApproachingLimit: Story = {
  args: {
    value: 92,
    footer: <Button size="sm">Upgrade to Pro</Button>,
  },
  play: async ({ canvas }) => {
    // The level is stated in text, never carried by the bar's color alone.
    await expect(canvas.getByText(/Approaching limit/)).toBeVisible()
  },
}

export const LimitReached: Story = {
  args: {
    value: 100,
    footer: <Button size="sm">Upgrade to Pro</Button>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Limit reached')).toBeVisible()
  },
}

/** Pro and Team are uncapped, so no meter is shown — this is the contrast. */
export const Levels: Story = {
  render: (args) => (
    <Stack gap={24} style={{ maxWidth: 360 }}>
      <UsageMeter {...args} value={18} />
      <UsageMeter {...args} value={86} />
      <UsageMeter {...args} value={100} />
    </Stack>
  ),
}

/** Overflow is clamped so the bar never exceeds its track. */
export const OverLimit: Story = {
  args: { value: 140 },
}
