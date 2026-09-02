import { forwardRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './PersonCard.css'

const LockIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect
      x="3.5"
      y="7"
      width="9"
      height="6.5"
      rx="1.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
)

const PencilIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M11.2 2.3a1.5 1.5 0 0 1 2.1 2.1l-7.2 7.2-2.8.7.7-2.8 7.2-7.2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * A card's own palette.
 *
 * Every control the card carries reads these rather than the page's tokens, so
 * a card can be branded without the surface around it changing colour. Two
 * values are enough: the rest of the card's greys, glass and rings are derived
 * in CSS from them and stay consistent across every card in a pile.
 *
 * Set to real colours — a hex, an `oklch()`, a `color-mix()` — not to Deck
 * tokens. A card's brand belongs to whoever owns the card, and the whole point
 * is that it survives the page's theme.
 *
 * `primary` must be dark. The card sets everything on it in white, and the
 * wash is mostly that colour, so a pale brand takes the type down with it —
 * measured, the eyebrow clears 4.5:1 against Deck's own green with 0.12 to
 * spare and fails against anything appreciably lighter. A brand that is
 * naturally pale wants its dark shade here, the one it uses for its own type.
 */
export interface CardTheme {
  /**
   * The card's brand colour. Washes the photo behind the content, and is what
   * the primary button's label is set in.
   */
  primary?: string
  /** A second brand colour, for accents. Falls back to `primary`. */
  accent?: string
}

export interface PersonCardPrivateNote {
  /** Defaults to "Your private note". */
  label?: string
  /** Shows an unread indicator dot when true. */
  hasContent?: boolean
  onClick?: () => void
}

export interface PersonCardProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  name: string
  /**
   * Small caps label above the name. Deck renders it upper-cased via CSS,
   * so pass natural case — defaults to `"Meet"`.
   */
  eyebrow?: string
  avatarSrc?: string
  /** Short status line under the identity row, e.g. "What a lovable guy". */
  tagline?: string
  /** Role or function, e.g. "Builder". */
  title?: string
  company?: string
  /** Makes `company` a link, styled as a dotted-underline reference. */
  companyHref?: string
  location?: string
  /**
   * The card's palette. Omit for Deck's own, which is what an unbranded card
   * gets.
   */
  theme?: CardTheme
  /**
   * Which of your selves this card is — "Business", "Personal". Rendered as a
   * chip in the top corner, where a printed card would carry nothing at all:
   * it is a fact about your set of cards rather than about you, and it is the
   * one thing on the card the recipient never sees.
   */
  kind?: ReactNode
  /** A company mark, set at the top of the card. */
  logoSrc?: string
  /** Names the mark for assistive tech. Defaults to `company`. */
  logoAlt?: string
  /**
   * The photograph the card is built on, blurred behind the brand wash.
   * Defaults to `avatarSrc` — the same portrait, out of focus, which is what
   * gives every card a ground of its own without anyone choosing one. Pass
   * `null` for the flat brand colour.
   */
  backdropSrc?: string | null
  /** Adds a pencil in the top corner. Only the card's owner should get one. */
  onEdit?: () => void
  /** Accessible name for that pencil. Defaults to "Edit card". */
  editLabel?: string
  /** A dismissible, private annotation only the card's owner can see. */
  privateNote?: PersonCardPrivateNote
  /** Circular icon buttons for contact methods — email, LinkedIn, share. */
  contactActions?: ReactNode
  /** Primary/secondary actions along the bottom edge. */
  footer?: ReactNode
  /**
   * The card's other face — normally a `PrivateNote`. Supplying it turns the
   * private-note control into a flip: a business card has two sides, and the
   * things you write about someone belong on the back of theirs rather than
   * in a panel somewhere else.
   */
  back?: ReactNode
  /** Controlled flip state. Omit to let the card manage its own. */
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
}

/**
 * The professional business card — the artifact you hand over, and the
 * canonical child of `CardPile`.
 *
 * A 3.5x2in object, fixed at that ratio and scaled as one thing. Everything
 * inside is a proportion of the card's own width rather than a step on the
 * spacing scale, so a card is the same object at 320px and at 760px instead of
 * a box whose contents drift apart as it grows. That is the one place in Deck
 * where the token scale does not apply, and it is deliberate: this component
 * is a picture of a physical thing, and physical things do not reflow.
 *
 * The card is dark and photographic — the person's portrait, blurred, under a
 * wash of their own brand colour. Every control placed on it, including
 * `Button`s and `IconButton`s passed through `contactActions` and `footer`,
 * re-reads Deck's action tokens from the card's palette, so they come out as
 * glass on the card without the caller having to know that.
 *
 * @example
 * <PersonCard
 *   name="Ben Ackles"
 *   title="Builder"
 *   company="MeetCard"
 *   companyHref="/companies/meetcard"
 *   location="Boulder, Colorado"
 *   tagline="What a lovable guy"
 *   kind="Business"
 *   theme={{ primary: '#2E6E5B', accent: '#C66A4A' }}
 *   footer={<>
 *     <Button iconStart={<CalendarIcon />}>Book a time</Button>
 *     <Button variant="secondary" iconStart={<HandshakeIcon />}>
 *       Exchange cards
 *     </Button>
 *   </>}
 * />
 */
