import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import { findOpenDialog } from '../../test/dialog'
import { AppShell } from './AppShell'
import { MyCards } from './MyCards'

const meta = {
  component: MyCards,
  title: 'Experience/Application/My Cards',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MyCards>

export default meta
type Story = StoryObj<typeof meta>

/** The page on its own — two cards, the Business one on top. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'My cards' }),
    ).toBeVisible()
    // The pile says where you are in it through its dots, and the current
    // one carries `aria-current` rather than only a colour.
    await expect(
      canvas.getByRole('button', { name: 'Card 1 of 2', current: true }),
    ).toBeVisible()
    // The pile's front card is the only one exposed to assistive tech.
    await expect(
      canvas.getByRole('heading', { name: 'Alex Rivera' }),
    ).toBeVisible()
  },
}

/**
 * Editing updates the card above it as you type. That is the whole reason the
 * form sits under the artifact rather than beside a preview.
 */
export const EditingLive: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit card' }))

    const tagline = await canvas.findByLabelText('Tagline')
    await userEvent.clear(tagline)
    await userEvent.type(tagline, 'Back from leave.')

    await waitFor(async () => {
      await expect(canvas.getByText('Back from leave.')).toBeVisible()
    })
  },
}

/** Choosing a row moves the pile, rather than following a link nowhere. */
export const SelectingFromTheList: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('button', { name: 'Card 1 of 2', current: true }),
    ).toBeVisible()

    const rows = canvas.getAllByRole('button', { name: /Alex Rivera/ })
    await userEvent.click(rows[rows.length - 1])

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Card 2 of 2', current: true }),
      ).toBeVisible()
    })
  },
}

/*
 * One dialog left on this page — the new-card sheet. `findOpenDialog` retries
 * the query itself, because a sheet opens from an effect that has not
 * necessarily run by the time `play` starts.
 */

/**
 * Sharing turns the card over rather than raising a dialog. The link and the
 * snapshot are the active card's own.
 */
export const Sharing: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }))

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Share link')).toHaveValue(
        'meetcard.io/alex@northwind',
      )
    })
    await expect(
      canvas.getByText('Alex Rivera, Design Lead at Northwind Studio'),
    ).toBeVisible()
  },
}

/**
 * The company behind the card, reached from its name. The same card turned,
 * not a page you navigate to: you wondered who they work for while holding
 * their card, so the answer is on it.
 */
export const TheCompanyBehindIt: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Northwind Studio' }),
    )

    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { name: 'Meet people. Remember them.' }),
      ).toBeVisible()
    })
    // And the way back is to the card that led you here.
    await expect(
      canvas.getByRole('button', { name: "Back to Alex Rivera's card" }),
    ).toBeVisible()
  },
}

/**
 * Sharing from the company hands over the company — its link, its snapshot —
 * rather than the person who happened to be showing it.
 */
export const SharingTheCompany: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Northwind Studio' }),
    )

    const share = await canvas.findByRole('button', { name: 'Share' })
    await userEvent.click(share)

    await waitFor(async () => {
      await expect(canvas.getByLabelText('Share link')).toHaveValue(
        'meetcard.io/@northwind',
      )
    })
  },
}

/**
 * Making one lands you on it, with the editor already open — the only reason
 * `CardPile` needed a controlled index.
 */
export const CreatingACard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'New' }))

    const dialog = await findOpenDialog(canvasElement)
    const ui = within(dialog)
    await waitFor(async () => {
      await expect(ui.getByLabelText('Name')).toBeVisible()
    })

    await userEvent.type(ui.getByLabelText('Name'), 'Alex at Acme')
    await userEvent.click(ui.getByRole('button', { name: 'Create card' }))

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Card 3 of 3', current: true }),
      ).toBeVisible()
    })
    await expect(canvas.getByLabelText('Tagline')).toBeVisible()
  },
}

/** In the shell it renders under, at the rail's `/cards` destination. */
export const InAppShell: Story = {
  render: () => (
    <AppShell currentId="/cards">
      <MyCards />
    </AppShell>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'My cards' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

/** Phone. The page is desk-first, but it is reachable by link. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'My cards' }),
    ).toBeVisible()
  },
}
