import { useMemo, useState } from 'react'
import { Clock, LayoutGrid, List, MapPin, Plus } from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { AvatarStack } from '../../components/AvatarStack/AvatarStack'
import { Badge } from '../../components/Badge/Badge'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { EmptyState } from '../../components/EmptyState/EmptyState'
import { EventAgenda } from '../../components/EventAgenda/EventAgenda'
import type { AgendaEvent } from '../../components/EventAgenda/EventAgenda'
import { EventCard } from '../../components/EventCard/EventCard'
import { EventHero, EventHeroPanel } from '../../components/EventHero/EventHero'
import { Heading } from '../../components/Heading/Heading'
import { SearchField } from '../../components/SearchField/SearchField'
import { Stack } from '../../components/Stack/Stack'
import { LinkButton } from './LinkButton'
import {
  APP_EVENTS,
  TODAY,
  formatFullDate,
  formatPlace,
  formatShortDate,
  isSoon,
} from './eventsData'
import type { AppEvent } from './eventsData'
import './Events.css'

type EventTab = 'upcoming' | 'past'
type EventView = 'list' | 'grid'

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

/* The view switch is two icons and no words, which is why each option carries
   its name for a screen reader: a control whose only label is a picture of a
   list is unlabelled. */
const VIEWS = [
  {
    value: 'list',
    label: (
      <>
        <List size={16} aria-hidden="true" focusable="false" />
        <span className="deck-visually-hidden">List view</span>
      </>
    ),
  },
  {
    value: 'grid',
    label: (
      <>
        <LayoutGrid size={16} aria-hidden="true" focusable="false" />
        <span className="deck-visually-hidden">Card view</span>
      </>
    ),
  },
]

/** Everything a row on the agenda needs, from the event the page holds. */
function toAgendaEvent(event: AppEvent, today: string): AgendaEvent {
  return {
    id: event.slug,
    name: event.name,
    date: event.date,
    time: event.time,
    location: event.venue,
    host: event.host,
    href: `/events/${event.slug}`,
    theme: event.theme,
    involvement: event.involvement,
    flag:
      event.status === 'upcoming' && isSoon(event.date, today)
        ? 'Soon'
        : undefined,
    attendees: event.attendees,
    exchangedCount: event.attendees.length,
  }
}

const matches = (event: AppEvent, query: string) => {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [event.name, event.venue, event.city, event.host, event.involvement]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(needle))
}

export interface EventsProps {
  /** Seeds the page. Nothing persists — Deck has no data layer. */
  events?: AppEvent[]
  /** The day the page is read from. Pinned in stories and tests. */
  today?: string
  /** Which tab opens. */
  defaultTab?: EventTab
  /** Which arrangement opens. */
  defaultView?: EventView
}

/**
 * Events — the rooms you have been in and the ones you are going to.
 *
 * The page leads with one event rather than with a list, because on any given
 * day exactly one of these matters: the next one. It gets the cover, the
 * hour, the address, and a link to the one after it — everything you would
 * want at the moment you are deciding whether to leave the house — and the
 * rest of the calendar starts underneath.
 *
 * Below that, the same events twice over. The agenda is the default: events
 * arrive as days, and the day headings are what make "the week of the summit"
 * findable. The grid is for when you are looking *for* one rather than
 * looking *at* the calendar — it drops the time gutter and gives each event a
 * card of its own. Neither is a different set of data, and switching does not
 * change what is in the tab.
 *
 * Each row's cards are on the row. An event on this page is mostly a
 * container for the people you met there, and saying "5 cards exchanged"
 * beside the faces is what turns a calendar entry back into a reason to open
 * it.
 *
 * Deck has no router. The event names, "Add event" and the up-next panel are
 * real links to the paths the product uses; the tabs, the search and the view
 * switch are local state, which is what they are in the product too.
 */
