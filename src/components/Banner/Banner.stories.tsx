import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { Banner } from './Banner'

const meta = {
  component: Banner,
  tags: ['molecule'],
  args: { title: 'Heads up', children: 'Something worth knowing about.' },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Banner {...args} />
    </div>
  ),
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tones: Story = {
  render: (args) => (
    <Stack gap={12} style={{ maxWidth: 560 }}>
      {(['info', 'brand', 'success', 'warning', 'error'] as const).map((tone) => (
        <Banner {...args} key={tone} tone={tone} title={tone}>
          Tone is never the only signal — the copy carries the meaning.
        </Banner>
      ))}
    </Stack>
  ),
}

/** A CRM write failed. Errors announce themselves via `role="alert"`. */
export const SyncFailed: Story = {
  args: {
    tone: 'error',
    title: 'CRM sync failed',
    children: '3 connections could not be written to Salesforce.',
    actions: <Button size="sm" variant="secondary">Retry</Button>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('CRM sync failed')
  },
}

/** Nearing the Solo cap — an upgrade prompt at the moment of realised value. */
export const PlanCap: Story = {
  args: {
    tone: 'warning',
    title: "You're close to your Solo limit",
    children: '92 of 100 connections used.',
    actions: <Button size="sm">Upgrade</Button>,
  },
}

/**
 * The recipient conversion invite. It must never block or degrade the core
 * save action, so it is a quiet inline banner rather than a modal.
 */
export const RecipientInvite: Story = {
  args: {
    tone: 'brand',
    title: 'Want a card like this?',
    children: 'Create your own MeetCard in under a minute — free.',
    actions: <Button size="sm">Create my card</Button>,
    onDismiss: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }))
    await expect(args.onDismiss).toHaveBeenCalledOnce()
  },
}

/** Offline notice — the PWA keeps working, writes queue for background sync. */
export const Offline: Story = {
  args: {
    tone: 'info',
    title: "You're offline",
    children: 'Your card still shows. Changes will sync when you reconnect.',
  },
}

export const WithoutTitle: Story = {
  args: { title: undefined, children: 'A single-line message with no title.' },
}
