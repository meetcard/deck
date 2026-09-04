import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { LogIn } from './LogIn'

const meta = {
  component: LogIn,
  title: 'Experience/Application/Log In',
  tags: ['page'],
  args: {
    onSubmit: fn(),
    onProviderSelect: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof LogIn>

export default meta
type Story = StoryObj<typeof meta>

/*
 * Every field here is required, and `Field` puts the required marker inside
 * the `<label>`. The marker is `aria-hidden`, so assistive tech hears
 * "Email" — but `getByLabelText` reads `textContent` and sees "Email*".
 * Matching on the prefix keeps these queries about the label rather than
 * about the asterisk.
 */
const EMAIL = /^Email/
const PASSWORD = /^Password/

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Welcome back' }),
    ).toBeVisible()
    await expect(canvas.getByLabelText(EMAIL)).toBeVisible()
    await expect(canvas.getByLabelText(PASSWORD)).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible()
  },
}

/** Submitting hands the two values up; nothing is held on this screen. */
export const Submitting: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText(EMAIL), 'ada@meetcard.com')
    await userEvent.type(canvas.getByLabelText(PASSWORD), 'hunter2hunter2')
    await userEvent.click(canvas.getByRole('button', { name: 'Log in' }))

    await expect(args.onSubmit).toHaveBeenCalledWith({
      email: 'ada@meetcard.com',
      password: 'hunter2hunter2',
    })
  },
}

/** The reveal, on the screen it exists for: checking a typo on a phone. */
export const PasswordRevealed: Story = {
  play: async ({ canvas, userEvent }) => {
    const password = canvas.getByLabelText(PASSWORD)
    await userEvent.type(password, 'hunter2hunter2')
    await userEvent.click(canvas.getByRole('button', { name: 'Show password' }))

    await expect(password).toHaveAttribute('type', 'text')
  },
}

/** A failed attempt. The message announces itself rather than only appearing. */
export const WithError: Story = {
  args: {
    error: "That email and password don't match an account.",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      "That email and password don't match an account.",
    )
  },
}

/**
 * In flight. Everything locks — including the provider row, so a slow
 * response can't turn into two sign-in attempts.
 */
export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Logging in…' }),
    ).toBeDisabled()
    await expect(
      canvas.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled()
  },
}

/** Choosing SSO hands the connection up for Clerk to redirect to. */
export const ProviderChosen: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Continue with LinkedIn' }),
    )
    await expect(args.onProviderSelect).toHaveBeenCalledWith('linkedin')
  },
}

/** At 375px the card fills the width and the provider row still fits one line. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
}
