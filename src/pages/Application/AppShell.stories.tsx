import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { Card } from '../../components/Card/Card'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { AppShell } from './AppShell'

/** Stand-in screen content, so the shell is shown framing something real. */
const SampleScreen = (
  <Stack gap={16} style={{ padding: 'var(--deck-space-20)' }}>
    <Heading level={2} size="sm">
      Recent connections
    </Heading>
    {['Ben Ackles', 'Priya Shah', 'Marcus Liu'].map((name) => (
      <Card key={name} surface="subtle" elevation="none" style={{ padding: 16 }}>
        <Text weight="medium">{name}</Text>
      </Card>
    ))}
  </Stack>
)

const meta = {
  component: AppShell,
  title: 'Experience/Application/App Shell',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
  args: { children: SampleScreen },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/** The frame every authenticated screen renders inside. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeVisible()
    await expect(canvas.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  },
}

/** A title appears when the mark alone isn't enough context for the screen. */
export const WithTitle: Story = {
  args: { currentId: '/connections', title: 'Connections' },
  play: async ({ canvas }) => {
    // Nav label is "People"; the bar's label is terser than the page title.
    const active = canvas.getByRole('link', { name: 'People' })
    await expect(active).toHaveAttribute('aria-current', 'page')
  },
}

/**
 * Exchange is the center action, not a destination: it opens a sheet over the
 * screen rather than navigating away from it.
 */
export const ExchangeOpen: Story = {
  play: async ({ canvas, canvasElement, step, userEvent }) => {
    await step('Open Exchange from the center action', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Exchange' }))
    })

    // <dialog> renders in the top layer, outside the canvas root.
    const dialog = canvasElement.ownerDocument.querySelector('dialog')
    await expect(dialog).toHaveAttribute('open')

    // Retries until the entrance animation clears opacity: 0 — the buttons
    // are in the DOM immediately, but not yet visible.
    await waitFor(() => {
      expect(
        within(dialog as HTMLElement).getByRole('button', { name: 'Show my card' }),
      ).toBeVisible()
    })
  },
}
