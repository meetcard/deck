import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { AvatarGroup } from './AvatarGroup'

const people = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Lee' },
  { name: 'Priya Shah' },
  { name: 'Diego Romero' },
  { name: 'Lena Fox' },
]

const meta = {
  component: AvatarGroup,
  title: 'Build/Molecules/AvatarGroup',
  tags: ['molecule'],
  args: { people, label: 'Cards exchanged' },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Five people, five faces — the stack still reads as individuals. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('list', { name: 'Cards exchanged' }),
    ).toBeInTheDocument()
    // Named, not decorated with a `title` nobody hears.
    await expect(
      canvas.getByRole('img', { name: 'Hannah Davis' }),
    ).toBeInTheDocument()
  },
}

/**
 * Past `max` the rest become a count. The number is text, so it is never
 * only in the geometry of the stack.
 */
export const WithOverflow: Story = {
  args: { max: 3 },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('img')).toHaveLength(3)
    await expect(canvas.getByText('and 2 more')).toBeInTheDocument()
  },
}

/** Bigger faces, for a page that is about the people rather than the row. */
export const Large: Story = {
  args: { size: 'md', max: 4 },
}

/**
 * On a surface that isn't the page. The ring each face carries is whatever
 * is behind the stack, so it is a variable rather than a fixed colour.
 */
export const OnATintedSurface: Story = {
  args: { max: 4 },
  render: (args) => (
    <div
      style={{
        background: 'var(--deck-color-background-brand-subtle)',
        padding: 'var(--deck-space-16)',
        borderRadius: 'var(--deck-radius-xl)',
        // @ts-expect-error -- a custom property is not in CSSProperties
        '--deck-avatar-group-ring': 'var(--deck-color-background-brand-subtle)',
      }}
    >
      <AvatarGroup {...args} />
    </div>
  ),
}

/** One person is still a group — the layout does not change shape. */
export const OnePerson: Story = {
  args: { people: people.slice(0, 1) },
}
