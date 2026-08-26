import type { Meta, StoryObj } from '@storybook/react-vite'
import { Contacts } from './Contacts'

const meta = {
  component: Contacts,
  title: 'App/Application/Contacts',
  tags: ['page'],
} satisfies Meta<typeof Contacts>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
