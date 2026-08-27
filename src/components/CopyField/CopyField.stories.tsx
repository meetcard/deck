import type { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'
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
 * The button swaps to a checkmark once the value is copied. Doesn't assert
 * on that swap here — clipboard write permission isn't reliably grantable
 * in a headless test browser, and the component already degrades safely
 * when `navigator.clipboard` throws (the value stays selectable as a manual
 * fallback). This just confirms the control is present and clickable.
 */
export const CopyInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'Copy link' })
    await userEvent.click(button)
  },
}
