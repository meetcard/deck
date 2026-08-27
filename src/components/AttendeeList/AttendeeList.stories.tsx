import type { Meta, StoryObj } from '@storybook/react-vite'
import { AttendeeList } from './AttendeeList'

const meta = {
  component: AttendeeList,
  tags: ['molecule'],
} satisfies Meta<typeof AttendeeList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    attendees: [
      {
        name: 'Ben Ackles',
        role: 'Product Marketing',
        company: 'MeetCard',
        companyHref: '/companies/meetcard',
        href: '/ben',
      },
    ],
  },
}

export const MultipleAttendees: Story = {
  args: {
    attendees: [
      {
        name: 'Ada Lovelace',
        role: 'Head of Partnerships',
        company: 'MeetCard',
        companyHref: '/companies/meetcard',
        href: '/ada',
      },
      {
        name: 'Priya Shah',
        role: 'Sales',
        company: 'MeetCard',
        companyHref: '/companies/meetcard',
        href: '/priya',
      },
      { name: 'Jordan Reyes', role: 'Founder', company: 'Acme Robotics' },
    ],
  },
}

/** Attendees without a profile link render as plain, non-interactive rows. */
export const WithoutLinks: Story = {
  args: {
    attendees: [{ name: 'Jordan Reyes', role: 'Founder', company: 'Acme Robotics' }],
  },
}
