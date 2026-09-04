import { useState } from 'react'
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  MapPin,
  Pencil,
  QrCode,
  Users,
} from 'lucide-react'
import { AvatarStack } from '../../components/AvatarStack/AvatarStack'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { EventHero, EventHeroPanel } from '../../components/EventHero/EventHero'
import type { EventHeroView } from '../../components/EventHero/EventHero'
import { EventSchedule } from '../../components/EventSchedule/EventSchedule'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Link } from '../../components/Link/Link'
import { Stack } from '../../components/Stack/Stack'
import { Tag } from '../../components/Tag/Tag'
import { Text } from '../../components/Text/Text'
import { sampleQrMatrixSvg } from '../../components/QRCode/sampleQrMatrix'
import {
  APP_EVENTS,
  TODAY,
  formatFullDate,
  isSoon,
} from './eventsData'
import type { AppEvent } from './eventsData'
import './EventDetails.css'

/* Deck encodes nothing — `QRCode` draws a plate around a matrix you supply.
   The sample one the QRCode stories use, so the hero shows a real code
   rather than a grey square pretending to be one. Same as `MyCards`. */
const SampleQr = () => (
  <span
    style={{ display: 'block', width: '100%', height: '100%' }}
    dangerouslySetInnerHTML={{ __html: sampleQrMatrixSvg }}
  />
)

export interface EventDetailsProps {
  /** The event to show. Defaults to the next one on the calendar. */
  event?: AppEvent
  /** The day the page is read from. Pinned in stories and tests. */
  today?: string
}

/**
 * One event — the page an event's name links to.
 *
 * The header is the same `EventHero` the Events index leads with, at the same
 * size and with the same wash, so arriving here feels like the card you
 * tapped got larger rather than like a different screen. What changes is what
 * hangs off it: the address in full, the hours, and the two things you
 * actually do with an event you are going to — put it on your calendar and
 * send it to someone.
 *
 * Under the cover, the event in the order you would ask about it: what it is,
 * how the day runs, and who you came away with. The last of those is the one
 * the product exists for, so it ends by pointing at the pile itself.
 *
 * Sharing turns the header over rather than raising a dialog: the event is
 * the thing being handed across, and a panel on top of it would put what you
 * are sharing behind the description of it. The same move a card makes.
 *
 * Nothing persists. Share copies a link, and the calendar button does what a
 * prototype can honestly do about your calendar: nothing.
 */
