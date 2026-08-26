import { useId } from 'react'
import { cx } from '../../lib/cx'
import './DayStrip.css'

export interface DayOption {
  /** ISO date, `YYYY-MM-DD`. Also the value passed to `onChange`. */
  date: string
  /**
   * How many slots are free. `0` renders the day unselectable, so a person
   * never picks a day only to find it empty.
   */
  slotCount: number
}

export interface DayStripProps {
  label?: string
  days: DayOption[]
  /** ISO date of the selected day. */
  value?: string
  onChange?: (date: string) => void
  /** IANA zone the days are expressed in, shown alongside the label. */
  timeZone?: string
  /** ISO date rendered with a "Today" marker. */
  today?: string
  locale?: string
  className?: string
}

const WEEKDAY = { weekday: 'short' } as const
const DAY = { day: 'numeric' } as const
const MONTH = { month: 'short' } as const

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function parseISODate(date: string) {
  return new Date(`${date}T12:00:00`)
}

/**
 * Horizontal day picker for a booking flow's availability step.
 *
 * Each day carries how many slots are free, so the choice is informed before
 * it is made — a day with two openings looks different from one with twelve,
 * and a full day is disabled rather than a dead end. Month changes are
 * labelled inline so a strip spanning a boundary stays legible.
 *
 * Renders as a radio group: arrow keys move along the strip, and the
 * selection is announced with its date and availability.
 *
 * @example
 * <DayStrip
 *   value={day}
 *   onChange={setDay}
 *   today="2026-09-01"
 *   timeZone="America/Denver"
 *   days={[
 *     { date: '2026-09-01', slotCount: 6 },
 *     { date: '2026-09-02', slotCount: 0 },
 *   ]}
 * />
 */
export function DayStrip({
  label = 'Pick a day',
  days,
  value,
  onChange,
  timeZone,
  today,
  locale,
  className,
}: DayStripProps) {
  const name = useId()

  return (
    <fieldset className={cx('deck-day-strip', className)}>
      <div className="deck-day-strip__header">
        <legend className="deck-day-strip__legend">{label}</legend>
        {timeZone && (
          <span className="deck-day-strip__zone">{timeZone}</span>
        )}
      </div>

      <div className="deck-day-strip__track">
        {days.map((day, index) => {
          const parsed = parseISODate(day.date)
          const id = `${name}-${day.date}`
          const isToday = day.date === today
          const full = day.slotCount === 0
          // Label the month on the first chip and again whenever it changes,
          // so a strip crossing a boundary doesn't read as one long month.
          const previous = index > 0 ? parseISODate(days[index - 1].date) : null
          const showMonth =
            index === 0 || (previous && previous.getMonth() !== parsed.getMonth())

          return (
            <label key={day.date} className="deck-day-strip__day" htmlFor={id}>
              <input
                id={id}
                className="deck-visually-hidden deck-day-strip__input"
                type="radio"
                name={name}
                value={day.date}
                checked={value === day.date}
                disabled={full}
                onChange={() => onChange?.(day.date)}
              />
              <span className="deck-day-strip__control">
                <span className="deck-day-strip__weekday">
                  {parsed.toLocaleDateString(locale, WEEKDAY)}
                </span>
                <span className="deck-day-strip__date">
                  {parsed.toLocaleDateString(locale, DAY)}
                </span>
                {/*
                  Always rendered, hidden when the month repeats — an empty
                  box does not reliably hold the same height as a text one,
                  and the chips need a common baseline.
                */}
                <span
                  className={cx(
                    'deck-day-strip__month',
                    !showMonth && 'deck-day-strip__month--repeat',
                  )}
                >
                  {parsed.toLocaleDateString(locale, MONTH)}
                </span>
                {/*
                  Density is a glanceable summary, so it is drawn as up to
                  three dots; the exact count goes to screen readers below.
                */}
                <span className="deck-day-strip__density" aria-hidden="true">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={cx(
                        'deck-day-strip__dot',
                        day.slotCount >= step && 'deck-day-strip__dot--filled',
                      )}
                    />
                  ))}
                </span>
                <span className="deck-visually-hidden">
                  {isToday ? 'Today. ' : ''}
                  {full
                    ? 'No times available'
                    : `${day.slotCount} ${day.slotCount === 1 ? 'time' : 'times'} available`}
                </span>
                {isToday && (
                  <span className="deck-day-strip__today" aria-hidden="true" />
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
