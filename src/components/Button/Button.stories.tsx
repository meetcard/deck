import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Button } from './Button'

const ShareIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M8 10V2m0 0L5 5m3-3l3 3M3 10v3h10v-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta = {
  component: Button,
  args: {
    children: 'Share card',
    onClick: fn(),
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Share card' })
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

/** Paired with a primary action, or used alone for lower-emphasis choices. */
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Add to CRM' },
}

/** Lowest emphasis — toolbars, card overflow rows, and dismissals. */
export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
}

/** Irreversible actions only. Always confirm before the action runs. */
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete card' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={12} align="center">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </Stack>
  ),
}

/** Icons are decorative — the label carries the accessible name. */
export const WithIcon: Story = {
  args: { iconStart: <ShareIcon /> },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled()
  },
}

/** Fills its container — the usual choice inside a card footer or a form. */
export const FullWidth: Story = {
  args: { fullWidth: true },
}

/**
 * Proves the shared preview actually loaded Deck's token stylesheet: the
 * primary surface must resolve to the Signal Green action token in light
 * mode, or its derived counterpart in dark.
 */
export const CssCheck: Story = {
  args: { variant: 'primary' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Share card' })
    const background = getComputedStyle(button).backgroundColor
    // --deck-color-action-primary: #2e6e5b light / #6fc3aa dark
    await expect(['rgb(46, 110, 91)', 'rgb(111, 195, 170)']).toContain(
      background,
    )
  },
}
