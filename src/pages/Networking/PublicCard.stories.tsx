import type { Meta, StoryObj } from '@storybook/react-vite'
import { PublicCard } from './PublicCard'

const meta = {
  component: PublicCard,
  title: 'Experience/Networking/Public Card',
  tags: ['page'],
} satisfies Meta<typeof PublicCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
