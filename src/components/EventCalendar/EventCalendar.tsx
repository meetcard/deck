import { cx } from '../../lib/cx'
import { IconButton } from '../IconButton/IconButton'
import './EventCalendar.css'

export type EventCalendarDateStatus = 'upcoming' | 'past'

export interface EventCalendarMarkedDate {
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  /** Drives the marker color in the legend and on the day cell. */
  status: EventCalendarDateStatus
}

export interface EventCalendarProps {
  /** ISO month, `YYYY-MM`, the calendar currently displays. */
  month: string
  onMonthChange?: (month: string) => void
  /** Days carrying an event. Only these are selectable. */
  markedDates: EventCalendarMarkedDate[]
  /** ISO date of the selected day. */
  value?: string
  onChange?: (date: string) => void
  /** ISO date rendered with a "Today" marker. */
  today?: string
  locale?: string
  className?: string
}

const PrevIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M10 3l-5 5 5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const NextIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 3l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function parseISODate(date: string) {
  return new Date(`${date}T12:00:00`)
}

function toISODate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Sunday-first short weekday labels, e.g. "Su". Reference week is a known Sunday. */
function weekdayLabels(locale?: string) {
  const reference = new Date(2023, 0, 1) // a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(reference)
    date.setDate(reference.getDate() + i)
    return date.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2)
  })
}

interface DayCell {
  date: string
  day: number
  inMonth: boolean
}

function buildGrid(month: string): DayCell[] {
  const [year, m] = month.split('-').map(Number)
  const monthIndex = m - 1
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

  const cells: DayCell[] = []

  for (let i = firstWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const [py, pm] = shiftMonth(month, -1).split('-').map(Number)
    cells.push({ date: toISODate(py, pm - 1, day), day, inMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: toISODate(year, monthIndex, day), day, inMonth: true })
  }

  const remainder = cells.length % 7
  if (remainder > 0) {
    const trailing = 7 - remainder
    const [ny, nm] = shiftMonth(month, 1).split('-').map(Number)
    for (let day = 1; day <= trailing; day++) {
      cells.push({ date: toISODate(ny, nm - 1, day), day, inMonth: false })
    }
  }

  return cells
}

/**
 * A month calendar surfacing which days carry an event, for an events
 * index. Only marked days are selectable — the grid is a filter, not a
 * general-purpose date picker, so a person can't pick their way into an
 * empty day.
 *
 * @example
 * <EventCalendar
 *   month="2026-07"
 *   onMonthChange={setMonth}
 *   value={selected}
 *   onChange={setSelected}
 *   today="2026-07-21"
 *   markedDates={[
 *     { date: '2026-07-21', status: 'past' },
 *     { date: '2026-08-04', status: 'upcoming' },
 *   ]}
 * />
 */
export function EventCalendar({
  month,
  onMonthChange,
  markedDates,
  value,
  onChange,
  today,
  locale,
  className,
}: EventCalendarProps) {
  const markedByDate = new Map(markedDates.map((m) => [m.date, m.status]))
  const cells = buildGrid(month)
  const heading = parseISODate(`${month}-01`).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={cx('deck-event-calendar', className)}>
      <div className="deck-event-calendar__header">
        <IconButton
          label="Previous month"
          icon={<PrevIcon />}
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange?.(shiftMonth(month, -1))}
        />
        <span className="deck-event-calendar__heading" aria-live="polite">
          {heading}
        </span>
        <IconButton
          label="Next month"
          icon={<NextIcon />}
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange?.(shiftMonth(month, 1))}
        />
      </div>

      <table className="deck-event-calendar__grid">
        <caption className="deck-visually-hidden">{heading}</caption>
        <thead>
          <tr>
            {weekdayLabels(locale).map((label, i) => (
              <th key={i} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }, (_, week) => (
            <tr key={week}>
              {cells.slice(week * 7, week * 7 + 7).map((cell) => {
                const status = markedByDate.get(cell.date)
                const isSelected = value === cell.date
                const isToday = today === cell.date

                return (
                  <td key={cell.date}>
                    <button
                      type="button"
                      className={cx(
                        'deck-event-calendar__day',
                        !cell.inMonth && 'deck-event-calendar__day--outside',
                        isSelected && 'deck-event-calendar__day--selected',
                      )}
                      disabled={!status}
                      aria-pressed={status ? isSelected : undefined}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => status && onChange?.(cell.date)}
                    >
                      {cell.day}
                      {status && (
                        <span
                          className={cx(
                            'deck-event-calendar__dot',
                            `deck-event-calendar__dot--${status}`,
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="deck-event-calendar__legend">
        <span className="deck-event-calendar__legend-item">
          <span className="deck-event-calendar__dot deck-event-calendar__dot--upcoming" aria-hidden="true" />
          Upcoming
        </span>
        <span className="deck-event-calendar__legend-item">
          <span className="deck-event-calendar__dot deck-event-calendar__dot--past" aria-hidden="true" />
          Past
        </span>
      </div>
    </div>
  )
}
