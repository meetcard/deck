import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { findOpenDialog } from '../../test/dialog'
import { Exchange } from './Exchange'

const meta = {
  component: Exchange,
  title: 'Experience/Application/Exchange',
  tags: ['page'],
  parameters: {
    layout: 'fullscreen',
    /*
     * Every story here opens a modal `<dialog>`, and a modal dialog is
     * promoted to the browser's top layer — out of its story's box and over
     * the whole page. Rendered inline, the docs page stacked three of them on
     * top of each other and on top of the prose, which read as the sheet
     * itself being broken mid-transition.
     *
     * An iframe per story is the only thing that actually contains a top-layer
     * element. The height fits the tallest state (the receipt) so none of them
     * scrolls inside its frame.
     */
    docs: { story: { inline: false, height: '600px' } },
  },
} satisfies Meta<typeof Exchange>

export default meta
type Story = StoryObj<typeof meta>

/** The entry point on someone's public card. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Exchange cards' }),
    ).toBeVisible()
  },
}

/**
 * Tapping Exchange opens the sheet already exchanging — there is no confirm
 * step, because the tap was the confirmation.
 */
export const Exchanging: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Exchange cards' }))

    const dialog = await findOpenDialog(canvasElement)

    // The identity is assumed rather than asked for; the correction is the
    // escape hatch, not the default path.
    await waitFor(() => {
      expect(
        within(dialog).getByText(/Signed in as/),
      ).toBeVisible()
    })
  },
}

/**
 * The receipt. Both beats have run, and the three things you'd actually do
 * next are on the surface rather than behind a dismiss.
 */
export const Complete: Story = {
  args: { defaultOpen: true, skipAnimation: true },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    const ui = within(dialog)

    await waitFor(() => {
      expect(ui.getByText('Exchange complete')).toBeVisible()
    })
    await expect(ui.getByText('You received')).toBeVisible()
    await expect(ui.getByText('You shared')).toBeVisible()
    for (const next of ['Add note', 'Book time', 'Save contact']) {
      await expect(ui.getByRole('button', { name: next })).toBeVisible()
    }
  },
}

/**
 * The full sequence, unskipped: greeting → trading → receipt, about two
 * seconds. Asserts the captions arrive in order.
 */
export const FullSequence: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    const dialog = await findOpenDialog(canvasElement)
    const ui = within(dialog)

    await waitFor(() => expect(ui.getByRole('heading', { name: 'Shaking hands…' })).toBeVisible())
    await waitFor(() => expect(ui.getByRole('heading', { name: 'Exchanging cards…' })).toBeVisible(), {
      timeout: 3000,
    })
    await waitFor(() => expect(ui.getByRole('heading', { name: 'Cards exchanged' })).toBeVisible(), {
      timeout: 3000,
    })
  },
}
