import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { PrivateNote } from './PrivateNote'
import type { ConnectionFeeling } from './PrivateNote'

const meta = {
  component: PrivateNote,
  title: 'Build/Organisms/PrivateNote',
  tags: ['organism'],
  args: { onHide: fn() },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PrivateNote>

export default meta
type Story = StoryObj<typeof meta>

/** Blank, as it appears the first time you turn a card over. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'How did this connection feel?' }),
    ).toBeVisible()
    // The reassurance is the point, not decoration — assert it is really there.
    await expect(canvas.getByText(/This device only/)).toBeVisible()
  },
}

/** Filled in — a feeling picked and something worth remembering written down. */
export const Written: Story = {
  args: {
    feeling: 'hot',
    value: 'Met by the coffee cart. Wants an intro to Priya about the pilot.',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: /Hot/ })).toBeChecked()
  },
}

function Harness() {
  const [feeling, setFeeling] = useState<ConnectionFeeling>()
  const [value, setValue] = useState('')
  return (
    <PrivateNote
      feeling={feeling}
      onFeelingChange={setFeeling}
      value={value}
      onValueChange={setValue}
    />
  )
}

/** The feeling is one tap, which is all you have while still standing there. */
export const PickingAFeeling: Story = {
  render: () => <Harness />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /Warm/ }))
    await expect(canvas.getByRole('radio', { name: /Warm/ })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: /Hot/ })).not.toBeChecked()
  },
}
