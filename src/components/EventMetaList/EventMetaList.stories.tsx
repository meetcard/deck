import type { Meta, StoryObj } from '@storybook/react-vite'
import { EventMetaList } from './EventMetaList'

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" strokeLinecap="round" />
  </svg>
)

const PinIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M8 14.5S13 9.9 13 6.5a5 5 0 0 0-10 0c0 3.4 5 8 5 8Z" strokeLinejoin="round" />
    <circle cx="8" cy="6.5" r="1.8" />
  </svg>
)

const PeopleIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
    <circle cx="6" cy="6" r="2.3" />
    <path d="M1.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" strokeLinecap="round" />
    <path d="M10.5 3.6a2.3 2.3 0 0 1 0 4.6M14.5 14c0-2.1-1.6-3.5-3.5-3.9" strokeLinecap="round" />
  </svg>
)

const meta = {
  component: EventMetaList,
  title: 'Build/Molecules/EventMetaList',
  tags: ['molecule'],
} satisfies Meta<typeof EventMetaList>

export default meta
type Story = StoryObj<typeof meta>

export const MultiDayEvent: Story = {
  args: {
    items: [
      { icon: <CalendarIcon />, label: 'Dates', value: 'May 4–8, 2026' },
      { icon: <PinIcon />, label: 'Location', value: 'Boulder, Colorado' },
      { icon: <PeopleIcon />, label: 'Attendees', value: '1 attending' },
    ],
  },
}

export const SingleDayEvent: Story = {
  args: {
    items: [
      { icon: <CalendarIcon />, label: 'Date', value: 'Tue, Jul 21, 2026' },
      { icon: <CalendarIcon />, label: 'Time', value: '5:30 PM – 7:00 PM' },
      { icon: <PinIcon />, label: 'Location', value: 'Number Thirty Eight, Denver' },
    ],
  },
}

export const WithoutIcons: Story = {
  args: {
    items: [
      { label: 'Dates', value: 'May 4–8, 2026' },
      { label: 'Location', value: 'Boulder, Colorado' },
    ],
  },
}
