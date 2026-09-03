import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Link } from '../Link/Link'
import type { CardTheme } from '../PersonCard/PersonCard'
import './EventHero.css'

/** Where the hero's caps line sits in the document outline. */
export type EventHeroEyebrowElement = 'p' | 'h1' | 'h2'

export interface EventHeroProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** The event's name, and the hero's heading. */
  name: string
  /** Makes the name a link — the featured event on an index. */
  href?: string
  /** Heading level for the name. `2` by default; `1` on an event's own page. */
  level?: 1 | 2 | 3
  /**
   * The caps line above everything. Pass `eyebrowAs="h1"` when it is the page
   * title rather than a label — on an index, "Events" is exactly that, and a
   * page whose only `h1` names one featured event reads oddly out loud.
   */
  eyebrow?: ReactNode
  eyebrowAs?: EventHeroEyebrowElement
  /** Pills above the name — "Happening next", "Attending". */
  badges?: ReactNode
  /**
   * The cover photograph, blurred behind the wash. Without one the hero
   * paints `theme` instead, so an event with no picture is still an object
   * with a colour rather than a grey box.
   */
  coverSrc?: string
  /** The colours this event is branded with. */
  theme?: CardTheme
  /** A control pinned to the top corner — the owner's pencil. */
  action?: ReactNode
  /** Everything below the name: facts, panels, actions. */
  children?: ReactNode
}

/**
 * An event as the thing you are looking at — a cover, a name, and whatever
 * the page needs pinned to it.
 *
 * Deck's other event surfaces are entries in a list; this one is the event
 * itself, which is why it is the only one that carries a photograph. It heads
 * the Events index (the next thing on your calendar) and an event's own page
 * (the thing you came to read), and both look the same on purpose: arriving
 * on the detail page should feel like the header you tapped got larger, not
 * like a different screen.
 *
 * **Contrast is hand-checked, not swept.** The text sits on a photograph, and
 * axe declines to judge contrast over an image — so the wash is heavy enough
 * that the darkest permissible composite still clears AA for white text
 * regardless of what the picture is. See `EventHero.css`.
 *
 * The surface re-points Deck's colour tokens the way `PersonCard` does, so an
 * ordinary `Button`, `Badge` or `Text` dropped into `children` comes out as
 * glass without knowing it is on a hero.
 *
 * The frame is landscape at every width. A portrait cover on a phone spends
 * most of the screen on blurred picture above the words, and the words are
 * what the header is for.
 *
 * @example
 * <EventHero
 *   name="RevOps Summit"
 *   eyebrow="Events"
 *   eyebrowAs="h1"
 *   badges={<Badge>Attending</Badge>}
 *   theme={{ primary: '#2E6E5B' }}
 * >
 *   <EventHeroPanel title="Tuesday, May 18" description="9:00 AM – 4:30 PM" />
 * </EventHero>
 */
export const EventHero = forwardRef<HTMLElement, EventHeroProps>(
  function EventHero(
    {
      name,
      href,
      level = 2,
      eyebrow,
      eyebrowAs: Eyebrow = 'p',
      badges,
      coverSrc,
      theme,
      action,
      children,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const Name = `h${level}` as const

    return (
      <section
        ref={ref}
        className={cx(
          'deck-event-hero',
          /* No photograph to protect, so the ground is drawn rather than
             screened — see the `--flat` block in the stylesheet. */
          !coverSrc && 'deck-event-hero--flat',
          className,
        )}
        style={
          {
            ...style,
            ...(theme?.primary
              ? { '--deck-event-hero-brand': theme.primary }
              : null),
            ...(theme?.accent
              ? { '--deck-event-hero-accent': theme.accent }
              : null),
          } as CSSProperties
        }
        {...props}
      >
        {/* Decorative throughout: the picture of a conference hall says
            nothing the name and the date below it do not, and describing it
            would only put "stock photo of a stage" between a screen reader
            and the event. */}
        <div className="deck-event-hero__ground" aria-hidden="true">
          {coverSrc ? (
            <img className="deck-event-hero__photo" src={coverSrc} alt="" />
          ) : null}
          <div className="deck-event-hero__wash" />
        </div>

        {action ? (
          <div className="deck-event-hero__action">{action}</div>
        ) : null}

        {/*
          The aspect ratio lives here rather than on the section, and this box
          keeps `overflow: visible`, which is what lets content push the hero
          taller than the ratio instead of being clipped by it. The section
          above does the clipping, for the rounded corners.
        */}
        <div className="deck-event-hero__content">
          {eyebrow ? (
            <Eyebrow className="deck-event-hero__eyebrow">{eyebrow}</Eyebrow>
          ) : null}

          <div className="deck-event-hero__body">
            {badges ? (
              <div className="deck-event-hero__badges">{badges}</div>
            ) : null}

            <Name className="deck-event-hero__name">
              {href ? (
                <Link href={href} tone="default" underline="hover">
                  {name}
                </Link>
              ) : (
                name
              )}
            </Name>

            {children}
          </div>
        </div>
      </section>
    )
  },
)

export interface EventHeroPanelProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Decorative — the text carries the meaning. */
  icon?: ReactNode
  /** A caps line above the title — "Up next · Jun 16". */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Pinned to the far end — an avatar, a chevron. */
  trailing?: ReactNode
  /** Makes the whole panel a link. */
  href?: string
}

/**
 * A pane of frosted glass set into an `EventHero`.
 *
 * One component for both of the hero's inset shapes, because they are the
 * same object: a fact tile ("Tuesday, May 18 / 9:00 AM – 4:30 PM") is this
 * with an icon, and the "up next" teaser is this with an `href` and a face on
 * the end. Splitting them would have produced two components that differ only
 * in which optional props they happen to pass.
 *
 * Only meaningful inside `EventHero` — it reads its glass from the hero's own
 * palette.
 *
 * @example
 * <EventHeroPanel icon={<Clock />} title="Tuesday, May 18, 2027"
 *   description="9:00 AM – 4:30 PM" />
 */
export function EventHeroPanel({
  icon,
  eyebrow,
  title,
  description,
  trailing,
  href,
  className,
  ...props
}: EventHeroPanelProps) {
  const content = (
    <>
      {icon ? (
        <span className="deck-event-hero-panel__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}

      <span className="deck-event-hero-panel__text">
        {eyebrow ? (
          <span className="deck-event-hero-panel__eyebrow">{eyebrow}</span>
        ) : null}
        <span className="deck-event-hero-panel__title">{title}</span>
        {description ? (
          <span className="deck-event-hero-panel__description">
            {description}
          </span>
        ) : null}
      </span>

      {trailing ? (
        <span className="deck-event-hero-panel__trailing">{trailing}</span>
      ) : null}
    </>
  )

  const classes = cx(
    'deck-event-hero-panel',
    href && 'deck-event-hero-panel--interactive',
    className,
  )

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        {...(props as HTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={classes} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {content}
    </div>
  )
}
