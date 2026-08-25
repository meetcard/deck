import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from '../Button/Button'
import { Stack } from '../Stack/Stack'
import { MeetCard } from './MeetCard'

const meta = {
  component: MeetCard,
  args: {
    name: 'Ada Lovelace',
    title: 'Head of Partnerships',
    company: 'MeetCard',
    tagline: "Let's find the overlap.",
  },
} satisfies Meta<typeof MeetCard>

export default meta
type Story = StoryObj<typeof meta>

/** The signature card: brand green, inverse text, tactile lift on hover. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()
  },
}

/** The light variant, for print-like and paper-surface contexts. */
export const Paper: Story = {
  args: { tone: 'paper' },
}

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button size="sm" variant="secondary" onClick={fn()}>
          Share
        </Button>
        <Button size="sm" variant="ghost" onClick={fn()}>
          Save contact
        </Button>
      </>
    ),
  },
}

/** Minimum viable card — a name is the only required field. */
export const NameOnly: Story = {
  args: { title: undefined, company: undefined, tagline: undefined },
}

/** A deck of cards, which is where the product metaphor comes from. */
export const Deck: Story = {
  render: (args) => (
    <Stack direction="row" gap={16} wrap>
      <MeetCard {...args} />
      <MeetCard
        {...args}
        tone="paper"
        name="Grace Hopper"
        title="Principal Engineer"
        tagline="Ship it, then measure."
      />
    </Stack>
  ),
}
