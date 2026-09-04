import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AvatarStack } from './AvatarStack'

const PEOPLE = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Lee' },
  { name: 'Priya Shah' },
  { name: 'Diego Romero' },
  { name: 'Lena Fox' },
]

const meta = {
  component: AvatarStack,
  title: 'Build/Molecules/AvatarStack',
  tags: ['molecule'],
  args: { people: PEOPLE },
} satisfies Meta<typeof AvatarStack>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // Overlapping is a way of drawing a group, not a reason to stop naming
    // its members — every face keeps its own accessible name.
    await expect(canvas.getByRole('img', { name: 'Hannah Davis' })).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
  },
}

/** The line the stack usually earns its place next to. */
export const WithCaption: Story = {
  args: { caption: '5 cards exchanged' },
}

/** Past `max`, the rest collapse into a chip that says how many. */
export const Overflowing: Story = {
  args: {
    people: [...PEOPLE, { name: 'Omar Haddad' }, { name: 'Nia Quinn' }],
    caption: '7 cards exchanged',
  },
  play: async ({ canvas }) => {
    // "+2" on screen, "2 more" to a screen reader.
    await expect(canvas.getByText('+2')).toBeVisible()
    await expect(canvas.getByText('2 more')).toBeInTheDocument()
  },
}

/** Every size, so the overlap can be judged against the monograms it hides. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <AvatarStack {...args} size="xs" caption="Extra small" />
      <AvatarStack {...args} size="sm" caption="Small" />
      <AvatarStack {...args} size="md" caption="Medium" />
    </div>
  ),
}

/**
 * On a surface other than the elevated one, the ring has to be re-pointed at
 * whatever is actually behind it.
 */
export const OnASubtleSurface: Story = {
  args: { caption: '5 cards exchanged' },
  render: (args) => (
    <div
      style={{
        padding: 20,
        borderRadius: 12,
        backgroundColor: 'var(--deck-color-background-subtle)',
        ['--deck-avatar-stack-ring' as string]:
          'var(--deck-color-background-subtle)',
      }}
    >
      <AvatarStack {...args} />
    </div>
  ),
}
