import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { QRCode } from './QRCode'

/** A stand-in matrix. Real codes come from Dub.co against metcard.io. */
const SampleMatrix = () => (
  <svg viewBox="0 0 21 21" aria-hidden="true">
    <rect width="21" height="21" fill="#fff" />
    <path
      d="M0 0h7v7H0zM2 2h3v3H2zM14 0h7v7h-7zM16 2h3v3h-3zM0 14h7v7H0zM2 16h3v3H2zM9 0h1v1H9zM9 2h1v3H9zM11 1h1v2h-1zM13 9h1v1h-1zM9 9h2v1H9zM9 11h1v2H9zM11 12h2v1h-2zM15 9h1v2h-1zM17 10h2v1h-2zM19 12h1v2h-1zM9 15h1v2H9zM11 16h2v1h-2zM14 15h1v1h-1zM16 17h1v2h-1zM18 15h2v1h-2zM13 19h3v1h-3zM17 13h1v1h-1z"
      fill="#1a1a1a"
    />
  </svg>
)

const meta = {
  component: QRCode,
  tags: ['atom'],
  args: { value: 'https://metcard.io/ben' },
  render: (args) => (
    <QRCode {...args}>
      <SampleMatrix />
    </QRCode>
  ),
} satisfies Meta<typeof QRCode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('img', { name: 'QR code for https://metcard.io/ben' }),
    ).toBeVisible()
  },
}

/** The share view — as large as the viewport allows, held up to be scanned. */
export const ShareView: Story = {
  args: { size: 'xl', caption: 'Scan to save my card' },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={16} align="center" wrap>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <QRCode {...args} key={size} size={size} showValue={false}>
          <SampleMatrix />
        </QRCode>
      ))}
    </Stack>
  ),
}

/** A mark in the code's error-correction zone. Keep it small. */
export const WithLogo: Story = {
  args: {
    logo: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" rx="6" fill="#2e6e5b" />
        <path d="M7 16V8l5 5 5-5v8" fill="none" stroke="#faf8f4" strokeWidth="2" />
      </svg>
    ),
  },
}

export const WithoutValue: Story = {
  args: { showValue: false },
}

/**
 * The plate stays light in dark mode on purpose — scanners need a light
 * quiet zone and high contrast. This story is the regression guard.
 */
export const PlateStaysLightInDarkMode: Story = {
  play: async ({ canvas }) => {
    const plate = canvas.getByRole('img', {
      name: /QR code/,
    }).closest('.deck-qrcode__plate')
    await expect(plate).not.toBeNull()
    await expect(getComputedStyle(plate as Element).backgroundColor).toBe(
      'rgb(255, 255, 255)',
    )
  },
}