export function Events({
  events = APP_EVENTS,
  today = TODAY,
  defaultTab = 'upcoming',
  defaultView = 'list',
}: EventsProps) {
  const [tab, setTab] = useState<EventTab>(defaultTab)
  const [view, setView] = useState<EventView>(defaultView)
  const [query, setQuery] = useState('')

  const upcoming = useMemo(
    () => events.filter((event) => event.status === 'upcoming'),
    [events],
  )

  /* The next thing on the calendar, and the one after it. Taken off the front
     of `upcoming` rather than searched for, because the fixture is already in
     the order the tab reads in — see `eventsData`. */
  const [featured, next] = upcoming

  const shown = useMemo(
    () =>
      events.filter((event) => event.status === tab && matches(event, query)),
    [events, tab, query],
  )

  const heading = tab === 'upcoming' ? 'Upcoming events' : 'Past events'

  return (
    <div className="app-events">
      <Stack gap={24} className="app-events__container">
        {featured ? (
          <EventHero
            className="app-events__hero"
            /* "Events" is the page's title, not a label — so it is the `h1`.
               Leaving one featured event's name as the only `h1` on a page
               listing six of them reads oddly out loud. */
            eyebrow="Events"
            eyebrowAs="h1"
            name={featured.name}
            href={`/events/${featured.slug}`}
            theme={featured.theme}
            badges={
              <>
                <Badge variant="subtle" size="sm">
                  Happening next
                </Badge>
                <Badge tone="brand" variant="solid" size="sm">
                  {featured.involvement}
                </Badge>
              </>
            }
          >
            <ul className="app-events__hero-facts">
              <li>
                <Clock size={16} aria-hidden="true" focusable="false" />
                <span>
                  <time dateTime={featured.date}>
                    {formatFullDate(featured.date)}
                  </time>
                  {` · ${featured.time}`}
                </span>
              </li>
              <li>
                <MapPin size={16} aria-hidden="true" focusable="false" />
                <span>{formatPlace(featured)}</span>
              </li>
            </ul>

            {/* The one after next, so the header answers "and then?" without
                anyone scrolling to find out. */}
            {next ? (
              <EventHeroPanel
                href={`/events/${next.slug}`}
                eyebrow={`Up next · ${formatShortDate(next.date)}`}
                title={next.name}
                description={`${next.time} · ${next.venue}`}
                trailing={<Avatar name={next.host} size="xs" decorative />}
              />
            ) : null}
          </EventHero>
        ) : null}

        <div className="app-events__toolbar">
          <ChoiceGroup
            className="app-events__tabs"
            variant="segmented"
            hideLabel
            label="Which events"
            value={tab}
            onChange={(value) => setTab(value as EventTab)}
            options={TABS}
          />

          <div className="app-events__tools">
            <SearchField
              className="app-events__search"
              label="Search events"
              placeholder="Search events"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery('')}
              /* Announced only once there is a query to have narrowed
                 anything — a count on an untouched list is noise. */
              resultCount={query ? shown.length : undefined}
            />

            <ChoiceGroup
              className="app-events__views"
              variant="segmented"
              hideLabel
              label="How to show them"
              value={view}
              onChange={(value) => setView(value as EventView)}
              options={VIEWS}
            />
          </div>

          <LinkButton
            className="app-events__add"
            href="/events/add"
            iconStart={<Plus />}
          >
            Add event
          </LinkButton>
        </div>

        {/*
          A real `h2`, hidden. The segmented control above already says which
          list this is, so a visible heading would be the same word twice —
          but without one the page jumps from its `h1` straight to the event
          names at `h3`, which is a skipped level.
        */}
        <Heading level={2} size="xs" className="deck-visually-hidden">
          {heading}
        </Heading>

        {shown.length === 0 ? (
          <EmptyState
            className="app-events__empty"
            title={query ? 'No events match' : `No ${tab} events`}
            description={
              query
                ? `Nothing here matches “${query.trim()}”. Try a venue, a host, or a city.`
                : tab === 'upcoming'
                  ? 'Add the next room you will be in, and the cards you collect there will land against it.'
                  : 'Events you have been to will collect here, with the cards you came away with.'
            }
          />
        ) : view === 'list' ? (
          <EventAgenda
            label={heading}
            events={shown.map((event) => toAgendaEvent(event, today))}
          />
        ) : (
          <ul className="app-events__grid" aria-label={heading}>
            {shown.map((event) => (
              <li key={event.slug}>
                <EventCard
                  layout="tile"
                  name={event.name}
                  startDate={event.date}
                  time={event.time}
                  location={event.venue}
                  host={event.host}
                  href={`/events/${event.slug}`}
                  eyebrow={event.involvement}
                  /*
                    The same nudge the agenda puts on the row, in the same
                    word. Through `actions` rather than `status`, because
                    `status` is the event's lifecycle — "Upcoming", which the
                    tab above has already said — and "Soon" is the thing worth
                    saying instead.
                  */
                  actions={
                    event.status === 'upcoming' && isSoon(event.date, today) ? (
                      <Badge tone="brand" size="sm">
                        Soon
                      </Badge>
                    ) : undefined
                  }
                  footer={
                    <AvatarStack
                      people={event.attendees}
                      label={`Cards exchanged at ${event.name}`}
                      caption={`${event.attendees.length} ${
                        event.attendees.length === 1 ? 'card' : 'cards'
                      } exchanged`}
                    />
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </Stack>
    </div>
  )
}
