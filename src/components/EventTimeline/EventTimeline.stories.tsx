import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { EventTimeline } from './EventTimeline'

/** A season of events either side of `today`, as a person accumulates them. */
const events = [
  {
    id: 'saastr-annual',
    name: 'SaaStr Annual',
    date: '2027-09-09',
    location: 'San Francisco, CA',
  },
  {
    id: 'founders-dinner',
    name: 'Founders Dinner',
    date: '2027-11-12',
    location: 'Denver, CO',
  },
  {
    id: 'revops-summit',
    name: 'RevOps Summit',
    date: '2028-01-22',
    location: 'Chicago, IL',
  },
]

const meta = {
  component: EventTimeline,
  title: 'Build/Molecules/EventTimeline',
  tags: ['molecule'],
  args: {
    events,
    // Pinned rather than left to the clock, so "past" and "still to come"
    // mean the same thing in this story next year as they do today.
    today: '2027-12-01',
    defaultValue: 'founders-dinner',
    locale: 'en-US',
    onValueChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 720 }}>
      <EventTimeline {...args} />
    </div>
  ),
} satisfies Meta<typeof EventTimeline>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The line as it reads mid-season: two events behind, one still ahead, and
 * the most recent one selected.
 */
export const Default: Story = {
  play: async ({ canvas }) => {
    const selected = canvas.getByRole('radio', { name: /Founders Dinner/ })
    await expect(selected).toBeChecked()

    // State is spelled out, not left to the dot's colour.
    await expect(
      canvas.getByRole('radio', { name: /SaaStr Annual\s*\(past\)/ }),
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole('radio', { name: /RevOps Summit\s*\(still to come\)/ }),
    ).toBeInTheDocument()
  },
}

/** Every event still ahead — a calendar filled in before anyone was met. */
export const AllUpcoming: Story = {
  args: { today: '2027-01-01', defaultValue: 'saastr-annual' },
}

/** A line long enough that the labels have to share the width. */
export const ManyEvents: Story = {
  args: {
    defaultValue: 'seed-night',
    events: [
      { id: 'devday', name: 'DevDay', date: '2027-06-02', location: 'Portland, OR' },
      ...events.slice(0, 2),
      { id: 'seed-night', name: 'Seed Night', date: '2027-11-30', location: 'Boulder, CO' },
      ...events.slice(2),
      { id: 'ops-forum', name: 'Ops Forum', date: '2028-03-04', location: 'Toronto, ON' },
    ],
  },
}

/** Picking an event reports the new selection. */
export const SelectingAnEvent: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('radio', { name: /RevOps Summit/ }))
    await expect(args.onValueChange).toHaveBeenCalledWith('revops-summit')
    await expect(
      canvas.getByRole('radio', { name: /RevOps Summit/ }),
    ).toBeChecked()
  },
}

/** Arrow keys walk the line — it is a radio group, so this comes for free. */
export const KeyboardWalksTheLine: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab()
    await expect(
      canvas.getByRole('radio', { name: /Founders Dinner/ }),
    ).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    await expect(args.onValueChange).toHaveBeenCalledWith('revops-summit')
    await expect(
      canvas.getByRole('radio', { name: /RevOps Summit/ }),
    ).toHaveFocus()
  },
}

/**
 * Phone. Three labels side by side on a 375px screen are unreadable, so the
 * line collapses to its dots — tapped like pagination — with the selected
 * event named in full underneath. The labels stay in the accessibility tree,
 * since they are what give each dot its name.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobileS' } },
  parameters: { chromatic: { viewports: [375] } },
  render: (args) => <EventTimeline {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Named for a screen reader, off-screen for everyone else. Clipped
    // rather than `display: none`, which is the difference that keeps the
    // name — so the test is the clip, not visibility.
    await expect(
      canvas.getByRole('radio', { name: /SaaStr Annual/ }),
    ).toBeInTheDocument()
    const text = canvasElement.querySelector<HTMLElement>(
      '.deck-event-timeline__text',
    )!
    await expect(text.offsetWidth).toBe(1)

    // The selected event, said where there is room to say it.
    const current = canvasElement.querySelector('.deck-event-timeline__current')!
    await expect(current).toBeVisible()
    await expect(current).toHaveTextContent('Founders Dinner')

    // The line itself is gone; the dots are all that is left.
    const track = canvasElement.querySelector('.deck-event-timeline__track')!
    await expect(getComputedStyle(track).display).toBe('flex')

    // Tapping a dot is what moves the line here, and the summary follows.
    await userEvent.click(canvas.getByRole('radio', { name: /RevOps Summit/ }))
    await expect(current).toHaveTextContent('RevOps Summit')
  },
}
