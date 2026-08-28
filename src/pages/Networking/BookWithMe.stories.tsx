import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { BookWithMe } from './BookWithMe'

const meta = {
  component: BookWithMe,
  title: 'Experience/Networking/Book with Me',
  tags: ['page'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BookWithMe>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/**
 * The whole individual flow, end to end. `BookingFlow` is a wizard whose every
 * step gates the next, so rendering step one proves almost nothing — the CTA's
 * `ready` rule, the progressive reveal on the availability step, and the
 * summary the confirmation is built from are only reachable by walking it.
 */
export const BookingEndToEnd: Story = {
  play: async ({ canvas, userEvent }) => {
    /* Purpose. The CTA stays disabled until a topic is chosen — nothing
       downstream can be asked until we know what this is about. */
    const findATime = canvas.getByRole('button', {
      name: 'Find a time that works',
    })
    await expect(findATime).toBeDisabled()

    await userEvent.click(canvas.getByRole('radio', { name: 'Sales inquiry' }))
    await userEvent.type(
      canvas.getByLabelText('What would you like to accomplish?'),
      'Scope a rollout for the field team.',
    )
    await waitFor(async () => await expect(findATime).toBeEnabled())
    await userEvent.click(findATime)

    /*
     * Availability reveals in sequence: the day strip only appears once a
     * duration is set, the times only once a day is. Asserting the absence
     * first is the point — it is the behaviour, not incidental ordering.
     */
    const next = canvas.getByRole('button', { name: 'Finally, your details' })
    await expect(next).toBeDisabled()
    await expect(canvas.queryByText('Pick a day')).toBeNull()

    await userEvent.click(canvas.getByRole('radio', { name: /30 min/ }))
    await waitFor(async () => {
      await expect(canvas.getByText('Pick a day')).toBeVisible()
    })
    await expect(canvas.queryByText('Pick a time')).toBeNull()

    // A day with nothing left is shown rather than dropped, but not choosable.
    await expect(
      canvas.getByRole('radio', { name: /^Sat 5 No times available/ }),
    ).toBeDisabled()

    await userEvent.click(canvas.getByRole('radio', { name: /^Wed 2 / }))
    await waitFor(async () => {
      await expect(canvas.getByText('Pick a time')).toBeVisible()
    })

    // A taken slot is offered but not choosable.
    await expect(
      canvas.getByRole('radio', { name: '10:00 AM (unavailable)' }),
    ).toBeDisabled()

    await userEvent.click(canvas.getByRole('radio', { name: '9:30 AM' }))
    await waitFor(async () => await expect(next).toBeEnabled())
    await userEvent.click(next)

    /* Details. The summary above the form is built from every answer so far,
       which is the first place the flow's state is shown back as one piece. */
    const confirm = canvas.getByRole('button', { name: 'Confirm booking' })
    await expect(confirm).toBeDisabled()
    await expect(canvas.getByText(/9:30 AM · 30 min/)).toBeVisible()

    await userEvent.type(canvas.getByLabelText(/First name/), 'Alex')
    await userEvent.type(canvas.getByLabelText(/Last name/), 'Rivera')
    await userEvent.type(canvas.getByLabelText(/Email/), 'alex@northwind.com')
    await waitFor(async () => await expect(confirm).toBeEnabled())
    await userEvent.click(confirm)

    /* Booked. The confirmation names the address it was sent to, and repeats
       the summary with the edit affordances stripped out. */
    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', { name: /You.re booked/ }),
      ).toBeVisible()
    })
    await expect(canvas.getByText(/alex@northwind\.com/)).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: /Change date and time/ }),
    ).toBeNull()
  },
}

/**
 * The stepper only walks backwards. Steps ahead depend on decisions not made
 * yet, so they stay unreachable until they have been reached in order.
 */
export const SteppingBack: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Product demo' }))
    await userEvent.click(
      canvas.getByRole('button', { name: 'Find a time that works' }),
    )
    await waitFor(async () => {
      await expect(canvas.getByText('How long do you need?')).toBeVisible()
    })

    // Forward is refused: "Details" sits ahead of where we are.
    const ahead = canvas.queryByRole('button', { name: /^Details/ })
    if (ahead) {
      await userEvent.click(ahead)
      await expect(canvas.getByText('How long do you need?')).toBeVisible()
    }

    // Back is allowed, and the answer that got us here is still selected.
    await userEvent.click(canvas.getByRole('button', { name: /^Purpose/ }))
    await waitFor(async () => {
      await expect(
        canvas.getByRole('radio', { name: 'Product demo' }),
      ).toBeChecked()
    })
  },
}
