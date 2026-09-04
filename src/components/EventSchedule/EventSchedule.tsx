import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './EventSchedule.css'

export interface EventScheduleSlot {
  /**
   * The clock time as it should read — "9:00 AM". A string rather than a
   * parsed value, for the reason `EventAgenda` gives: doors open at nine in
   * the morning where the doors are.
   */
  time: string
  title: string
  /** A second line, for a room or a speaker. */
  description?: string
}

export interface EventScheduleProps
  extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  slots: EventScheduleSlot[]
  /** Names the list. Defaults to "Schedule". */
  label?: string
}

/**
 * How a day runs — the times and what happens at them.
 *
 * An ordered list, because the order is the content: these are the same hours
 * in the same sequence for everyone in the room, and a screen reader saying
 * "3 of 5" is telling you where in the day you are.
 *
 * Deliberately plain. `EventTimeline` draws a line through *events*, where
 * the gaps between them are months and worth seeing; within one day the gaps
 * are an hour here and ninety minutes there, and drawing them to scale would
 * turn lunch into the largest thing on the page.
 *
 * @example
 * <EventSchedule
 *   slots={[
 *     { time: '9:00 AM', title: 'Doors and coffee' },
 *     { time: '10:00 AM', title: 'Keynote: Pipeline you can trust' },
 *   ]}
 * />
 */
export function EventSchedule({
  slots,
  label = 'Schedule',
  className,
  ...props
}: EventScheduleProps) {
  return (
    <ol
      className={cx('deck-event-schedule', className)}
      aria-label={label}
      {...props}
    >
      {slots.map((slot, index) => (
        <li key={`${slot.time}-${index}`} className="deck-event-schedule__slot">
          <span className="deck-event-schedule__time">{slot.time}</span>
          <span className="deck-event-schedule__text">
            <span className="deck-event-schedule__title">{slot.title}</span>
            {slot.description ? (
              <span className="deck-event-schedule__description">
                {slot.description}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
