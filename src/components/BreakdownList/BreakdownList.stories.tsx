import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Globe, Laptop, Smartphone, Tablet } from 'lucide-react'
import { Card } from '../Card/Card'
import { BreakdownList } from './BreakdownList'

const meta = {
  component: BreakdownList,
  title: 'Build/Molecules/BreakdownList',
  tags: ['molecule'],
  args: {
    label: 'Where engagement comes from',
    items: [
      { label: 'QR', value: 631, meta: '37%' },
      { label: 'LinkedIn', value: 388, meta: '23%' },
      { label: 'NFC', value: 244, meta: '14%' },
      { label: 'Email', value: 196, meta: '12%' },
      { label: 'Wallet', value: 137, meta: '8%' },
      { label: 'Direct', value: 88, meta: '5%' },
    ],
  },
  render: (args) => (
    <Card style={{ maxWidth: 420 }}>
      <BreakdownList {...args} />
    </Card>
  ),
} satisfies Meta<typeof BreakdownList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // Every figure is text on the row: the list is its own table view.
    await expect(canvas.getByText('631')).toBeVisible()
    await expect(canvas.getByText('37%')).toBeVisible()
  },
}

/**
 * Scaled to the sum instead of the leader, so a bar's length *is* its share
 * of the whole. Only honest when the rows genuinely partition something.
 */
export const ShareOfTotal: Story = {
  args: {
    label: 'Devices',
    scale: 'total',
    items: [
      { label: 'Mobile', value: 1288, meta: '76%', icon: <Smartphone /> },
      { label: 'Desktop', value: 318, meta: '19%', icon: <Laptop /> },
      { label: 'Tablet', value: 78, meta: '5%', icon: <Tablet /> },
    ],
  },
}

/** A leading mark helps when the labels are a category people scan for. */
export const WithIcons: Story = {
  args: {
    label: 'Top locations',
    items: [
      { label: 'United States', value: 1067, meta: '63%', icon: <Globe /> },
      { label: 'Canada', value: 218, meta: '13%', icon: <Globe /> },
      { label: 'United Kingdom', value: 172, meta: '10%', icon: <Globe /> },
      { label: 'Germany', value: 121, meta: '7%', icon: <Globe /> },
      { label: 'Other', value: 106, meta: '6%', icon: <Globe /> },
    ],
  },
}

/** The figure can carry its own unit when the number alone is ambiguous. */
export const CustomValueLabels: Story = {
  args: {
    label: 'Link performance',
    items: [
      { label: 'Book a time', value: 298, valueLabel: '298 clicks', meta: '17% CTR' },
      { label: 'Save contact', value: 254, valueLabel: '254 clicks', meta: '15% CTR' },
      { label: 'LinkedIn profile', value: 128, valueLabel: '128 clicks', meta: '8% CTR' },
      { label: 'Company site', value: 62, valueLabel: '62 clicks', meta: '4% CTR' },
    ],
  },
}

/**
 * A card shared today, nothing measured yet. Flat bars are the honest
 * rendering — the rows exist, the numbers are genuinely zero.
 */
export const NothingMeasuredYet: Story = {
  args: {
    items: [
      { label: 'QR', value: 0, meta: '0%' },
      { label: 'LinkedIn', value: 0, meta: '0%' },
      { label: 'NFC', value: 0, meta: '0%' },
    ],
  },
}

/** Long labels truncate rather than pushing the figures off the row. */
export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Conference badge QR code — RevOps Summit', value: 631, meta: '37%' },
      { label: 'LinkedIn profile featured section', value: 388, meta: '23%' },
      { label: 'Direct', value: 88, meta: '5%' },
    ],
  },
}
