import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Stepper } from './Stepper'

/** The booking wizard's four steps, each its own route. */
const bookingSteps = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'availability', label: 'Time' },
  { id: 'details', label: 'Details' },
  { id: 'booked', label: 'Confirmed' },
]

const meta = {
  component: Stepper,
  title: 'Build/Atoms/Stepper',
  tags: ['atom'],
  args: { steps: bookingSteps, currentStepId: 'availability', onSelect: fn() },
  render: (args) => (
    <div style={{ maxWidth: 480 }}>
      <Stepper {...args} />
    </div>
  ),
} satisfies Meta<typeof Stepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    const current = canvas.getByText('Time').closest('li')
    await expect(current).toHaveAttribute('aria-current', 'step')
  },
}

export const FirstStep: Story = {
  args: { currentStepId: 'purpose' },
}

export const Complete: Story = {
  args: { currentStepId: 'booked' },
}

/** Completed steps are navigable so a visitor can revise an earlier choice. */
export const CompletedStepsAreNavigable: Story = {
  args: { currentStepId: 'details' },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Purpose/ }))
    await expect(args.onSelect).toHaveBeenCalledWith('purpose')

    // Upcoming steps are inert — you cannot skip ahead.
    await expect(
      canvas.queryByRole('button', { name: /Confirmed/ }),
    ).not.toBeInTheDocument()
  },
}

/** With `href`, steps render as links so each is a real, shareable route. */
export const AsLinks: Story = {
  args: {
    currentStepId: 'details',
    onSelect: undefined,
    steps: bookingSteps.map((step) => ({
      ...step,
      href: `/ben/book/${step.id}`,
    })),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: /Purpose/ })).toHaveAttribute(
      'href',
      '/ben/book/purpose',
    )
  },
}

export const EveryStage: Story = {
  render: (args) => (
    <Stack gap={24} style={{ maxWidth: 480 }}>
      {/* Each nav landmark needs a unique accessible name when several
          appear on one page — hence the per-stepper `label`. */}
      {bookingSteps.map((step) => (
        <Stepper
          {...args}
          key={step.id}
          currentStepId={step.id}
          label={`Progress: ${step.id}`}
        />
      ))}
    </Stack>
  ),
}
