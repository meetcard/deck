import { useId } from 'react'
import { cx } from '../../lib/cx'
import './TimeSlotPicker.css'

export interface TimeSlot {
  /** 24-hour `HH:mm`. Also the value passed to `onChange`. */
  time: string
  /** Marks a slot as taken. It stays visible so the day still reads as full. */
  taken?: boolean
}

export interface TimeSlotPickerProps {
  label?: string
  slots: TimeSlot[]
  /** `HH:mm` of the selected slot. */
  value?: string
  onChange?: (time: string) => void
  /** IANA zone the times are expressed in, shown alongside the label. */
  timeZone?: string
  locale?: string
  className?: string
}

type Period = 'Morning' | 'Afternoon' | 'Evening'

const PERIOD_ORDER: Period[] = ['Morning', 'Afternoon', 'Evening']

function periodFor(time: string): Period {
  const hour = Number(time.slice(0, 2))
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

function formatTime(time: string, locale?: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}

/**
 * Time-of-day picker for a booking flow's availability step.
 *
 * Slots are grouped into morning, afternoon, and evening rather than listed
 * as one run, because "sometime in the afternoon" is how people actually
 * decide — an ungrouped column of a dozen times makes them read every one.
 * Empty periods are omitted, so a morning-only day shows a single group.
 *
 * Renders as a radio group so arrow keys move between times.
 *
 * @example
 * <TimeSlotPicker
 *   value={time}
 *   onChange={setTime}
 *   timeZone="America/Denver"
 *   slots={[{ time: '09:00' }, { time: '09:30', taken: true }]}
 * />
 */
export function TimeSlotPicker({
  label = 'Pick a time',
  slots,
  value,
  onChange,
  timeZone,
  locale,
  className,
}: TimeSlotPickerProps) {
  const name = useId()

  const groups = PERIOD_ORDER.map((period) => ({
    period,
    slots: slots.filter((slot) => periodFor(slot.time) === period),
  })).filter((group) => group.slots.length > 0)

  return (
    <fieldset className={cx('deck-time-slots', className)}>
      <div className="deck-time-slots__header">
        <legend className="deck-time-slots__legend">{label}</legend>
        {timeZone && <span className="deck-time-slots__zone">{timeZone}</span>}
      </div>

      {groups.map((group) => (
        <div key={group.period} className="deck-time-slots__group">
          <p className="deck-time-slots__period">{group.period}</p>
          <div className="deck-time-slots__grid">
            {group.slots.map((slot) => {
              const id = `${name}-${slot.time}`
              return (
                <label
                  key={slot.time}
                  className="deck-time-slots__slot"
                  htmlFor={id}
                >
                  <input
                    id={id}
                    className="deck-visually-hidden deck-time-slots__input"
                    type="radio"
                    name={name}
                    value={slot.time}
                    checked={value === slot.time}
                    disabled={slot.taken}
                    onChange={() => onChange?.(slot.time)}
                  />
                  <span className="deck-time-slots__control">
                    {formatTime(slot.time, locale)}
                    {slot.taken && (
                      <span className="deck-visually-hidden"> (unavailable)</span>
                    )}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </fieldset>
  )
}
