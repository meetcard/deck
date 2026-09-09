import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Heading, type HeadingLevel } from '../Heading/Heading'
import { Text } from '../Text/Text'
import './EventHero.css'

export interface EventHeroFact {
  /** Decorative — the fact itself carries the meaning. */
  icon?: ReactNode
  /** The fact, e.g. "Tuesday, May 18, 2027". */
  title: ReactNode
  /** The quieter line under it, e.g. "9:00 AM – 4:30 PM". */
  detail?: ReactNode
}

export interface EventHeroHost {
  name: string
  avatarSrc?: string
  /** Their line, e.g. "Community Lead, RevOps Collective". */
  detail?: ReactNode
}

export interface EventHeroProps
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
  host?: EventHeroHost
  /** The facts of the thing: when, and where. */
  facts?: EventHeroFact[]
  /** Anything below the facts — an RSVP, a share control, what's on next. */
  children?: ReactNode
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
 * The frame is **landscape at every width**, 7:4, and the ratio is a floor
 * rather than a fixed height: content taller than the picture pushes the
 * hero down instead of being clipped. A portrait crop on a phone spends the
 * screen on blurred picture above the words, and the words are what a header
 * is for.
 *
 * @example
 * <EventHero
 *   name="RevOps Summit"
 *   level={1}
 *   coverSrc={cover}
 *   badges={<Badge tone="success">Attending</Badge>}
 *   host={{ name: 'Hannah Davis', detail: 'Community Lead' }}
 *   facts={[{ icon: <CalendarDays />, title: 'Tuesday, May 18, 2027', detail: '9:00 AM – 4:30 PM' }]}
 * />
 */
export const EventHero = forwardRef<HTMLElement, EventHeroProps>(
  function EventHero(
    {
      name,
      level = 2,
      href,
      coverSrc,
      badges,
      host,
      facts,
      children,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <header ref={ref} className={cx('deck-event-hero', className)} {...props}>
        <div className="deck-event-hero__backdrop" aria-hidden="true">
          {coverSrc ? (
            <img className="deck-event-hero__image" src={coverSrc} alt="" />
          ) : null}
          <span className="deck-event-hero__scrim" />
        </div>

        {/*
          `deck-solid-surface` over a scrim of this component's own: the
          class re-points every colour token a descendant reads, and the
          content layer above re-points the on-color it reads them from.
        */}
        <div className="deck-event-hero__content deck-solid-surface">
          {badges ? (
            <div className="deck-event-hero__badges">{badges}</div>
          ) : null}

          <Heading
            level={level}
            /* An `h1` is what the page is about; anything lower is one event
               among several and is sized to sit under a real page title. */
            size={level === 1 ? 'xl' : 'lg'}
            family="serif"
            className="deck-event-hero__name"
          >
            {href ? (
              <a href={href} className="deck-event-hero__link">
                {name}
              </a>
            ) : (
              name
            )}
          </Heading>

          {host ? (
            <Text size="sm" className="deck-event-hero__host">
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
                <span className="deck-event-hero__host-detail">
                  {' · '}
                  {host.detail}
                </span>
              ) : null}
            </Text>
          ) : null}

          {facts && facts.length > 0 ? (
            <ul className="deck-event-hero__facts">
              {facts.map((fact, index) => (
                <li key={index} className="deck-event-hero__fact">
                  {fact.icon ? (
                    <span className="deck-event-hero__fact-icon" aria-hidden="true">
                      {fact.icon}
                    </span>
                  ) : null}
                  <span className="deck-event-hero__fact-text">
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
