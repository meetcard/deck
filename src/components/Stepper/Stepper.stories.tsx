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

/**
 * A step marked `terminal` is complete the moment it is reached. The marker
 * settles from white through the success tint to the filled disc, drawing its
 * check — the resting style is the finished one, so with motion off the same
 * check is simply already there.
 */
export const TerminalStep: Story = {
  args: {
    currentStepId: 'booked',
    steps: bookingSteps.map((step) =>
      step.id === 'booked' ? { ...step, terminal: true } : step,
    ),
  },
  play: async ({ canvas, args }) => {
    const booked = canvas.getByText('Confirmed').closest('li')
    // Complete to look at, but still the current step, and still inert.
    await expect(booked).toHaveTextContent('(completed)')
    await expect(booked).toHaveAttribute('aria-current', 'step')
    await expect(
      canvas.queryByRole('button', { name: /Confirmed/ }),
    ).not.toBeInTheDocument()
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

/**
 * Phone. Every step keeps its label, stacked under its own marker — a row of
 * bare numbers tells you where you are and nothing about what it is out of,
 * which is most of the point of a progress indicator.
 *
 * Five steps is the widest the booking flow gets (`Book with Team` adds a
 * `Team` step), so it is the case worth pinning.
 */
export const Mobile: Story = {
  args: {
    currentStepId: 'availability',
    steps: [
      { id: 'purpose', label: 'Purpose' },
      { id: 'availability', label: 'Availability' },
      { id: 'team', label: 'Team' },
      { id: 'details', label: 'Details' },
      { id: 'booked', label: 'Booked', terminal: true },
    ],
  },
  // Same pairing as SettingsNav: the global drives the local runner, and
  // Chromatic ignores it, so the width is stated for each. Both say 375px.
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => <Stepper {...args} />,
  play: async ({ canvas }) => {
    // The labels a narrow screen used to drop.
    for (const label of ['Purpose', 'Team', 'Details', 'Booked']) {
      await expect(canvas.getByText(label)).toBeVisible()
    }

    // Stacked, not inline — the marker sits above its label rather than
    // beside it, which is the whole of the layout change.
    const action = canvas.getByText('Team').closest('.deck-stepper__action')
    await expect(getComputedStyle(action as Element).flexDirection).toBe('column')
  },
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
