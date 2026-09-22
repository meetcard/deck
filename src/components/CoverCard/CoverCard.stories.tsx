import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { CoverCard } from './CoverCard'

/*
 * A deliberately *pale* stand-in for a cover photo — the same one the
 * `EventHeaderCard` stories use. Drawn rather than fetched, so the story is
 * deterministic in Chromatic and offline, and light because a bright
 * picture is the hard case for a scrim: if paper reads against this, it
 * reads against anything.
 */
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

const meta = {
  component: CoverCard,
  title: 'Build/Molecules/CoverCard',
  tags: ['molecule'],
  args: {
    coverSrc: COVER,
    children: (
      <>
        <Badge tone="success" size="sm">
          Attending
        </Badge>
        <Heading level={2} size="lg" family="serif" style={{ margin: 0 }}>
          RevOps Summit
        </Heading>
        <Text size="sm">Austin Convention Center</Text>
      </>
    ),
  },
} satisfies Meta<typeof CoverCard>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The shape and the photograph. Everything inside reads against the scrim's
 * own on-color rather than the page's — `Badge` and `Text` come out right in
 * here without knowing they are on a photo.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-cover-card')!
    await expect(card).toHaveAttribute('data-card-orientation', 'landscape')
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/** Stood up on a phone, like every card. */
export const OnAPhone: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('.deck-cover-card')!
    await expect(card).toHaveAttribute('data-card-orientation', 'portrait')
    const ratio = card.offsetWidth / card.offsetHeight
    await expect(ratio).toBeGreaterThan(0.56)
    await expect(ratio).toBeLessThan(0.58)
  },
}

/**
 * Blurred, for a surface whose job is to be read. `EventHeaderCard` does this: a
 * long name over a sharp picture is a name you have to work at.
 */
export const BlurredCover: Story = {
  args: { blurCover: true },
}

/**
 * No photo. The brand under the same scrim — a quieter card, not a broken
 * one, so a card is never waiting on an image to look finished.
 */
export const WithoutACover: Story = {
  args: { coverSrc: undefined },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('.deck-cover-card__image'),
    ).toBeNull()
    // The scrim stays, so the on-color contract inside still holds.
    await expect(
      canvasElement.querySelector('.deck-cover-card__scrim'),
    ).toBeInTheDocument()
  },
}
