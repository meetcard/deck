import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { SignUp } from './SignUp'

const meta = {
  component: SignUp,
  title: 'Experience/Application/Sign Up',
  tags: ['page'],
  args: {
    onSubmit: fn(),
    onProviderSelect: fn(),
    onScanCard: fn(),
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SignUp>

export default meta
type Story = StoryObj<typeof meta>

/*
 * Every field here is required, and `Field` puts the required marker inside
 * the `<label>`. The marker is `aria-hidden`, so assistive tech hears
 * "Email" — but `getByLabelText` reads `textContent` and sees "Email*".
 * Matching on the prefix keeps these queries about the label rather than
 * about the asterisk.
 */
const FIRST_NAME = /^First Name/
const LAST_NAME = /^Last Name/
const EMAIL = /^Email/
const PASSWORD = /^Password/

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Create your account' }),
    ).toBeVisible()
    for (const field of [FIRST_NAME, LAST_NAME, EMAIL, PASSWORD]) {
      await expect(canvas.getByLabelText(field)).toBeVisible()
    }
    await expect(
      canvas.getByRole('button', { name: 'Scan your card' }),
    ).toBeVisible()
  },
}

export const Submitting: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText(FIRST_NAME), 'Ada')
    await userEvent.type(canvas.getByLabelText(LAST_NAME), 'Lovelace')
    await userEvent.type(canvas.getByLabelText(EMAIL), 'ada@meetcard.com')
    await userEvent.type(canvas.getByLabelText(PASSWORD), 'analytical-engine')
    await userEvent.click(canvas.getByRole('button', { name: 'Sign up' }))

    await expect(args.onSubmit).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@meetcard.com',
      password: 'analytical-engine',
    })
  },
}

/**
 * A new password, not a current one — which is what prompts a password
 * manager to offer a generated one rather than an existing one.
 */
export const AsksForANewPassword: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText(PASSWORD)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  },
}

/** The OCR path — the option that belongs to a business-card company. */
export const ScanningACard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Scan your card' }))
    await expect(args.onScanCard).toHaveBeenCalled()
  },
}

/**
 * Without a scanner — no camera, or a browser that can't reach one. The
 * option is absent rather than present and broken.
 */
export const WithoutCardScanning: Story = {
  args: { onScanCard: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('button', { name: 'Scan your card' }),
    ).not.toBeInTheDocument()
  },
}

export const WithError: Story = {
  args: { error: 'An account already exists for that email address.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toBeVisible()
  },
}

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Creating your account…' }),
    ).toBeDisabled()
  },
}

/** Four fields at 375px, with the names still side by side. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
}
