import { forwardRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Button } from '../Button/Button'
import { CopyField } from '../CopyField/CopyField'
import { Link } from '../Link/Link'
import { QRCode } from '../QRCode/QRCode'
import type { CardTheme } from '../PersonCard/PersonCard'
import type { CardShare } from '../PersonCard/ShareFace'
import './EventHero.css'

/*
 * Hand-drawn, like every glyph in `src/components`: the published bundle
 * carries no icon set. Deliberately the same drawings the card's own share
 * face uses — the link, the download and the LinkedIn mark on a 16 grid at
 * the house 1.3 stroke — because a code handed over from a hero and one
 * handed over from a card are the same gesture and should not be two looks.
 */
const glyph = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
}

const CloseIcon = () => (
  <svg {...glyph} strokeWidth={1.5}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

const LinkIcon = () => (
  <svg {...glyph}>
    <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.5.5" />
    <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.5-.5" />
  </svg>
)

const DownloadIcon = () => (
  <svg {...glyph}>
    <path d="M8 2.5v7M5 7l3 3 3-3" />
    <path d="M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
  </svg>
)

const LinkedInIcon = () => (
  <svg {...glyph}>
    <path d="M10.5 6.5A3 3 0 0 1 13.5 9.5v4h-2.5v-4a.75.75 0 0 0-1.5 0v4H7v-4a3 3 0 0 1 3.5-3Z" />
    <rect x="2.5" y="6.5" width="2.5" height="7" />
    <circle cx="3.75" cy="3.25" r="1.25" />
  </svg>
)

/** Where the hero's caps line sits in the document outline. */
export type EventHeroEyebrowElement = 'p' | 'h1' | 'h2'

/**
 * What the hero is currently showing: the event, or the code for it.
 *
 * Sharing is the event doing something, so it happens on the event — the
 * same object, same cover, same colours, showing its code instead of its
 * details. A dialog over the top would put the thing being shared behind the
 * thing describing it.
 */
export type EventHeroView = 'detail' | 'share'

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
  /**
   * The event's link, and what the hero shows when it is turned over to be
   * scanned.
   *
   * The same shape a card hands over, and deliberately the same type: an
   * event's link and a person's link are the same kind of thing, and two
   * names for it is how two surfaces start drifting apart.
   *
   * The hero does not raise the control — an event page puts "Share" in its
   * own row of actions, next to "Add to calendar" — so pass `view` alongside
   * it, or read `onViewChange` and let the hero keep its own.
   */
  share?: CardShare
  /** Which face the hero is showing. Omit to let it keep its own. */
  view?: EventHeroView
  /** The face it starts on. Default `"detail"`. */
  defaultView?: EventHeroView
  onViewChange?: (view: EventHeroView) => void
  /** Accessible name for the control that puts the code away. */
  closeShareLabel?: string
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
 * Given a `share`, the hero can turn to show the event's code in place of its
 * details — the same move a `PersonCard` makes, and for the same reason. The
 * name stays put while it does, so you can see what you are handing over and
 * the page keeps its heading.
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
      share,
      view,
      defaultView = 'detail',
      onViewChange,
      closeShareLabel = 'Close share',
      children,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const Name = `h${level}` as const

    const [selfView, setSelfView] = useState<EventHeroView>(defaultView)
    const currentView = view ?? selfView
    const setView = (next: EventHeroView) => {
      if (view === undefined) setSelfView(next)
      onViewChange?.(next)
    }
    const sharing = currentView === 'share' && Boolean(share)

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

        {/* One control in the corner, and which one it is says where you are:
            a pencil edits the event you are looking at, a cross puts the code
            away and gives the event back. */}
        {sharing ? (
          <div className="deck-event-hero__action">
            <button
              type="button"
              className="deck-event-hero__close"
              onClick={() => setView('detail')}
            >
              <CloseIcon />
              <span className="deck-visually-hidden">{closeShareLabel}</span>
            </button>
          </div>
        ) : action ? (
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
            {/* "Attending", "Soon" — facts about the event that are yours
                rather than the recipient's, so they go away with the rest of
                the details when the hero turns over. */}
            {badges && !sharing ? (
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

            {sharing && share ? (
              <div className="deck-event-hero__share">
                {/* Light in both themes, as `QRCode`'s own plate is: a scanner
                    needs a quiet zone, and the hero's ground is a photograph
                    under a wash of somebody's brand colour. */}
                <div className="deck-event-hero__qr">
                  <QRCode value={share.value} src={share.qrSrc} size="md">
                    {share.qr}
                  </QRCode>
                </div>

                <div className="deck-event-hero__share-body">
                  {/* Not a heading: the event's name above it is the hero's
                      heading whichever face is showing, and this is the
                      instruction for the plate beside it. */}
                  <p className="deck-event-hero__share-title">
                    Scan or copy the link
                  </p>

                  {share.summary ? (
                    <p className="deck-event-hero__share-summary">
                      {share.summary}
                    </p>
                  ) : null}

                  <CopyField
                    label="Share link"
                    value={share.value}
                    icon={<LinkIcon />}
                    size="sm"
                    className="deck-event-hero__link"
                  />

                  {share.onDownloadQr || share.onShareLinkedIn ? (
                    <div className="deck-event-hero__share-actions">
                      {share.onDownloadQr ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          iconStart={<DownloadIcon />}
                          onClick={share.onDownloadQr}
                        >
                          Download QR
                        </Button>
                      ) : null}
                      {share.onShareLinkedIn ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          iconStart={<LinkedInIcon />}
                          onClick={share.onShareLinkedIn}
                        >
                          Share on LinkedIn
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              children
            )}
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
