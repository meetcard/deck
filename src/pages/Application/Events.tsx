import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CalendarPlus,
  LayoutGrid,
  List,
  MapPin,
} from 'lucide-react'
import { AvatarGroup } from '../../components/AvatarGroup/AvatarGroup'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventCard } from '../../components/EventCard/EventCard'
import { EventHero } from '../../components/EventHero/EventHero'
import { EventRow } from '../../components/EventRow/EventRow'
import { Heading } from '../../components/Heading/Heading'
import { SearchField } from '../../components/SearchField/SearchField'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import {
  EVENTS,
  TODAY,
  daysUntil,
  formatLongDate,
  parseISODate,
  type AppEvent,
} from './eventFixtures'
import './Events.css'

export type { AppEvent }

/** Close enough to need packing for. */
const SOON_DAYS = 21

/**
 * The faces a row carries, and what they mean.
 *
 * Two different facts that look identical: before the date, people you know
 * who are going; after it, whose cards you came away with. The prototype
 * shows "5 cards exchanged" against an event three weeks out — cards that
 * cannot exist yet — so this splits them on the date instead.
 */
function peopleFor(event: AppEvent, today: string) {
  const past = event.date < today
  const names = (past ? event.exchanged : event.going) ?? []
  return {
    people: names.map((name) => ({ name })),
    relation: past ? ('exchanged' as const) : ('going' as const),
  }
}

/* ---- Page --------------------------------------------------------------- */

export interface EventsProps {
  events?: AppEvent[]
  /** ISO date the page reads "upcoming" from. Pinned in stories and tests. */
  today?: string
  /** Which list opens first. */
  defaultTab?: 'upcoming' | 'past'
  /** Which shape the list opens in. */
  defaultView?: 'list' | 'cards'
}

/**
 * Your events — the ones you are going to, hosting, or speaking at.
 *
 * Distinct from the public events index: this is a personal calendar, so it
 * is ordered by what you have to do next rather than by what is popular, and
 * every row says what you are to the event. Hosting a dinner and being in the
 * audience are the same date and completely different weeks.
 *
 * The next event is lifted out into a hero. On a list where every row looks
 * alike, the one that matters this week is the one that should not — and it
 * is the only place with room for the event's own picture, which is how you
 * recognise it before you have read anything. The event after it rides along
 * underneath, because "and then?" is the second question anyone asks.
 *
 * The list can be read two ways. Rows are for scanning a calendar down its
 * left edge; cards are for browsing when you are not sure what you are
 * looking for. Search cuts across both, and past events keep their
 * attendance badge — "I spoke at that" is the reason anyone scrolls back.
 */
