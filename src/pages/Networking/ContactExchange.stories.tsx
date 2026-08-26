import type { Meta, StoryObj } from '@storybook/react-vite'
import { ContactExchange } from './ContactExchange'

const meta = {
  component: ContactExchange,
  title: 'App/Networking/Contact Exchange',
  tags: ['page'],
} satisfies Meta<typeof ContactExchange>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
