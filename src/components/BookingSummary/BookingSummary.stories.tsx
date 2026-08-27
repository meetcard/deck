import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { BookingSummary } from './BookingSummary'

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" />
    <path d="M2 6.5h12M5.5 2v3M10.5 2v3" />
  </svg>
)

const VideoIcon = () => (
  <svg {...iconProps}>
    <rect x="1.5" y="4" width="9" height="8" rx="1.5" />
    <path d="m10.5 8 4-2.5v5L10.5 8Z" />
  </svg>
)

const meta = {
  component: BookingSummary,
  title: 'Build/Molecules/BookingSummary',
  tags: ['molecule'],
  args: {
    items: [
      {
        icon: <CalendarIcon />,
        label: 'Thursday, September 3',
        detail: '9:30 AM · 30 min',
        onEdit: fn(),
        editLabel: 'Change date and time',
      },
      {
        icon: <VideoIcon />,
        label: 'Video call',
        detail: 'Link sent with your confirmation · America/Denver',
      },
    ],
  },
} satisfies Meta<typeof BookingSummary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** On the confirmation screen the recap is read-only — nothing left to edit. */
export const ReadOnly: Story = {
  args: {
    items: [
      {
        icon: <CalendarIcon />,
        label: 'Thursday, September 3',
        detail: '9:30 AM · 30 min',
      },
      {
        icon: <VideoIcon />,
        label: 'Video call',
        detail: 'Link sent with your confirmation · America/Denver',
      },
    ],
  },
}