export function Events({
  events = EVENTS,
  today = TODAY,
  defaultTab = 'upcoming',
  defaultView = 'list',
}: EventsProps) {
  const [tab, setTab] = useState<'upcoming' | 'past'>(defaultTab)
  const [view, setView] = useState<'list' | 'cards'>(defaultView)
  const [query, setQuery] = useState('')

  const { upcoming, past } = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
    return {
      upcoming: sorted.filter((event) => event.date >= today),
      /* Newest first: the thing you want from a past list is almost always
         the most recent one, not the oldest. */
      past: sorted.filter((event) => event.date < today).reverse(),
    }
  }, [events, today])

  const featured = upcoming[0]
  const next = upcoming[1]

  const list = useMemo(() => {
    const source = tab === 'upcoming' ? upcoming : past
    const needle = query.trim().toLowerCase()
    if (!needle) return source
    /* Name, venue and city — the three things anyone actually remembers
       about an event they are trying to find again. */
    return source.filter((event) =>
      [event.name, event.venue, event.city]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle)),
    )
  }, [tab, upcoming, past, query])

  const searching = query.trim().length > 0

  return (
    <div className="events">
      <Stack gap={24} className="events__container">
        <Heading level={1} size="xl" family="serif">
          Events
        </Heading>

        {featured ? (
          <section className="events__featured" aria-label="Featured event">
            <Text size="xs" tone="brand" className="events__eyebrow">
              Featured
            </Text>

            <EventHero
              /* The page's `h1` is "Events"; this is the heading of one
                 section within it. */
              level={2}
              name={featured.name}
              href={`/events/${featured.slug}`}
              coverSrc={featured.coverSrc}
              badges={
                <>
                  <Badge tone="neutral" size="sm">
                    Happening next
                  </Badge>
                  {daysUntil(featured.date, today) <= SOON_DAYS ? (
                    <Badge tone="warning" size="sm">
                      In {daysUntil(featured.date, today)} days
                    </Badge>
                  ) : null}
                </>
              }
              facts={[
                {
                  icon: <CalendarDays />,
                  title: formatLongDate(featured.date),
                  detail: featured.endTime
                    ? `${featured.time} – ${featured.endTime}`
                    : featured.time,
                },
                {
                  icon: <MapPin />,
                  title: featured.venue,
                  detail: featured.city,
                },
              ]}
            >
              {/* "And then?" — the second question anyone asks of a calendar,
                  answered without leaving the first answer. */}
              {next ? (
                <a className="events__next" href={`/events/${next.slug}`}>
                  <span className="events__next-text">
                    <span className="events__next-eyebrow">
                      Up next ·{' '}
                      {parseISODate(next.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="events__next-name">{next.name}</span>
                    <span className="events__next-meta">
                      {next.time} · {next.venue}
                    </span>
                  </span>
                  {next.going && next.going.length > 0 ? (
                    <AvatarGroup
                      size="xs"
                      max={3}
                      label={`Going to ${next.name}`}
                      people={next.going.map((name) => ({ name }))}
                    />
                  ) : null}
                </a>
              ) : null}
            </EventHero>
          </section>
        ) : null}

        <div className="events__toolbar">
          <ChoiceGroup
            label="Which events"
            hideLabel
            className="events__tabs"
            options={[
              { value: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { value: 'past', label: `Past (${past.length})` },
            ]}
            value={tab}
            onChange={(nextTab) => setTab(nextTab as 'upcoming' | 'past')}
          />

          <SearchField
            label="Search events"
            className="events__search"
            placeholder="Search events"
            value={query}
            resultCount={searching ? list.length : undefined}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />

          {/*
            Labelled in words, not only in glyphs. The prototype's toggle is
            two icons; an icon on its own has to be guessed at, and there is
            room here for the two words that make it unnecessary.
          */}
          <ChoiceGroup
            label="How to show them"
            hideLabel
            className="events__views"
            options={[
              {
                value: 'list',
                label: (
                  <>
                    <List aria-hidden="true" className="events__view-icon" />
                    List
                  </>
                ),
              },
              {
                value: 'cards',
                label: (
                  <>
                    <LayoutGrid aria-hidden="true" className="events__view-icon" />
                    Cards
                  </>
                ),
              },
            ]}
            value={view}
            onChange={(nextView) => setView(nextView as 'list' | 'cards')}
          />

          <Button
            iconStart={<CalendarPlus aria-hidden="true" />}
            className="events__add"
          >
            Add event
          </Button>
        </div>

        <section aria-labelledby="events-list-heading">
          <Heading
            id="events-list-heading"
            level={2}
            size="xs"
            className="deck-visually-hidden"
          >
            {tab === 'upcoming' ? 'Upcoming events' : 'Past events'}
          </Heading>

          {list.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  searching
                    ? 'No events match that'
                    : tab === 'upcoming'
                      ? 'Nothing coming up'
                      : 'No past events'
                }
                description={
                  searching
                    ? `Nothing in ${tab === 'upcoming' ? 'your upcoming' : 'your past'} events matches “${query.trim()}”.`
                    : tab === 'upcoming'
                      ? 'Add an event and the cards you collect there will file themselves under it.'
                      : 'Events you have been to will be listed here.'
                }
                actions={
                  searching ? (
                    /* Not "Clear search": the field has a control by that
                       name already, and two buttons with one name in one
                       view is a screen reader reading the same thing
                       twice. */
                    <Button variant="secondary" onClick={() => setQuery('')}>
                      Show all events
                    </Button>
                  ) : tab === 'upcoming' ? (
                    <Button iconStart={<CalendarPlus aria-hidden="true" />}>
                      Add event
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : view === 'cards' ? (
            <div className="events__grid">
              {list.map((event) => (
                <EventCard
                  key={event.slug}
                  name={event.name}
                  startDate={event.date}
                  location={[event.venue, event.city].filter(Boolean).join(', ')}
                  href={`/events/${event.slug}`}
                  status={event.date < today ? 'past' : 'upcoming'}
                  connectionCount={event.exchanged?.length}
                />
              ))}
            </div>
          ) : (
            <Card>
              {list.map((event) => {
                const { people, relation } = peopleFor(event, today)

                return (
                  <EventRow
                    key={event.slug}
                    name={event.name}
                    date={event.date}
                    time={event.time}
                    venue={event.venue}
                    attendance={event.attendance}
                    showWeekday
                    soon={
                      event.date >= today &&
                      daysUntil(event.date, today) <= SOON_DAYS
                    }
                    href={`/events/${event.slug}`}
                    coverSrc={event.coverSrc}
                    host={event.host ? { name: event.host.name } : undefined}
                    people={people}
                    peopleRelation={relation}
                  />
                )
              })}
            </Card>
          )}
        </section>
      </Stack>
    </div>
  )
}
