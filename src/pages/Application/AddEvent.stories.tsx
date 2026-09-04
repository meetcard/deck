import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { AddEvent } from './AddEvent'
import { AppShell } from './AppShell'

const meta = {
  component: AddEvent,
  title: 'Experience/Application/Add Event',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AddEvent>

export default meta
type Story = StoryObj<typeof meta>

/** The empty form. Only the name gates the submit. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Add an event' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Create event' }),
    ).toBeDisabled()
  },
}

/** A name is enough. Everything else can wait for the event's own page. */
export const NamingIsEnough: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText(/Event name/), 'Front Range Meetup')

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Create event' }),
      ).toBeEnabled()
    })

    await userEvent.click(canvas.getByRole('button', { name: 'Create event' }))

    // Confirmed in place: there is no router here, and a form that silently
    // empties itself is indistinguishable from one that failed.
    await waitFor(async () => {
      await expect(
        canvas.getByText('“Front Range Meetup” is ready'),
      ).toBeVisible()
    })
  },
}

/** Slots are added one at a time, and each remove control names its own row. */
export const BuildingASchedule: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(/No schedule yet/)).toBeVisible()

    await userEvent.click(canvas.getByRole('button', { name: 'Add slot' }))
    await userEvent.click(canvas.getByRole('button', { name: 'Add slot' }))

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Slot 2 time')).toBeVisible()
    })

    await userEvent.type(canvas.getByLabelText('Slot 1 time'), '9:00 AM')
    await userEvent.type(
      canvas.getByLabelText('Slot 1 description'),
      'Doors and coffee',
    )

    await userEvent.click(canvas.getByRole('button', { name: 'Remove slot 2' }))

    await waitFor(async () => {
      await expect(canvas.queryByLabelText('Slot 2 time')).not.toBeInTheDocument()
    })
    await expect(canvas.getByLabelText('Slot 1 time')).toHaveValue('9:00 AM')
  },
}

/** Your part in the event, which is what the Events list groups you by. */
export const ChoosingYourRole: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Hosting' }))

    await waitFor(async () => {
      await expect(canvas.getByRole('radio', { name: 'Hosting' })).toBeChecked()
    })
  },
}

/** In the shell it renders under. */
export const InAppShell: Story = {
  render: (args) => (
    <AppShell currentId="/events">
      <AddEvent {...args} />
    </AppShell>
  ),
}

/** Phone. The paired fields stack; the cover keeps its landscape crop. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => (
    <AppShell currentId="/events">
      <AddEvent {...args} />
    </AppShell>
  ),
}
