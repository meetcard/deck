import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Input } from '../Input/Input'
import { Text } from '../Text/Text'
import { ReorderList } from './ReorderList'

const CTAS = [
  { id: 'book', label: 'Book a time', href: 'meetcard.io/ben/book' },
  { id: 'site', label: 'Website', href: 'meetcard.io' },
  { id: 'save', label: 'Save contact', href: 'meetcard.io/ben.vcf' },
]

/**
 * Every story wires the list to state, because a list that cannot be
 * reordered is not this component.
 *
 * Note what is *not* here: `items` is never passed through `args`. Its rows
 * carry React elements, and Storybook prints a story's args as source —
 * printing an element walks into the fiber it belongs to and the printer
 * runs out of string. So the args stay empty and each render builds its own
 * rows.
 */
function useCtas() {
  const [order, setOrder] = useState(CTAS)
  const reorder = (ids: string[]) =>
    setOrder(ids.map((id) => order.find((cta) => cta.id === id)!))
  return [order, reorder] as const
}

const meta = {
  component: ReorderList,
  title: 'Build/Molecules/ReorderList',
  tags: ['molecule'],
  args: { label: 'Calls to action', items: [], onReorder: () => {} },
  render: function Wired() {
    const [order, reorder] = useCtas()
    return (
      <div style={{ maxWidth: 520 }}>
        <ReorderList
          label="Calls to action"
          onReorder={reorder}
          items={order.map((cta) => ({
            id: cta.id,
            label: cta.label,
            content: (
              <Text as="span" size="sm">
                {cta.label}
              </Text>
            ),
          }))}
        />
      </div>
    )
  },
} satisfies Meta<typeof ReorderList>

export default meta
type Story = StoryObj<typeof meta>

/** Three rows in the order they will appear on the card. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('list', { name: 'Calls to action' }),
    ).toBeInTheDocument()
    await expect(
      canvas.getByRole('button', { name: 'Reorder Book a time' }),
    ).toBeVisible()
  },
}

/**
 * The keyboard path, which is the one that has to work. Focus a handle and
 * the arrow keys move its row — and focus rides along with it, so a second
 * press moves the same row again rather than whatever took its place.
 */
export const MovingWithTheKeyboard: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const order = () =>
      [...canvasElement.querySelectorAll('.deck-reorder-list__item')].map(
        (item) => item.textContent,
      )
    await expect(order()).toEqual(['Book a time', 'Website', 'Save contact'])

    const handle = canvas.getByRole('button', { name: 'Reorder Book a time' })
    handle.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(order()).toEqual(['Website', 'Book a time', 'Save contact'])

    // Still holding the same row.
    await expect(handle).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(order()).toEqual(['Website', 'Save contact', 'Book a time'])

    // And it stops at the end rather than wrapping to the top.
    await userEvent.keyboard('{ArrowDown}')
    await expect(order()).toEqual(['Website', 'Save contact', 'Book a time'])
  },
}

/**
 * Rows whose contents are set on another screen. They still move — where a
 * button sits on your card is your decision even when what it says is not —
 * so the read-only fields are the caller's business and the handle stays.
 */
export const WithReadOnlyFields: Story = {
  render: function ReadOnly() {
    const [order, reorder] = useCtas()
    return (
      <div style={{ maxWidth: 520 }}>
        <ReorderList
          label="Calls to action"
          onReorder={reorder}
          items={order.map((cta) => ({
            id: cta.id,
            label: cta.label,
            content: (
              <>
                <Input
                  label={`${cta.label} label`}
                  hideLabel
                  size="sm"
                  readOnly={cta.id === 'book'}
                  defaultValue={cta.label}
                />
                <Input
                  label={`${cta.label} link`}
                  hideLabel
                  size="sm"
                  readOnly={cta.id === 'book'}
                  defaultValue={cta.href}
                />
              </>
            ),
          }))}
        />
      </div>
    )
  },
  play: async ({ canvas, userEvent }) => {
    // Read-only content, movable row.
    await expect(
      canvas.getByRole('textbox', { name: 'Book a time label' }),
    ).toHaveAttribute('readonly')

    canvas.getByRole('button', { name: 'Reorder Book a time' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(
      canvas.getByRole('button', { name: 'Reorder Book a time' }),
    ).toHaveFocus()
  },
}
