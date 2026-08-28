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

/**
 * Desktop. Storybook's browser runner renders at 1200px unless a story pins
 * a viewport, so this is above the `md` breakpoint and shows the rail.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('banner')).toBeVisible()
    await expect(
      canvas.getByRole('navigation', { name: 'Global' }),
    ).toBeVisible()

    // The assertion that proves the swap happened rather than that both
    // rendered: the bar is display:none here, so it is out of the a11y tree.
    await expect(
      canvas.queryByRole('navigation', { name: 'Primary' }),
    ).toBeNull()

    // "My cards" is a rail-only destination.
    await expect(canvas.getByRole('link', { name: 'My cards' })).toBeVisible()
  },
}

/**
 * A different destination current. The bar does not name it — the page does,
 * in its own heading — so the only thing that moves is the rail's fill.
 */
export const OnAnotherSection: Story = {
  args: { currentId: '/connections' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Connections' }),
    ).toHaveAttribute('aria-current', 'page')

    // The bar carries the brand and the account, and nothing else.
    const bar = canvas.getByRole('banner')
    await expect(
      within(bar).getByRole('link', { name: 'MeetCard home' }),
    ).toBeVisible()
    await expect(
      within(bar).getByRole('button', { name: 'Account' }),
    ).toBeVisible()
  },
}

/**
 * The breakpoint's own value. 768px is the first width that gets the rail,
 * so this is the edge worth spending a story on.
 */
export const Tablet: Story = {
  parameters: { viewport: { defaultViewport: 'tablet' } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Global' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('navigation', { name: 'Primary' }),
    ).toBeNull()
  },
}

/**
 * Phone. The bar replaces the rail, Exchange appears as the center action,
 * and "My cards" gives up its slot to make room.
 */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobileS' } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Primary' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('navigation', { name: 'Global' }),
    ).toBeNull()
    await expect(canvas.getByRole('button', { name: 'Exchange' })).toBeVisible()
    await expect(canvas.queryByRole('link', { name: 'My cards' })).toBeNull()

    // The regression test for the whole label-restoration premise, measured
    // in real Chromium at the tightest common phone width. If the type scale,
    // the padding, or the destination count changes such that a label no
    // longer fits, this fails here rather than being noticed in a screenshot.
    // Scoped to the bar: the rail is display:none but still in the DOM, and
    // getByText does not filter on visibility the way getByRole does.
    const bar = canvas.getByRole('navigation', { name: 'Primary' })
    for (const name of ['Dashboard', 'Connections', 'Events', 'Settings']) {
      const label = within(bar).getByText(name)
      await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
    }
  },
}

/**
 * Exchange opens a sheet rather than navigating. Pinned to a phone because
 * the center action that opens it exists only in the bar.
 */
export const ExchangeOpen: Story = {
  parameters: { viewport: { defaultViewport: 'mobileS' } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Exchange' }))

    // The sheet renders in the top layer, outside the story canvas.
    const dialog = canvasElement.ownerDocument.querySelector('dialog')
    await expect(dialog).toHaveAttribute('open')

    await waitFor(() => {
      expect(
        within(dialog as HTMLElement).getByRole('button', {
          name: 'Show my card',
        }),
      ).toBeVisible()
    })
  },
}
