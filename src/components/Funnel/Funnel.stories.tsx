import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Card } from '../Card/Card'
import { Funnel } from './Funnel'

const meta = {
  component: Funnel,
  title: 'Build/Molecules/Funnel',
  tags: ['molecule'],
  args: {
    label: 'Conversion funnel',
    unit: 'views',
    stages: [
      {
        label: 'Profile views',
        value: 1684,
        description: 'Everyone who opened your card',
      },
      { label: 'Link clicks', value: 742, description: 'Tapped a link or CTA' },
      { label: 'Contacts saved', value: 254, description: 'Kept your details' },
      {
        label: 'Meetings booked',
        value: 43,
        description: 'Book with Me + connected calendars',
      },
    ],
  },
  render: (args) => (
    <Card style={{ maxWidth: 520 }}>
      <Funnel {...args} />
    </Card>
  ),
} satisfies Meta<typeof Funnel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // Both readings, because they answer different questions.
    await expect(canvas.getByText(/44% from previous/)).toBeVisible()
    await expect(canvas.getByText(/3% of views/)).toBeVisible()
    // The top of the funnel has nothing to fall from, and says so.
    await expect(canvas.getByText(/starting point/)).toBeVisible()
  },
}

/** Two stages is still a funnel — the simplest question worth asking. */
export const TwoStages: Story = {
  args: {
    label: 'Save rate',
    unit: 'views',
    stages: [
      { label: 'Profile views', value: 320 },
      { label: 'Contacts saved', value: 118, description: 'Kept your details' },
    ],
  },
}

/**
 * A healthy funnel narrows gently. Worth having beside the default so the
 * shape of a leak is recognisable by contrast.
 */
export const ShallowDropOff: Story = {
  args: {
    stages: [
      { label: 'Profile views', value: 1684 },
      { label: 'Link clicks', value: 1502 },
      { label: 'Contacts saved', value: 1310 },
      { label: 'Meetings booked', value: 1104 },
    ],
  },
}

/**
 * A card that has been shared but not opened. Zero is a real answer, so the
 * stages still render — with words instead of a division by zero.
 */
export const NothingMeasuredYet: Story = {
  args: {
    stages: [
      { label: 'Profile views', value: 0 },
      { label: 'Link clicks', value: 0 },
      { label: 'Contacts saved', value: 0 },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByText(/no previous stage to compare/).length,
    ).toBeGreaterThan(0)
  },
}
