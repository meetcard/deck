import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { CompanyCard } from './CompanyCard'

const meta = {
  component: CompanyCard,
  title: 'Build/Organisms/CompanyCard',
  tags: ['organism'],
  args: {
    name: 'MeetCard',
    industry: 'Developer tools',
  },
  render: (args) => (
    <div style={{ maxWidth: 440 }}>
      <CompanyCard {...args} />
    </div>
  ),
} satisfies Meta<typeof CompanyCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDescription: Story = {
  args: {
    description:
      'Digital business cards that turn conversations into relationships.',
  },
}

/** The "who do I know here?" surface. */
export const WithConnections: Story = {
  args: { connectionCount: 12 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('12 connections')).toBeVisible()
  },
}

/** Singular is handled, so the copy never reads "1 connections". */
export const SingleConnection: Story = {
  args: { connectionCount: 1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 connection')).toBeVisible()
  },
}

export const WithTags: Story = {
  args: { tags: ['Series B', 'Remote', 'Hiring'] },
}

export const Linked: Story = {
  args: { href: 'https://example.com', connectionCount: 4 },
}

export const WithActions: Story = {
  args: {
    actions: (
      <Button size="sm" variant="secondary">
        Follow
      </Button>
    ),
  },
}

export const InAList: Story = {
  render: (args) => (
    <Stack as="ul" gap={12} style={{ maxWidth: 440 }}>
      <li>
        <CompanyCard {...args} connectionCount={12} tags={['Series B']} />
      </li>
      <li>
        <CompanyCard
          {...args}
          name="Analytical Engines"
          industry="Hardware"
          connectionCount={3}
        />
      </li>
    </Stack>
  ),
}

/** Measured, so a story can say which way up the card is and prove the box. */
function cardShape(canvasElement: HTMLElement) {
  const card = canvasElement.querySelector<HTMLElement>('.deck-company-card')!
  return {
    card,
    ratio: card.offsetWidth / card.offsetHeight,
    orientation: card.dataset.cardOrientation,
  }
}

/**
 * The same object as a person's card: 1.75:1 lying down. Lying down is what
 * it does from `sm` up, with nothing around it deciding otherwise.
 */
export const Landscape: Story = {
  args: {
    description:
      'Digital business cards that turn conversations into relationships.',
    connectionCount: 12,
    tags: ['Series B', 'Remote'],
  },
  play: async ({ canvasElement }) => {
    const { ratio, orientation } = cardShape(canvasElement)
    await expect(orientation).toBe('landscape')
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}

/**
 * Stood up on a phone, like every card — 1:1.75, read down the middle.
 */
export const OnAPhone: Story = {
  ...Landscape,
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  play: async ({ canvasElement }) => {
    const { ratio, orientation } = cardShape(canvasElement)
    await expect(orientation).toBe('portrait')
    await expect(ratio).toBeGreaterThan(0.56)
    await expect(ratio).toBeLessThan(0.58)
  },
}

/**
 * More than fits. The box does not grow: the name truncates, the description
 * clamps, and the tags that run out of room stop at the edge. A card is a
 * fixed-size object, and what cannot fit on one does not belong on one.
 */
export const MoreThanFits: Story = {
  args: {
    name: 'Northwind Collaborative Design & Research Partners',
    industry: 'Design research, service design and organisational strategy',
    description:
      'An independent studio working across research, service design and strategy for public-sector and non-profit clients, with offices in Boulder, Portland and Toronto and a network of associates across North America.',
    connectionCount: 128,
    tags: ['Series B', 'Remote', 'B Corp', 'Hiring', 'Public sector', 'Non-profit'],
    actions: (
      <Button size="sm" variant="secondary">
        Follow
      </Button>
    ),
  },
  play: async ({ canvasElement, canvas }) => {
    // Still exactly the card's shape, however much was put on it.
    const { card, ratio } = cardShape(canvasElement)
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
    // The action sits inside the card, not past its bottom edge.
    const action = canvas.getByRole('button', { name: 'Follow' })
    await expect(action.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      card.getBoundingClientRect().bottom,
    )
  },
}
