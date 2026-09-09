import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Card } from '../Card/Card'
import { TrendChart } from './TrendChart'

const meta = {
  component: TrendChart,
  title: 'Build/Molecules/TrendChart',
  tags: ['molecule'],
  args: {
    label: 'Profile views over time',
    unit: 'views',
    points: [
      { label: 'W1', value: 312, fullLabel: 'Week 1' },
      { label: 'W2', value: 428, fullLabel: 'Week 2' },
      { label: 'W3', value: 517, fullLabel: 'Week 3' },
      { label: 'W4', value: 427, fullLabel: 'Week 4' },
    ],
  },
  render: (args) => (
    <Card style={{ maxWidth: 420 }}>
      <TrendChart {...args} />
    </Card>
  ),
} satisfies Meta<typeof TrendChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The reading is text, so it survives with no chart rendered at all.
    await expect(canvas.getByText('Week 3: 517 views')).toBeInTheDocument()
  },
}

/** Twelve buckets still read, because the columns thin rather than crowd. */
export const AYear: Story = {
  args: {
    label: 'Profile views by month',
    points: [
      { label: 'J', value: 180, fullLabel: 'January' },
      { label: 'F', value: 212, fullLabel: 'February' },
      { label: 'M', value: 264, fullLabel: 'March' },
      { label: 'A', value: 301, fullLabel: 'April' },
      { label: 'M', value: 288, fullLabel: 'May' },
      { label: 'J', value: 342, fullLabel: 'June' },
      { label: 'J', value: 398, fullLabel: 'July' },
      { label: 'A', value: 371, fullLabel: 'August' },
      { label: 'S', value: 455, fullLabel: 'September' },
      { label: 'O', value: 512, fullLabel: 'October' },
      { label: 'N', value: 486, fullLabel: 'November' },
      { label: 'D', value: 402, fullLabel: 'December' },
    ],
  },
}

/**
 * When the run ends on its high point, the peak label and the latest label
 * are the same column — one label, not two stacked on each other.
 */
export const PeakIsLatest: Story = {
  args: {
    points: [
      { label: 'W1', value: 180 },
      { label: 'W2', value: 246 },
      { label: 'W3', value: 388 },
      { label: 'W4', value: 512 },
    ],
  },
}

/** A week with no traffic. Flat at the baseline, not an empty box. */
export const NothingMeasuredYet: Story = {
  args: {
    points: [
      { label: 'W1', value: 0 },
      { label: 'W2', value: 0 },
      { label: 'W3', value: 0 },
      { label: 'W4', value: 0 },
    ],
  },
}
