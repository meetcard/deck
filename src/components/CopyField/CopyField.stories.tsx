import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { CopyField } from './CopyField'

const LinkIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6.5 9.5l3-3M6.8 4.7 8 3.5a2.5 2.5 0 1 1 3.5 3.5L10.3 8.2M9.2 11.3 8 12.5a2.5 2.5 0 1 1-3.5-3.5L5.7 7.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
)

const meta = {
  component: CopyField,
  title: 'Build/Molecules/CopyField',
  tags: ['molecule'],
  args: {
    label: 'Shareable link',
    value: 'meetcard.io/ben@meetcard',
    icon: <LinkIcon />,
  },
} satisfies Meta<typeof CopyField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const VisibleLabel: Story = {
  args: { showLabel: true },
}

export const WithoutIcon: Story = {
  args: { icon: undefined },
}

/**
 * The button swaps to a checkmark once the value is copied, then swaps back.
 * Clipboard write permission isn't reliably grantable in a headless browser,
 * so the write itself is stubbed — the point under test is the component's
 * own state, not whether Chromium will hand out the clipboard.
 */
export const CopyInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const writeText = fn(async () => {})
    const clipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy link' }))

      // The value copied is the field's value, not its label or placeholder.
      await expect(writeText).toHaveBeenCalledWith('meetcard.io/ben@meetcard')

      // Named "Copied" while it shows the check, so the swap is announced
      // rather than being a purely visual change.
      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Copied' }),
        ).toBeVisible()
      })

      // And it resets itself, so the affordance comes back.
      await waitFor(
        async () => {
          await expect(
            canvas.getByRole('button', { name: 'Copy link' }),
          ).toBeVisible()
        },
        { timeout: 3000 },
      )
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboard,
        configurable: true,
      })
    }
  },
}

/**
 * A denied clipboard is the expected case on an insecure origin, so it must
 * not throw — the value stays selectable in the input as a manual fallback.
 */
export const CopyDenied: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const clipboard = navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: fn(async () => {
          throw new Error('Write permission denied.')
        }),
      },
      configurable: true,
    })

    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Copy link' }))

      // Swallowed: no checkmark, and the control keeps its original name.
      await expect(
        canvas.getByRole('button', { name: 'Copy link' }),
      ).toBeVisible()
      await expect(canvas.queryByRole('button', { name: 'Copied' })).toBeNull()
    } finally {
      Object.defineProperty(navigator, 'clipboard', {
        value: clipboard,
        configurable: true,
      })
    }
  },
}

/**
 * Focusing selects the whole value. The field is read-only and exists to be
 * taken somewhere else, so a click should not leave a caret mid-string.
 */
export const FocusSelectsTheValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Shareable link') as HTMLInputElement

    input.focus()

    await waitFor(async () => {
      await expect(input.selectionStart).toBe(0)
      await expect(input.selectionEnd).toBe(input.value.length)
    })
  },
}
