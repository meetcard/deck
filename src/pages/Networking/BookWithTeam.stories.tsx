import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { BookWithTeam } from './BookWithTeam'

const meta = {
  component: BookWithTeam,
  title: 'Experience/Networking/Book with Team',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BookWithTeam>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * Team mode is the individual flow with one step inserted, and the claim the
 * component is built on is that the two converge once a person is chosen. The
 * only way to check that is to walk to the team step and watch the header stop
 * saying the company's name and start saying theirs.
 */
export const RoutingToAPerson: Story = {
  play: async ({ canvas, userEvent }) => {
    // Until someone is chosen, the booking is with the company.
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'MeetCard' }),
    ).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: 'Partnership' }))
    await userEvent.click(
      canvas.getByRole('button', { name: 'Find a time that works' }),
    )

    /* The CTA is the tell that this is the team flow — individual mode goes
       straight to the details step from here. */
    const seeWhoCanHelp = await canvas.findByRole('button', {
      name: 'See who can help',
    })

    await userEvent.click(canvas.getByRole('radio', { name: /30 min/ }))
    await userEvent.click(canvas.getByRole('radio', { name: /^Wed 2 / }))
    await userEvent.click(canvas.getByRole('radio', { name: '9:30 AM' }))
    await waitFor(async () => await expect(seeWhoCanHelp).toBeEnabled())
    await userEvent.click(seeWhoCanHelp)

    /*
     * Routed by topic: "Partnership" is handled by Priya and Ana, not Marcus.
     * Offering the whole team here would make the step decorative.
     */
    await waitFor(async () => {
      await expect(canvas.getByText('Choose a team member')).toBeVisible()
    })
    await expect(canvas.getByRole('radio', { name: /Priya Shah/ })).toBeVisible()
    await expect(canvas.getByRole('radio', { name: /Ana Duarte/ })).toBeVisible()
    await expect(canvas.queryByRole('radio', { name: /Marcus Lee/ })).toBeNull()

    // The next opening is what makes this a choice rather than a list of names.
    await expect(canvas.getByText(/next Fri 2:00 PM/)).toBeVisible()

    await userEvent.click(canvas.getByRole('radio', { name: /Ana Duarte/ }))

    // Converged: the subject resolves from the company to the person.
    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { level: 1, name: 'Ana Duarte at MeetCard' }),
      ).toBeVisible()
    })

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finally, your details' }),
    )

    /* From here the two flows are identical, except the summary carries the
       extra person row — with its own way back to the step that set it. */
    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: /Change team member/ }),
      ).toBeVisible()
    })
    await expect(
      canvas.getByText(/Head of Partnerships · Partnership/),
    ).toBeVisible()
  },
}

/**
 * The summary's edit affordances go back to the step that set each answer —
 * the one route through the flow that isn't the CTA.
 */
export const EditingFromTheSummary: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Product demo' }))
    await userEvent.click(
      canvas.getByRole('button', { name: 'Find a time that works' }),
    )
    await userEvent.click(canvas.getByRole('radio', { name: /15 min/ }))
    await userEvent.click(canvas.getByRole('radio', { name: /^Wed 2 / }))
    await userEvent.click(canvas.getByRole('radio', { name: '9:00 AM' }))
    await userEvent.click(
      await canvas.findByRole('button', { name: 'See who can help' }),
    )

    // "Product demo" routes to Marcus alone.
    await userEvent.click(
      await canvas.findByRole('radio', { name: /Marcus Lee/ }),
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Finally, your details' }),
    )

    await userEvent.click(
      await canvas.findByRole('button', { name: /Change date and time/ }),
    )

    // Back on availability, with every earlier answer intact.
    await waitFor(async () => {
      await expect(canvas.getByText('How long do you need?')).toBeVisible()
    })
    await expect(canvas.getByRole('radio', { name: /15 min/ })).toBeChecked()
    await expect(canvas.getByRole('radio', { name: '9:00 AM' })).toBeChecked()
  },
}
