import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { PersonCard } from '../PersonCard/PersonCard'
import { CardPile } from './CardPile'

const meta = {
  component: CardPile,
  title: 'Build/Organisms/CardPile',
  tags: ['organism'],
  args: {
    label: "Ada's saved cards",
    onActiveIndexChange: fn(),
    // Overridden by each story's `render`; present so the required
    // `children` prop is satisfied for the docs table.
    children: <PersonCard name="Ada Lovelace" />,
  },
} satisfies Meta<typeof CardPile>

export default meta
type Story = StoryObj<typeof meta>

/** Three cards piled, front one fully readable with the rest peeking behind. */
export const Default: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard
        name="Ada Lovelace"
        title="Head of Partnerships"
        company="MeetCard"
        tagline="Let's find the overlap."
        footer={
          <Button variant="secondary" size="sm">
            Share
          </Button>
        }
      />
      <PersonCard
        name="Ada Lovelace"
        title="Analytical Engine"
        company="Side project"
      />
      <PersonCard name="Ada Lovelace" title="Countess of Lovelace" />
    </CardPile>
  ),
}

/**
 * Swiping the front card past the drag threshold advances the pile — the
 * front card animates off and the next one takes its place. Simulated here
 * via pointer events rather than a real touch gesture, since jsdom/Chromium
 * test runners don't synthesize touch drags.
 */
export const SwipeAdvances: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Card one" />
      <PersonCard name="Grace Hopper" title="Card two" />
      <PersonCard name="Katherine Johnson" title="Card three" />
    </CardPile>
  ),
  play: async ({ canvas, userEvent, args }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()

    const front = canvas
      .getByRole('heading', { name: 'Ada Lovelace' })
      .closest('.deck-card-pile__layer--front') as HTMLElement

    // A raw dispatchEvent sequence would race React's state updates between
    // pointerdown/move/up; userEvent.pointer sequences steps properly.
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: front, coords: { x: 200, y: 0 } },
      { target: front, coords: { x: 60, y: 0 } },
      { keys: '[/MouseLeft]', target: front, coords: { x: 60, y: 0 } },
    ])

    await expect(
      await canvas.findByRole(
        'heading',
        { name: 'Grace Hopper' },
        { timeout: 1000 },
      ),
    ).toBeVisible()
    await expect(args.onActiveIndexChange).toHaveBeenCalledWith(1)
  },
}

/**
 * A small drag that doesn't clear the threshold springs back — it isn't
 * mistaken for a swipe, and a tap on the front card's own content (like its
 * Share button) still works normally.
 */
export const SmallDragSpringsBack: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Card one" />
      <PersonCard name="Grace Hopper" title="Card two" />
    </CardPile>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const front = canvas
      .getByRole('heading', { name: 'Ada Lovelace' })
      .closest('.deck-card-pile__layer--front') as HTMLElement

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: front, coords: { x: 200, y: 0 } },
      { target: front, coords: { x: 220, y: 0 } },
      { keys: '[/MouseLeft]', target: front, coords: { x: 220, y: 0 } },
    ])

    await expect(
      canvas.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()
    await expect(args.onActiveIndexChange).not.toHaveBeenCalled()
  },
}

/**
 * Swiping right — the opposite direction from `SwipeAdvances` — goes
 * backward instead, wrapping to the last card. Real Chromium only: jsdom's
 * PointerEvent support can't reliably drive a drag.
 */
export const SwipeRightGoesToPrevious: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Card one" />
      <PersonCard name="Grace Hopper" title="Card two" />
      <PersonCard name="Katherine Johnson" title="Card three" />
    </CardPile>
  ),
  play: async ({ canvas, userEvent, args }) => {
    const front = canvas
      .getByRole('heading', { name: 'Ada Lovelace' })
      .closest('.deck-card-pile__layer--front') as HTMLElement

    // From the first card, going backward wraps to the last one.
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: front, coords: { x: 60, y: 0 } },
      { target: front, coords: { x: 200, y: 0 } },
      { keys: '[/MouseLeft]', target: front, coords: { x: 200, y: 0 } },
    ])

    await expect(
      await canvas.findByRole(
        'heading',
        { name: 'Katherine Johnson' },
        { timeout: 1000 },
      ),
    ).toBeVisible()
    await expect(args.onActiveIndexChange).toHaveBeenCalledWith(2)
  },
}