export const PersonCard = forwardRef<HTMLElement, PersonCardProps>(
  function PersonCard(
    {
      name,
      eyebrow = 'Meet',
      avatarSrc,
      tagline,
      title,
      company,
      companyHref,
      location,
      theme,
      kind,
      logoSrc,
      logoAlt,
      backdropSrc,
      onEdit,
      editLabel = 'Edit card',
      privateNote,
      contactActions,
      footer,
      back,
      flipped,
      onFlippedChange,
      className,
      ...cardProps
    },
    ref,
  ) {
    const hasDetail = Boolean(title || company || location)
    const hasActionRow = Boolean(contactActions || privateNote)

    const [selfFlipped, setSelfFlipped] = useState(false)
    const isControlled = flipped !== undefined
    const isFlipped = isControlled ? flipped : selfFlipped

    const setFlipped = (next: boolean) => {
      if (!isControlled) setSelfFlipped(next)
      onFlippedChange?.(next)
    }

    // `backdropSrc === null` is the way to ask for no photograph at all, which
    // is why this is not `backdropSrc ?? avatarSrc` guarded on truthiness.
    const backdrop = backdropSrc === undefined ? avatarSrc : backdropSrc

    const palette = {
      '--deck-card-brand': theme?.primary,
      '--deck-card-accent': theme?.accent ?? theme?.primary,
    } as CSSProperties

    const face = (
      <article
        ref={ref}
        className={cx('deck-person-card', className)}
        {...cardProps}
      >
        {/* The ground: the portrait out of focus, under a wash of the card's
            own colour. Decorative — the photograph is already on the card at
            a size you can see, and announcing it twice says nothing. */}
        <div className="deck-person-card__ground" aria-hidden="true">
          {backdrop ? (
            <img className="deck-person-card__ground-photo" src={backdrop} alt="" />
          ) : null}
          <span className="deck-person-card__ground-wash" />
        </div>

        <div className="deck-person-card__corners">
          {kind ? <span className="deck-person-card__kind">{kind}</span> : null}
          {onEdit ? (
            <button
              type="button"
              className="deck-person-card__edit"
              onClick={onEdit}
            >
              <PencilIcon />
              <span className="deck-visually-hidden">{editLabel}</span>
            </button>
          ) : null}
        </div>

        <div className="deck-person-card__body">
          <div className="deck-person-card__portrait">
            {logoSrc ? (
              <img
                className="deck-person-card__logo"
                src={logoSrc}
                alt={logoAlt ?? company ?? ''}
              />
            ) : null}
            <div className="deck-person-card__avatar-wrap">
              <span className="deck-person-card__avatar-glow" aria-hidden="true" />
              <Avatar name={name} src={avatarSrc} size="lg" decorative />
            </div>
          </div>

          <div className="deck-person-card__content">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              className="deck-person-card__eyebrow"
            >
              {eyebrow}
            </Text>
            <Heading level={3} size="lg" truncate className="deck-person-card__name">
              {name}
            </Heading>
            {tagline ? (
              <Text truncate className="deck-person-card__tagline">
                {tagline}
              </Text>
            ) : null}

            {hasActionRow ? (
              <div className="deck-person-card__actions">
                {privateNote ? (
                  <button
                    type="button"
                    className="deck-person-card__note"
                    aria-expanded={back ? isFlipped : undefined}
                    onClick={back ? () => setFlipped(true) : privateNote.onClick}
                  >
                    <LockIcon />
                    <span>{privateNote.label ?? 'Your private note'}</span>
                    {privateNote.hasContent ? (
                      <span
                        className="deck-person-card__note-dot"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                ) : null}
                {contactActions ? (
                  <div className="deck-person-card__contact-actions">
                    {contactActions}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* One sentence rather than a row of chips. Role, employer and
                place are a phrase people already know how to read — "Builder
                at MeetCard in Boulder, Colorado" — and setting them as three
                fielded values separated by rules makes a database record of
                something that is a line of prose on every printed card. */}
            {hasDetail ? (
              <p className="deck-person-card__detail">
                {title ? <span>{title}</span> : null}
                {company ? (
                  <>
                    {title ? ' at ' : null}
                    {companyHref ? (
                      <Link
                        href={companyHref}
                        tone="default"
                        underline="always"
                        className="deck-person-card__company-link"
                      >
                        {company}
                      </Link>
                    ) : (
                      <span>{company}</span>
                    )}
                  </>
                ) : null}
                {location ? (
                  <>
                    {title || company ? ' in ' : null}
                    <span className="deck-person-card__place">{location}</span>
                  </>
                ) : null}
              </p>
            ) : null}

            {footer ? (
              <div className="deck-person-card__footer">{footer}</div>
            ) : null}
          </div>
        </div>
      </article>
    )

    /*
     * The shell is what makes the scaling work: it is the container the card's
     * own metrics are a percentage of. It has to be an element the card owns,
     * because an element cannot be a container for itself, and the card is
     * dropped into piles, grids and pages that know nothing about any of this.
     */
    return (
      <div
        className={cx(
          'deck-person-card-shell',
          Boolean(back) && 'deck-person-card-flip',
          Boolean(back) && isFlipped && 'deck-person-card-flip--flipped',
        )}
        style={palette}
      >
        {back ? (
          <div className="deck-person-card-flip__inner">
            {/* Both faces occupy one grid cell, so the shell is as tall as the
                taller of the two and the card does not resize mid-turn. The
                hidden face is inert as well as hidden: `backface-visibility`
                only stops it being painted, it would still take focus. */}
            <div
              className="deck-person-card-flip__face"
              aria-hidden={isFlipped ? true : undefined}
              inert={isFlipped ? true : undefined}
            >
              {face}
            </div>
            <div
              className="deck-person-card-flip__face deck-person-card-flip__face--back"
              aria-hidden={isFlipped ? undefined : true}
              inert={isFlipped ? undefined : true}
            >
              {back}
            </div>
          </div>
        ) : (
          face
        )}
      </div>
    )
  },
)
