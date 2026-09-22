import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { CoverCard, type CoverCardProps } from '../CoverCard/CoverCard'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { cx } from '../../lib/cx'
import type { HeadingLevel } from '../Heading/Heading'
import './FeaturedEventsHeaderCard.css'

export interface FeaturedEventsHeaderCardFact {
  /** Decorative — the text carries the meaning. */
  icon?: ReactNode
  text: ReactNode
}

export interface FeaturedEventsHeaderCardUpNext {
  /** Small caps on the strip — "Up next · Jun 16". */
  label: ReactNode
  name: ReactNode
  /** Time and place on one line. */
  detail?: ReactNode
  /** Usually an `Avatar` or `AvatarGroup`. */
  trailing?: ReactNode
}

export interface FeaturedEventsHeaderCardProps
  extends Omit<CoverCardProps, 'children' | 'title'> {
  name: string
  /** Heading level. `2` by default — this heads a section, not a page. */
  level?: HeadingLevel
  /** Makes the name a link to the event. */
  href?: string
  /** Pills above the name: "Happening next", "Attending". */
  badges?: ReactNode
  /** When and where, one line each. */
  facts?: FeaturedEventsHeaderCardFact[]
  /**
   * The event after this one, on a strip along the foot of the card. It is
   * what makes this the *calendar's* header rather than an event's own: the
   * question on a calendar is what is next, and the answer is worth more
   * than the empty half of a photograph.
   */
  upNext?: FeaturedEventsHeaderCardUpNext
}

/**
 * The event at the top of the calendar — the one happening next, as a card.
 *
 * Distinct from `EventHeaderCard`, which heads an event's *own* page and carries
 * the things you do there: an RSVP, a share control, who else is going.
 * This one heads a list of events. It answers "what is next" and then, on
 * the strip along its foot, "and after that" — so the top of the calendar
 * says the same thing the calendar does.
 *
 * The photograph is sharp here rather than blurred. A hero is read; this is
 * looked at, and its facts are two short lines rather than a paragraph.
 *
 * @example
 * <FeaturedEventsHeaderCard
 *   name="RevOps Summit"
 *   coverSrc={cover}
 *   badges={<Badge tone="success">Attending</Badge>}
 *   facts={[{ icon: <Clock />, text: 'Tuesday, May 18, 2027 · 9:00 AM' }]}
 *   upNext={{ label: 'Up next · Jun 16', name: 'Boulder Climate Happy Hour' }}
 * />
 */
export const FeaturedEventsHeaderCard = forwardRef<HTMLElement, FeaturedEventsHeaderCardProps>(
  function FeaturedEventsHeaderCard(
    {
      name,
      level = 2,
      href,
      badges,
      facts,
      upNext,
      className,
      ...surfaceProps
    },
    ref,
  ) {
    return (
      <CoverCard
        ref={ref}
        /* Words at the top, a strip at the foot: both ends carry text, so
           both ends of the scrim are heavy and the picture keeps the
           middle. */
        scrim="edges"
        className={cx('deck-featured-events-header-card', className)}
        {...surfaceProps}
      >
        {badges ? (
          <div className="deck-featured-events-header-card__badges">{badges}</div>
        ) : null}

        <Heading
          level={level}
          /* Bigger than a hero's. This card is the top of the calendar and
             the name is the thing you are meant to see from across a room —
             `EventHeaderCard` sits under a real page title and is sized to. */
          size={level === 1 ? 'display-md' : 'display-sm'}
          family="serif"
          className="deck-featured-events-header-card__name"
        >
          {href ? (
            <a href={href} className="deck-featured-events-header-card__link">
              {name}
            </a>
          ) : (
            name
          )}
        </Heading>

        {facts && facts.length > 0 ? (
          <ul className="deck-featured-events-header-card__facts">
            {facts.map((fact, index) => (
              <li key={index} className="deck-featured-events-header-card__fact">
                {fact.icon ? (
                  <span
                    className="deck-featured-events-header-card__fact-icon"
                    aria-hidden="true"
                  >
                    {fact.icon}
                  </span>
                ) : null}
                <Text size="sm" as="span">
                  {fact.text}
                </Text>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Full-bleed along the foot: the strip is a band across the card,
            not a box inside it, so the padding is undone here rather than
            left off the content layer everything else depends on. */}
        {upNext ? (
          <div className="deck-featured-events-header-card__next">
            <div className="deck-featured-events-header-card__next-text">
              <Text size="xs" className="deck-featured-events-header-card__next-label">
                {upNext.label}
              </Text>
              <Text size="sm" weight="semibold">
                {upNext.name}
              </Text>
              {upNext.detail ? <Text size="sm">{upNext.detail}</Text> : null}
            </div>
            {upNext.trailing ? (
              <div className="deck-featured-events-header-card__next-trailing">
                {upNext.trailing}
              </div>
            ) : null}
          </div>
        ) : null}
      </CoverCard>
    )
  },
)
