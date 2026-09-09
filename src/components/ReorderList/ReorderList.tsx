import { forwardRef, useId, useState } from 'react'
import type { DragEvent, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './ReorderList.css'

export interface ReorderListItem {
  /** Stable key, and what `onReorder` reports. */
  id: string
  /** Names the row in its handle and in what gets announced when it moves. */
  label: string
  /** The row itself — inputs, text, whatever the list is of. */
  content: ReactNode
}

export interface ReorderListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onDrop'> {
  items: ReorderListItem[]
  /** Fires with the full order, top to bottom, after any move. */
  onReorder: (ids: string[]) => void
  /** Accessible name for the list, e.g. "Calls to action". */
  label: string
}

const GripIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    {[4, 8, 12].map((y) =>
      [6, 10].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="currentColor" />
      )),
    )}
  </svg>
)

/** The order with `from` lifted out and dropped at `to`. */
function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items]
  const [lifted] = next.splice(from, 1)
  next.splice(to, 0, lifted)
  return next
}

/**
 * A short list whose order is the point — the buttons on a card, the steps of
 * a flow — reorderable by dragging *or* by keyboard.
 *
 * Dragging is the discoverable way and it is not the only way. A grip you can
 * only drag is a control that does not exist for anyone using a keyboard, and
 * "drag to reorder" is the most common place a settings page quietly stops
 * being operable. So the handle is a real button: focus it and Arrow Up or
 * Arrow Down moves its row, one position per press, with the new position
 * announced. Focus rides along with the row it belongs to, because the
 * element is keyed by id and React moves the node rather than rebuilding it.
 *
 * Every row can move. A row whose *contents* are decided elsewhere — a
 * button whose label is set on another screen — is still a row you can put
 * where you like; that is the caller's business to render read-only, not
 * this list's business to pin.
 *
 * Built for a handful of rows. Past ten or so, ordering wants a different
 * instrument — a sort, or a number you type.
 *
 * @example
 * <ReorderList
 *   label="Calls to action"
 *   items={ctas.map((c) => ({ id: c.id, label: c.label, content: <CtaFields {...c} /> }))}
 *   onReorder={(ids) => setOrder(ids)}
 * />
 */
export const ReorderList = forwardRef<HTMLUListElement, ReorderListProps>(
  function ReorderList({ items, onReorder, label, className, ...props }, ref) {
    const hintId = useId()
    const [dragging, setDragging] = useState<string | null>(null)
    /* What was last moved and where it landed. Kept in state rather than
       written straight to the DOM so the live region only ever announces a
       move a person actually made. */
    const [announcement, setAnnouncement] = useState('')

    function reorder(from: number, to: number) {
      const item = items[from]
      if (!item || to < 0 || to >= items.length) return

      onReorder(move(items, from, to).map((one) => one.id))
      setAnnouncement(`${item.label}, position ${to + 1} of ${items.length}`)
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        reorder(index, index - 1)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        reorder(index, index + 1)
      }
    }

    function handleDrop(event: DragEvent<HTMLLIElement>, index: number) {
      event.preventDefault()
      const from = items.findIndex((one) => one.id === dragging)
      setDragging(null)
      if (from >= 0 && from !== index) reorder(from, index)
    }

    return (
      <>
        <ul
          ref={ref}
          className={cx('deck-reorder-list', className)}
          aria-label={label}
          {...props}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              className={cx(
                'deck-reorder-list__item',
                dragging === item.id && 'deck-reorder-list__item--dragging',
              )}
              draggable
              onDragStart={() => setDragging(item.id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
            >
              <button
                type="button"
                className="deck-reorder-list__handle"
                aria-label={`Reorder ${item.label}`}
                aria-describedby={hintId}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <GripIcon />
              </button>

              <div className="deck-reorder-list__content">{item.content}</div>
            </li>
          ))}
        </ul>

        {/* Named by every handle, so the way to move a row without a mouse
            is announced with the control rather than left to be discovered. */}
        <p id={hintId} className="deck-visually-hidden">
          Press the up and down arrow keys to move this row.
        </p>

        <p aria-live="polite" className="deck-visually-hidden">
          {announcement}
        </p>
      </>
    )
  },
)