export function EventDetails({
  event = APP_EVENTS[0],
  today = TODAY,
}: EventDetailsProps) {
  /* Held here rather than in the hero because the control that opens it is
     the page's: "Share" belongs in the row beside "Add to calendar", not
     bolted to the header by a component that cannot know what else is in
     that row. The hero owns the way back out. */
  const [view, setView] = useState<EventHeroView>('detail')

  const soon = event.status === 'upcoming' && isSoon(event.date, today)
  const exchanged = event.attendees.length
  const link = `meetcard.io/events/${event.slug}`

  return (
    <div className="app-event-details">
      <Stack gap={20} className="app-event-details__container">
        {/* Back to the list, as a link rather than a history control: this
            page has an address of its own, and "Events" is where it lives. */}
        <Link
          className="app-event-details__back"
          href="/events"
          tone="muted"
          underline="hover"
        >
          <ArrowLeft size={16} aria-hidden="true" focusable="false" />
          Events
        </Link>

        <EventHero
          className="app-event-details__hero"
          level={1}
          name={event.name}
          theme={event.theme}
          view={view}
          onViewChange={setView}
          closeShareLabel={`Close share for ${event.name}`}
          share={{
            value: link,
            /* The second fact only — the hero leads the chip with the event's
               name. Which day it is, which is what you check before handing
               the code to someone who is going to ask. */
            summary: formatFullDate(event.date),
            qr: <SampleQr />,
            onDownloadQr: () => {},
            onShareLinkedIn: () => {},
          }}
          badges={
            <>
              <Badge variant="subtle" size="sm">
                {event.involvement}
              </Badge>
              {soon ? (
                <Badge tone="brand" variant="solid" size="sm">
                  Soon
                </Badge>
              ) : null}
            </>
          }
          action={
            <IconButton
              label="Edit event"
              variant="secondary"
              size="sm"
              round
              icon={<Pencil />}
            />
          }
        >
          <p className="app-event-details__host">
            <Avatar name={event.host} size="xs" decorative />
            <span>
              Hosted by <strong>{event.host}</strong>
              {event.hostRole ? (
                <span className="app-event-details__host-role">
                  {` · ${event.hostRole}`}
                </span>
              ) : null}
            </span>
          </p>

          <div className="app-event-details__facts">
            <EventHeroPanel
              icon={<Clock />}
              title={
                <time dateTime={event.date}>{formatFullDate(event.date)}</time>
              }
              description={
                event.endTime ? `${event.time} – ${event.endTime}` : event.time
              }
            />
            <EventHeroPanel
              icon={<MapPin />}
              title={event.venue}
              description={[event.address, event.city]
                .filter(Boolean)
                .join(', ')}
            />
          </div>

          <div className="app-event-details__actions">
            <Button variant="secondary" size="sm" iconStart={<CalendarPlus />}>
              Add to calendar
            </Button>
            {/* The code, not the share arrows: what this opens is a QR to
                hold up, and the icon should say which of the two sharing
                gestures you are about to get. */}
            <Button
              variant="secondary"
              size="sm"
              iconStart={<QrCode />}
              onClick={() => setView('share')}
            >
              Share
            </Button>
            <AvatarStack
              people={event.attendees}
              max={3}
              label={`Cards exchanged at ${event.name}`}
            />
          </div>
        </EventHero>

        {event.description ? (
          <Card padding={24} className="app-event-details__section">
            <Stack gap={12}>
              <Heading level={2} size="xs" className="app-event-details__eyebrow">
                About
              </Heading>
              <Stack gap={8}>
                {event.description.map((paragraph) => (
                  <Text key={paragraph} size="sm" tone="muted">
                    {paragraph}
                  </Text>
                ))}
              </Stack>
              {typeof event.expected === 'number' ? (
                <Text
                  size="sm"
                  tone="muted"
                  className="app-event-details__expected"
                >
                  <Users size={16} aria-hidden="true" focusable="false" />
                  {event.expected.toLocaleString()} expected
                </Text>
              ) : null}
            </Stack>
          </Card>
        ) : null}

        {event.schedule && event.schedule.length > 0 ? (
          <Card padding={24} className="app-event-details__section">
            <Stack gap={12}>
              <Heading level={2} size="xs" className="app-event-details__eyebrow">
                Schedule
              </Heading>
              <EventSchedule
                slots={event.schedule}
                label={`Schedule for ${event.name}`}
              />
            </Stack>
          </Card>
        ) : null}

        <Card padding={24} className="app-event-details__section">
          <Stack gap={16}>
            <Heading level={2} size="xs" className="app-event-details__eyebrow">
              Cards exchanged
            </Heading>

            <AvatarStack
              people={event.attendees}
              size="md"
              label={`Cards exchanged at ${event.name}`}
              caption={`${exchanged} ${exchanged === 1 ? 'card' : 'cards'} exchanged`}
            />

            {/*
              The faces again, in words. A monogram is not a name, and this is
              the one place on the page where knowing exactly who was there is
              the point — so the stack draws the group and the chips say who
              is in it.
            */}
            <ul className="app-event-details__people">
              {event.attendees.map((person) => (
                <li key={person.name}>
                  <Tag>{person.name}</Tag>
                </li>
              ))}
            </ul>

            <Link href="/connections" underline="hover">
              Open the stack in Connections
            </Link>
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
