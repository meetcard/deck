import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import {
  useCardOrientation,
  type CardOrientation,
} from '../../lib/cardOrientation'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Heading, type HeadingLevel } from '../Heading/Heading'
import { Text } from '../Text/Text'
import './EventHeaderCard.css'

export interface EventHeaderCardFact {
  /** Decorative — the fact itself carries the meaning. */
  icon?: ReactNode
  /** The fact, e.g. "Tuesday, May 18, 2027". */
  title: ReactNode
  /** The quieter line under it, e.g. "9:00 AM – 4:30 PM". */
  detail?: ReactNode
}

export interface EventHeaderCardHost {
  name: string
  avatarSrc?: string
  /** Their line, e.g. "Community Lead, RevOps Collective". */
  detail?: ReactNode
}

export interface EventHeaderCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  name: string
  /**
   * Heading level for the name. `1` on the event's own page, `2` where the
   * event is one thing among others. The visual size follows from it — an
   * `h1` is the page's subject and is sized like one.
   */
  level?: HeadingLevel
  /** Makes the name a link to the event. */
  href?: string
  /** The cover photo. Blurred behind a scrim — it is a backdrop, not an image. */
  coverSrc?: string
  /** Pills above the name: "Happening next", "Attending", "Soon". */
  badges?: ReactNode
  /** Who is putting it on. */
  host?: EventHeaderCardHost
  /** The facts of the thing: when, and where. */
  facts?: EventHeaderCardFact[]
  /** Anything below the facts — an RSVP, a share control, what's on next. */
  children?: ReactNode
  /**
   * Which way up the header sits. Default `responsive`: portrait on a phone,
   * landscape from `sm` up — the same rule as every other card.
   */
  orientation?: CardOrientation
}

/**
 * The top of an event: its picture, its name, and the two facts anyone
 * actually needs — when, and where.
 *
 * The cover is a backdrop rather than a picture. It is blurred and sunk
 * under a scrim, because the job of a photo here is to say which event this
 * is at a glance, and a legible name matters more than a sharp image. An
 * event with no cover gets the brand under the same scrim, so a hero without
 * a photo is a quieter hero rather than a broken one.
 *
 * The scrim is dark in both light and dark mode — a photograph is not a
 * palette — so everything inside reads against a fixed on-color rather than
 * the page's. That is a token pair of its own (`--deck-color-cover-*`), and
 * the content layer re-points the solid-surface contract at it, which is
 * what makes `Text`, `Heading`, `Badge` and `Button` come out right in here
 * without any of them knowing they are on a photo.
 *
 * The frame is a card, and holds the card rule: a fixed 1.75:1 box lying
 * down and 1:1.75 stood up, portrait on a phone and landscape from `sm` up.
 * The box never grows. The name clamps to three lines, the host's own title
 * drops out below `sm`, and if what is left still runs past the edge the
 * content scrolls inside the card rather than being cut off — this header
 * can hold an RSVP, and a control nobody can reach is worse than a scroll.
 *
 * @example
 * <EventHeaderCard
 *   name="RevOps Summit"
 *   level={1}
 *   coverSrc={cover}
 *   badges={<Badge tone="success">Attending</Badge>}
 *   host={{ name: 'Hannah Davis', detail: 'Community Lead' }}
 *   facts={[{ icon: <CalendarDays />, title: 'Tuesday, May 18, 2027', detail: '9:00 AM – 4:30 PM' }]}
 * />
 */
export const EventHeaderCard = forwardRef<HTMLElement, EventHeaderCardProps>(
  function EventHeaderCard(
    {
      name,
      level = 2,
      href,
      coverSrc,
      badges,
      host,
      facts,
      children,
      orientation: preferredOrientation,
      className,
      ...props
    },
    ref,
  ) {
    const orientation = useCardOrientation(preferredOrientation)

    return (
      <header
        ref={ref}
        className={cx('deck-event-header-card', className)}
        data-card-orientation={orientation}
        {...props}
      >
        <div className="deck-event-header-card__backdrop" aria-hidden="true">
          {coverSrc ? (
            <img className="deck-event-header-card__image" src={coverSrc} alt="" />
          ) : null}
          <span className="deck-event-header-card__scrim" />
        </div>

        {/*
          `deck-solid-surface` over a scrim of this component's own: the
          class re-points every colour token a descendant reads, and the
          content layer above re-points the on-color it reads them from.
        */}
        <div className="deck-event-header-card__content deck-solid-surface">
          {badges ? (
            <div className="deck-event-header-card__badges">{badges}</div>
          ) : null}

          <Heading
            level={level}
            /* An `h1` is what the page is about; anything lower is one event
               among several and is sized to sit under a real page title. */
            size={level === 1 ? 'xl' : 'lg'}
            family="serif"
            className="deck-event-header-card__name"
          >
            {href ? (
              <a href={href} className="deck-event-header-card__link">
                {name}
              </a>
            ) : (
              name
            )}
          </Heading>

          {host ? (
            <Text size="sm" className="deck-event-header-card__host">
              <Avatar
                name={host.name}
                src={host.avatarSrc}
                size="xs"
                decorative
              />
              Hosted by <strong>{host.name}</strong>
              {host.detail ? (
                /* Dropped on a phone rather than wrapped: the host's own
                   title is the least of what this line is for, and it is
                   what turns one line into three. */
                <span className="deck-event-header-card__host-detail">
                  {' · '}
                  {host.detail}
                </span>
              ) : null}
            </Text>
          ) : null}

          {facts && facts.length > 0 ? (
            <ul className="deck-event-header-card__facts">
              {facts.map((fact, index) => (
                <li key={index} className="deck-event-header-card__fact">
                  {fact.icon ? (
                    <span className="deck-event-header-card__fact-icon" aria-hidden="true">
                      {fact.icon}
                    </span>
                  ) : null}
                  <span className="deck-event-header-card__fact-text">
                    {/* Weight, not colour: on this surface every token
                        resolves to the one on-color proven against the
                        scrim, so hierarchy has to be built from something
                        contrast cannot lose. */}
                    <Text as="span" size="sm" weight="medium">
                      {fact.title}
                    </Text>
                    {fact.detail ? (
                      <Text as="span" size="sm">
                        {fact.detail}
                      </Text>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {children}
        </div>
      </header>
    )
  },
)
