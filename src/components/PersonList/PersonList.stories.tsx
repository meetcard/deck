import type { Meta, StoryObj } from '@storybook/react-vite'
import { PersonList } from './PersonList'

const meta = {
  component: PersonList,
  title: 'Build/Molecules/PersonList',
  tags: ['molecule'],
} satisfies Meta<typeof PersonList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: "Who's attending",
    people: [
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

export const MultiplePeople: Story = {
  args: {
    label: "Who's attending",
    people: [
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

/** People without a profile link render as plain, non-interactive rows. */
export const WithoutLinks: Story = {
  args: {
    label: "Who's attending",
    people: [{ name: 'Jordan Reyes', role: 'Founder', company: 'Acme Robotics' }],
  },
}

/**
 * The same rows as a roster of people you have met rather than people who are
 * coming. `meta` carries the one fact that makes a recent connection worth
 * looking at — how long ago — and `label` is what says which list this is.
 */
export const RecentConnections: Story = {
  args: {
    label: 'Recent connections',
    people: [
      {
        name: 'Ben Ackles',
        role: 'Head of Product',
        company: 'MeetCard',
        href: '/connections',
        meta: '2h',
      },
      {
        name: 'Priya Shah',
        role: 'VP Sales',
        company: 'Northwind',
        href: '/connections',
        meta: 'Yesterday',
      },
      {
        name: 'Marcus Liu',
        role: 'Founder',
        company: 'Loop CRM',
        href: '/connections',
        meta: 'Mon',
      },
    ],
  },
}
