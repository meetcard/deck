import type { Meta, StoryObj } from '@storybook/react-vite'
import { MyCards } from './MyCards'

const meta = {
  component: MyCards,
  title: 'Experience/Application/My Cards',
  tags: ['page'],
} satisfies Meta<typeof MyCards>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