/** Previous/Next buttons and Arrow Left/Right are full equivalents to swipe. */
export const KeyboardAndButtons: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Card one" />
      <PersonCard name="Grace Hopper" title="Card two" />
      <PersonCard name="Katherine Johnson" title="Card three" />
    </CardPile>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next card' }))
    await expect(
      await canvas.findByRole('heading', { name: 'Grace Hopper' }),
    ).toBeVisible()

    await userEvent.click(
      canvas.getByRole('button', { name: 'Previous card' }),
    )
    await expect(
      await canvas.findByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()
  },
}

/**
 * Only the front card is visible to assistive tech — the peeking cards
 * behind it are decorative duplicates of content the front card will show
 * once it cycles to the top.
 */
export const BackCardsAreDecorative: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Card one" />
      <PersonCard name="Grace Hopper" title="Card two" />
      <PersonCard name="Katherine Johnson" title="Card three" />
    </CardPile>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('heading', { name: 'Grace Hopper' }),
    ).not.toBeInTheDocument()
    await expect(
      canvas.queryByRole('heading', { name: 'Katherine Johnson' }),
    ).not.toBeInTheDocument()
  },
}

/** More cards than fit as physical depth collapse into a count badge. */
export const OverflowBadge: Story = {
  args: { maxVisible: 3 },
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="One" />
      <PersonCard name="Grace Hopper" title="Two" />
      <PersonCard name="Katherine Johnson" title="Three" />
      <PersonCard name="Margaret Hamilton" title="Four" />
      <PersonCard name="Radia Perlman" title="Five" />
    </CardPile>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('+2')).toBeVisible()
  },
}

/** A single card renders cleanly — no controls, since there's nothing to flip to. */
export const SingleCard: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard name="Ada Lovelace" title="Head of Partnerships" />
    </CardPile>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('button', { name: 'Next card' }),
    ).not.toBeInTheDocument()
  },
}

/**
 * Every card in the pile is the same object: identical box, at roughly a US
 * business card's 3.5x2. Measured rather than asserted in prose, because the
 * pile only reads as a pile while it holds — content-driven heights had one
 * person's card 75px shorter than the next, and no amount of offsetting
 * recovers from that.
 */
export const UniformCards: Story = {
  render: (args) => (
    <CardPile {...args}>
      <PersonCard
        name="Ada Lovelace"
        title="Head of Partnerships"
        company="MeetCard"
        location="Boulder, Colorado"
        tagline="Let's find the overlap."
        footer={
          <Button variant="secondary" size="sm">
            Share
          </Button>
        }
      />
      {/* Deliberately sparse — the card must not shrink to fit less. */}
      <PersonCard name="Ada Lovelace" />
      <PersonCard
        name="Augusta Ada King-Noel, Countess of Lovelace"
        title="Head of Strategic Partnerships and Developer Relations"
        company="MeetCard"
      />
    </CardPile>
  ),
  play: async ({ canvasElement }) => {
    const cards = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('.deck-person-card'),
    )
    await expect(cards.length).toBeGreaterThan(1)

    const [first] = cards
    for (const card of cards) {
      await expect(card.offsetWidth).toBe(first.offsetWidth)
      await expect(card.offsetHeight).toBe(first.offsetHeight)
      // Nothing spills out of a box that can no longer grow.
      await expect(card.scrollHeight).toBeLessThanOrEqual(card.clientHeight + 1)
    }

    // 7/4 = 1.75, allowing a pixel of rounding at this width.
    const ratio = first.offsetWidth / first.offsetHeight
    await expect(ratio).toBeGreaterThan(1.72)
    await expect(ratio).toBeLessThan(1.78)
  },
}
