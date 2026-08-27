import type { Meta, StoryObj } from '@storybook/react-vite'
import { Leads } from './Leads'

const meta = {
  component: Leads,
  title: 'Experience/Application/Leads',
  tags: ['page'],
} satisfies Meta<typeof Leads>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
