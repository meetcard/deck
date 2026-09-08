import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Badge } from '../Badge/Badge'
import { IconButton } from '../IconButton/IconButton'
import { CardIndex } from './CardIndex'

const PencilIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <path d="M11.5 2.5l2 2L6 12l-3 1 1-3z" strokeLinejoin="round" />
  </svg>
)

/** The cards from one evening, in the order they were handed over. */
const items = [
  { id: 'sam', name: 'Sam Ellery', detail: 'CEO at Trail & Co' },
  { id: 'omar', name: 'Omar Whitfield', detail: 'Operating Partner at Halden Group' },
  { id: 'nora', name: 'Nora Lindqvist', detail: 'Creative Director at Field Studio' },
]

const meta = {
  component: CardIndex,
  title: 'Build/Molecules/CardIndex',
  tags: ['molecule'],
  args: {
    items,
    label: 'Everyone from Founders Dinner',
    value: 'sam',
    onValueChange: fn(),
  },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <CardIndex {...args} />
    </div>
  ),
} satisfies Meta<typeof CardIndex>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Rows: who is in the pile and what they do. The card on top of the pile
 * stays in the list rather than being filtered out of it — so the list holds
 * still while you flip through, and doubles as "where am I".
 */
export const Default: Story = {
  args: { layout: 'rows' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('list', { name: 'Everyone from Founders Dinner' }),
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: /Sam Ellery/ }),
    ).toHaveAttribute('aria-current', 'true')
    await expect(canvas.getByText('Operating Partner at Halden Group')).toBeVisible()
  },
}

/** Picking someone asks for their card, by id. */
export const PickingSomeone: Story = {
  args: { layout: 'rows' },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Nora Lindqvist/ }))
    await expect(args.onValueChange).toHaveBeenCalledWith('nora')
  },
}

/**
 * Strip: faces, scrolled sideways. The index as a way back to a card rather
 * than something to read — so the titles come off and the faces get bigger.
 */
export const Strip: Story = {
  args: { layout: 'strip' },
  play: async ({ canvas, canvasElement }) => {
    const list = canvasElement.querySelector('.deck-card-index')!
    await expect(list).toHaveAttribute('data-layout', 'strip')

    // The full name is still the button's name, whatever the cell shows.
    await expect(
      canvas.getByRole('button', { name: 'Omar Whitfield' }),
    ).toBeInTheDocument()
    await expect(
      canvas.queryByText('Operating Partner at Halden Group'),
    ).not.toBeInTheDocument()
  },
}

/** A pile of one: the index has nothing to index, and says so by being one row. */
export const OneCard: Story = {
  args: { layout: 'rows', items: items.slice(0, 1) },
}

/**
 * Wired to a pile. This is the whole point of the component — the list is
 * the way back to a card you have already flipped past.
 */
export const SelectingKeepsTheListStill: Story = {
  args: { layout: 'rows' },
  render: function Wired(args) {
    const [value, setValue] = useState('sam')
    return (
      <div style={{ maxWidth: 420 }}>
        <CardIndex {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    /* Names, not whole rows: the current row also carries a "Showing"
       marker, and that is *supposed* to move. What must not move is who is
       in the list and in what order. */
    const names = () =>
      [...canvasElement.querySelectorAll('.deck-card-index__name')].map(
        (name) => name.textContent,
      )
    const before = names()

    await userEvent.click(canvas.getByRole('button', { name: /Omar Whitfield/ }))

    await expect(
      canvas.getByRole('button', { name: /Omar Whitfield/ }),
    ).toHaveAttribute('aria-current', 'true')
    // Nobody moved: the current card is marked, not removed.
    await expect(names()).toEqual(before)
  },
}

/**
 * A row can carry more than a name: a pill saying which kind of card it is,
 * and one control of its own.
 *
 * The control is a sibling of the selecting button rather than a child of
 * it — a button inside a button is not a thing a browser will render — so a
 * row can both "show this one" and "edit this one" without the two fighting
 * over the same click.
 */
export const WithBadgesAndActions: Story = {
  args: {
    layout: 'rows',
    label: 'All cards',
    value: 'sam',
    items: [
      {
        id: 'sam',
        name: 'Sam Ellery',
        detail: 'CEO at Trail & Co',
        badge: <Badge tone="neutral" size="sm">Business</Badge>,
        action: (
          <IconButton label="Edit business card" icon={<PencilIcon />} size="sm" />
        ),
      },
      {
        id: 'omar',
        name: 'Omar Whitfield',
        detail: 'Personal profile',
        badge: <Badge tone="neutral" size="sm">Personal</Badge>,
        action: (
          <IconButton label="Edit personal card" icon={<PencilIcon />} size="sm" />
        ),
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Business')).toBeVisible()

    // Two controls per row, and the edit one is not inside the select one.
    const edit = canvas.getByRole('button', { name: 'Edit business card' })
    const select = canvas.getByRole('button', { name: /Sam Ellery/ })
    await expect(select.contains(edit)).toBe(false)

    // Which one is showing, said in a word rather than only in a tint.
    await expect(canvas.getByText('Showing')).toBeVisible()
  },
}

/** The marker takes the page's own word for it. */
export const ANamedCurrentMarker: Story = {
  args: {
    layout: 'rows',
    value: 'omar',
    currentLabel: 'On top',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('On top')).toBeVisible()
  },
}
