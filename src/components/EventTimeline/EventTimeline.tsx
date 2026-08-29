import { useId, useState } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import './EventTimeline.css'

export interface TimelineEvent {
  /** Stable key, typically the event slug. Also the value passed to `onValueChange`. */
  id: string
  name: string
  /** ISO 8601 date, `YYYY-MM-DD`. Rendered in the viewer's locale. */
  date: string
  /** Where it happened, e.g. "Denver, CO". */
  location?: string
}

export interface EventTimelineProps
  extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  /**
   * The events on the line, oldest first. Left in the caller's order rather
   * than sorted here: a timeline that silently reorders its own input hides
   * a bug in whatever produced it.
   */
  events: TimelineEvent[]
  /** Controlled selection, by event `id`. */
  value?: string
  /** Uncontrolled starting selection. Defaults to the first event. */
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Accessible (and, from `sm` up, visible) name for the line. */
  label?: string
  /**
   * ISO date the line is read from — everything after it is still to come.
   * Defaults to today, and exists so a story or a test can stand somewhere
   * fixed on the line.
   */
  today?: string
  locale?: string
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}

/** Parsed as local noon so a UTC offset can't roll the date over a boundary. */
function parseISODate(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

function formatDate(date: string, locale?: string): string {
  const parsed = parseISODate(date)
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleDateString(locale, DATE_FORMAT)
}

/** Today as `YYYY-MM-DD`, local — the same shape the events carry. */
function todayISO(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/* The globe beside a location. Drawn here rather than taken as a prop: it is
   punctuation for the meta line, not an icon the caller chooses — the same
   reason `CardPile` draws its own chevrons. Lucide's conventions, since it
   sits among Lucide icons everywhere else: the 24-unit grid, 2px strokes,
   round joins, no fill. */
const GlobeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

/**
 * The events a set of cards came from, laid out as one line through time.
 *
 * Picking an event on the line changes what is shown below it — on the
 * Connections page, which pile of cards is on the desk. A line rather than a
 * row of tabs because the ordering is the point: these events happened in a
 * sequence, some of them are still ahead, and the gap between "last autumn"
 * and "next January" is a fact worth drawing.
 *
 * It renders as a radio group, so arrow keys walk the line and the selection
 * is announced with its date, its place, and whether it has happened yet.
 * Position on the line is never the only carrier of that — each event spells
 * out "past" or "still to come" for a screen reader, and the selected event
 * is bolder and larger, not merely greener.
 *
 * On a phone the line has nowhere to go: three labels side by side on a
 * 375px screen are unreadable. So it collapses to the dots alone, tapped
 * like pagination, with the selected event named in full underneath. The
 * labels stay in the accessibility tree either way, since they are what give
 * each dot its name.
 *
 * @example
 * <EventTimeline
 *   value={eventId}
 *   onValueChange={setEventId}
 *   events={[
 *     { id: 'saastr', name: 'SaaStr Annual', date: '2027-09-09', location: 'San Francisco, CA' },
 *     { id: 'founders', name: 'Founders Dinner', date: '2027-11-12', location: 'Denver, CO' },
 *   ]}
 * />
 */
export function EventTimeline({
  events,
  value: controlledValue,
  defaultValue,
  onValueChange,
  label = 'Event timeline',
  today = todayISO(),
  locale,
  className,
  style,
  ...props
}: EventTimelineProps) {
  const name = useId()
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? events[0]?.id,
  )

  const isControlled = controlledValue !== undefined
  const selectedId = isControlled ? controlledValue : uncontrolledValue
  const selected = events.find((event) => event.id === selectedId)

  function select(id: string) {
    if (!isControlled) setUncontrolledValue(id)
    onValueChange?.(id)
  }

  return (
    <fieldset
      className={cx('deck-event-timeline', className)}
      /* The count drives the track's columns: one per event, so the dots
         land at even intervals and the labels sit under their own dot.
         Merged with the caller's `style` rather than spread over it, so
         passing one doesn't silently take the columns away. */
      style={
        {
          ...style,
          '--deck-event-timeline-count': events.length,
        } as CSSProperties
      }
      {...props}
    >
      <legend className="deck-event-timeline__legend">{label}</legend>

      <div className="deck-event-timeline__track">
        {events.map((event) => {
          const id = `${name}-${event.id}`
          const upcoming = event.date > today
          const isSelected = event.id === selectedId

          return (
            <label
              key={event.id}
              htmlFor={id}
              className={cx(
                'deck-event-timeline__event',
                upcoming && 'deck-event-timeline__event--upcoming',
                isSelected && 'deck-event-timeline__event--selected',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={event.id}
                checked={isSelected}
                onChange={() => select(event.id)}
                className="deck-visually-hidden deck-event-timeline__input"
              />
              <span className="deck-event-timeline__dot" aria-hidden="true" />
              {/*
                Clipped rather than removed on a phone: this text is the
                radio's accessible name, and a name computed from a
                `display: none` label is no name at all.
              */}
              <span className="deck-event-timeline__text">
                <span className="deck-event-timeline__name">
                  {event.name}
                  {/* State, spelled out — the line's geometry and the dot's
                      colour are both unavailable to a screen reader. */}
                  <span className="deck-visually-hidden">
                    {upcoming ? ' (still to come)' : ' (past)'}
                  </span>
                </span>
                <span className="deck-event-timeline__meta">
                  <time dateTime={event.date}>
                    {formatDate(event.date, locale)}
                  </time>
                  {event.location ? (
                    <>
                      {' · '}
                      <span className="deck-event-timeline__place">
                        <GlobeIcon />
                        {event.location}
                      </span>
                    </>
                  ) : null}
                </span>
              </span>
            </label>
          )
        })}
      </div>

      {/*
        The phone's answer to the labels it just clipped. `aria-hidden`
        because it says nothing the selected radio doesn't already say —
        this is the same event, rendered where there is room for it.
      */}
      {selected ? (
        <div className="deck-event-timeline__current" aria-hidden="true">
          <span className="deck-event-timeline__name">{selected.name}</span>
          <span className="deck-event-timeline__meta">
            <time dateTime={selected.date}>
              {formatDate(selected.date, locale)}
            </time>
            {selected.location ? ` · ${selected.location}` : null}
          </span>
        </div>
      ) : null}
    </fieldset>
  )
}
