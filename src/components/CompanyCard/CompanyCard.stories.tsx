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
