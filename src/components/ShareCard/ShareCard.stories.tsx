import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { QRCode } from '../QRCode/QRCode'
import { ShareCard } from './ShareCard'

const COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="320">
       <rect width="560" height="320" fill="#fdfbf7"/>
       <circle cx="150" cy="90" r="130" fill="#ffe9c7"/>
       <circle cx="430" cy="240" r="170" fill="#dbeee4"/>
       <rect x="240" y="40" width="120" height="240" fill="#fff6e0"/>
     </svg>`,
  )

/** Stands in for a generated code — the shape and weight of a real one. */
const Matrix = () => (
  <svg viewBox="0 0 29 29" width="100%" height="100%" aria-hidden="true">
    <rect width="29" height="29" fill="#ffffff" />
    {[
      [0, 0],
      [22, 0],
      [0, 22],
    ].map(([x, y]) => (
      <g key={`${x}-${y}`} fill="#1a1a1a">
        <rect x={x} y={y} width="7" height="7" />
        <rect x={x + 1} y={y + 1} width="5" height="5" fill="#ffffff" />
        <rect x={x + 2} y={y + 2} width="3" height="3" />
      </g>
    ))}
    {Array.from({ length: 90 }, (_, i) => {
      const x = (i * 7) % 19
      const y = (i * 11) % 19
      return <rect key={i} x={x + 5} y={y + 5} width="1" height="1" fill="#1a1a1a" />
    })}
  </svg>
)

const meta = {
  component: ShareCard,
  title: 'Build/Organisms/ShareCard',
  tags: ['organism'],
  args: {
    name: 'Nora Whitfield',
    detail: 'Product Lead at Rivermark',
    location: 'Denver, Colorado',
    contacts: ['nora@rivermark.com', '(303) 555-0142'],
    coverSrc: COVER,
    children: (
      <QRCode value="meetcard.io/nora" size="md">
        <Matrix />
      </QRCode>
    ),
  },
} satisfies Meta<typeof ShareCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The card held up to be scanned. Lying down from `sm` up, with the code in
 * the middle and who it belongs to along the foot.
 */
export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Scan to exchange cards' }),
    ).toBeVisible()
    // The code carries the link for anyone who cannot point a camera at it.
    await expect(
      canvas.getByRole('img', { name: 'QR code for meetcard.io/nora' }),
    ).toBeVisible()

    const card = canvasElement.querySelector<HTMLElement>('.deck-share-card')!
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/**
 * The orientation this card is usually in: a phone held out to someone
 * pointing another phone at it.
 */
export const OnAPhone: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-share-card')!
    await expect(card).toHaveAttribute('data-card-orientation', 'portrait')

    // The code stays inside the card at every size — a QR cropped by the
    // edge of the box is one that will not scan.
    const code = canvasElement.querySelector<HTMLElement>('.deck-share-card__code')!
    const cardBox = card.getBoundingClientRect()
    const codeBox = code.getBoundingClientRect()
    await expect(codeBox.top).toBeGreaterThanOrEqual(cardBox.top - 1)
    await expect(codeBox.bottom).toBeLessThanOrEqual(cardBox.bottom + 1)
  },
}

/**
 * The words change with what is being exchanged; the card does not.
 */
export const OwnWording: Story = {
  args: {
    eyebrow: 'Scan me',
    title: 'Point a camera here',
  },
}

/** Without a cover photo — the brand under the same scrim. */
export const WithoutACover: Story = {
  args: { coverSrc: undefined },
}
