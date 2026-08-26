import type { Meta, StoryObj } from '@storybook/react-vite'
import { Confirmation } from './Confirmation'

const meta = {
  component: Confirmation,
  title: 'App/Networking/Confirmation',
  tags: ['page'],
} satisfies Meta<typeof Confirmation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
