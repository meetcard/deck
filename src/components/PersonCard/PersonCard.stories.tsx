import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { IconButton } from '../IconButton/IconButton'
import { Stack } from '../Stack/Stack'
import { PersonCard } from './PersonCard'

const MoreIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="3" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="13" cy="8" r="1.5" fill="currentColor" />
  </svg>
)

const meta = {
  component: PersonCard,
  args: {
    name: 'Ada Lovelace',
    title: 'Head of Partnerships',
    company: 'MeetCard',
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <PersonCard {...args} />
    </div>
  ),
} satisfies Meta<typeof PersonCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** With `href` the name becomes a link and the card gains hover affordance. */
export const Linked: Story = {
  args: { href: '/people/ada' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Ada Lovelace' }),
    ).toHaveAttribute('href', '/people/ada')
  },
}

export const WithStatus: Story = {
  args: { status: { label: 'Connected', tone: 'success' } },
}

export const WithMeta: Story = {
  args: { meta: 'Met at SaaSConf · 3 days ago' },
}

export const WithActions: Story = {
  args: {
    actions: <IconButton label="More actions" icon={<MoreIcon />} size="sm" />,
  },
}

/** Long names truncate rather than breaking the card's layout. */
export const LongName: Story = {
  args: {
    name: 'Augusta Ada King-Noel, Countess of Lovelace',
    title: 'Head of Strategic Partnerships and Developer Relations',
  },
}

/** A scannable list — the surface `PersonCard` is designed for. */
export const InAList: Story = {
  render: (args) => (
    <Stack as="ul" gap={12} style={{ maxWidth: 420 }}>
      <li>
        <PersonCard {...args} status={{ label: 'Connected', tone: 'success' }} />
      </li>
      <li>
        <PersonCard
          {...args}
          name="Grace Hopper"
          title="Principal Engineer"
          status={{ label: 'Pending', tone: 'warning' }}
        />
      </li>
      <li>
        <PersonCard {...args} name="Katherine Johnson" title="Mathematician" />
      </li>
    </Stack>
  ),
}
