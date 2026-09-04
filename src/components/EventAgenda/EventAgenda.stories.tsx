import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { EventAgenda } from './EventAgenda'
import type { AgendaEvent } from './EventAgenda'

const EVENTS: AgendaEvent[] = [
  {
    id: 'revops',
    name: 'RevOps Summit',
    date: '2027-05-18',
    time: '9:00 AM',
    location: 'Austin Convention Center',
    host: 'Hannah Davis',
    href: '/events/revops',
    theme: { primary: '#2E6E5B', accent: '#C66A4A' },
    involvement: 'Attending',
    flag: 'Soon',
    exchangedCount: 5,
    attendees: [
      { name: 'Hannah Davis' },
      { name: 'Marcus Lee' },
      { name: 'Priya Shah' },
      { name: 'Diego Romero' },
      { name: 'Lena Fox' },
    ],
  },
  {
    id: 'climate',
    name: 'Boulder Climate Happy Hour',
    date: '2027-06-16',
    time: '5:30 PM',
    location: 'Rayback Collective',
    host: 'Hannah Davis',
    href: '/events/climate',
    theme: { primary: '#3F5E4E', accent: '#E0A458' },
    involvement: 'Hosting',
    exchangedCount: 4,
    attendees: [
      { name: 'Mira Okafor' },
      { name: 'Theo Marsh' },
      { name: 'June Park' },
      { name: 'Sam Ortiz' },
    ],
  },
  {
    id: 'saastr',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    time: '10:00 AM',
    location: 'Moscone West',
    host: 'SaaStr',
    href: '/events/saastr',
    theme: { primary: '#2F4858', accent: '#7FA9C4' },
    involvement: 'Speaking',
    exchangedCount: 7,
    attendees: [
      { name: 'Ada Chen' },
      { name: 'Omar Haddad' },
      { name: 'Nia Quinn' },
      { name: 'Ana Blum' },
      { name: 'Dev Patel' },
      { name: 'Rosa Lim' },
      { name: 'Kit Vance' },
    ],
  },
]

const meta = {
  component: EventAgenda,
  title: 'Build/Organisms/EventAgenda',
  tags: ['organism'],
  args: { events: EVENTS },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <EventAgenda {...args} />
    </div>
  ),
} satisfies Meta<typeof EventAgenda>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // The name is the link, not the row.
    await expect(
      canvas.getByRole('link', { name: 'RevOps Summit' }),
    ).toHaveAttribute('href', '/events/revops')
    // The day carries the machine-readable date; the clock time is a display
    // string, because an event happens at nine in the morning where it is.
    await expect(canvas.getByText('May 18').closest('time')).toHaveAttribute(
      'dateTime',
      '2027-05-18',
    )
  },
}

/** Two events on one date gather under a single day heading. */
export const TwoOnADay: Story = {
  args: {
    events: [
      EVENTS[0],
      {
        id: 'revops-dinner',
        name: 'RevOps After Hours',
        date: '2027-05-18',
        time: '7:00 PM',
        location: 'Cedar & Vine',
        host: 'Marcus Lee',
        href: '/events/revops-dinner',
        involvement: 'Attending',
      },
      EVENTS[1],
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('May 18')).toHaveLength(1)
  },
}

/** Nothing exchanged yet, nowhere to be, no picture — the bare row. */
export const Sparse: Story = {
  args: {
    events: [
      {
        id: 'tbd',
        name: 'Product Camp Rockies',
        date: '2027-02-11',
        time: '8:30 AM',
      },
    ],
  },
}

/** Events already behind you, where the cards are the point. */
export const Past: Story = {
  args: {
    events: [
      {
        id: 'design-week',
        name: 'Denver Design Week Mixer',
        date: '2027-03-04',
        time: '6:00 PM',
        location: 'Union Hall',
        host: 'AIGA Colorado',
        href: '/events/design-week',
        theme: { primary: '#4A3B5C', accent: '#C9A227' },
        involvement: 'Attended',
        exchangedCount: 7,
        attendees: [
          { name: 'Sam Ortiz' },
          { name: 'Pia Rossi' },
          { name: 'Ana Blum' },
          { name: 'Marcus Lee' },
          { name: 'Dev Patel' },
          { name: 'Rosa Lim' },
          { name: 'Kit Vance' },
        ],
      },
    ],
  },
}

/** Phone. The badges drop under the name rather than truncating it. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => <EventAgenda {...args} />,
}
