import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AppShell } from './AppShell'
import { Events } from './Events'

const meta = {
  component: Events,
  title: 'Experience/Application/Events',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Events>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeVisible()
    // The next one up is lifted out of the list it would otherwise blend into.
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'RevOps Summit' }),
    ).toBeVisible()
  },
}

/**
 * Past events keep their attendance badge — "I spoke at that" is the reason
 * anyone scrolls back — and read newest first.
 */
export const Past: Story = {
  args: { defaultTab: 'past' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Frontend Denver' })).toBeVisible()
    // An upcoming event must not leak into the past list.
    await expect(
      canvas.queryByRole('link', { name: 'SaaStr Annual' }),
    ).not.toBeInTheDocument()
  },
}

/** Switching lists. The counts are on the control, so neither is a surprise. */
export const SwitchingLists: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('radio', { name: 'Upcoming (4)' })).toBeChecked()

    await userEvent.click(canvas.getByRole('radio', { name: 'Past (2)' }))
    await expect(canvas.getByRole('link', { name: 'SaaS North' })).toBeVisible()
  },
}

/** A new account. The empty list points at the next action rather than a void. */
export const NoEvents: Story = {
  args: { events: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nothing coming up')).toBeVisible()
  },
}

/**
 * Everything is behind you — no featured card, because there is nothing
 * coming to feature.
 */
export const AllPast: Story = {
  args: { today: '2028-01-01' },
}

/** The page in the shell it actually lives in. */
export const InTheShell: Story = {
  render: () => (
    <AppShell currentId="/events">
      <Events />
    </AppShell>
  ),
}
