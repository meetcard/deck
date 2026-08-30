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
    // Closed: a prompt with a pencil, not a textarea waiting to be filled in.
    await expect(canvas.queryByRole('textbox')).toBeNull()
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
    await expect(canvas.getByText(/Met by the coffee cart/)).toBeVisible()
  },
}

/**
 * Open. Cancel and Save are what make the field safe to open at all — you can
 * look at what is there, think better of the edit, and leave the note as it
 * was. Save stays dark until something actually changes.
 */
export const Editing: Story = {
  args: {
    feeling: 'warm',
    value: 'Met by the coffee cart.',
    defaultEditing: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox')).toHaveValue(
      'Met by the coffee cart.',
    )
    await expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled()
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

/**
 * The whole round trip: open the note, write, save, and find it on the closed
 * field. The note is for later, so it is the one thing here that asks for a
 * deliberate save rather than committing as you type.
 */
export const WritingANote: Story = {
  render: () => <Harness />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Add a note/ }))

    const field = canvas.getByRole('textbox')
    await expect(field).toHaveFocus()

    await userEvent.type(field, 'Runs the Tuesday design critique.')
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }))

    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(
      canvas.getByRole('button', { name: /Edit note: Runs the Tuesday/ }),
    ).toBeVisible()
  },
}
