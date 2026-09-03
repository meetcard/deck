import { forwardRef, useState } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { CompanyFace } from './CompanyFace'
import type { CardCompanyProfile } from './CompanyFace'
import { ShareFace } from './ShareFace'
import type { CardShare } from './ShareFace'

export type { CardShare } from './ShareFace'
export type { CardCompanyProfile, CardCompanyPerson } from './CompanyFace'
import {
  ArrowLeftIcon,
  CloseIcon,
  LockIcon,
  PencilIcon,
  QrCodeIcon,
} from './cardIcons'
import './PersonCard.css'

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

/**
 * Which face of the card's front is showing.
 *
 * Not to be confused with the card's `back`, which is the physical reverse
 * and turns with `flipped`. These are all the front: the card is showing you
 * its face, its code, or the company it belongs to, and it turns between them
 * in place. What is written on the back of a card is a different thing from
 * what the front of it is currently saying.
 */
export type PersonCardView = 'profile' | 'share' | 'company' | 'company-share'

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
  /**
   * The card's link, and what turning it over to be scanned shows.
   *
   * Supplying it puts a Share control in the action row and makes the card
   * able to show its own code. Sharing a card is the card doing something,
   * so it happens on the card rather than in a dialog over it.
   */
  share?: CardShare
  /**
   * The company behind the card, reached from the company's name.
   *
   * With this, `company` becomes a control that turns the card to the
   * company's own face rather than a link somewhere else — you wondered who
   * they work for while holding their card, and the answer is on it.
   * `companyHref` still applies when there is no profile to turn to.
   */
  companyProfile?: CardCompanyProfile
  /** Which face the card is showing. Omit to let it keep its own. */
  view?: PersonCardView
  /** The face it starts on. Default `"profile"`. */
  defaultView?: PersonCardView
  onViewChange?: (view: PersonCardView) => void
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
      share,
      companyProfile,
      view,
      defaultView = 'profile',
      onViewChange,
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
    const hasActionRow = Boolean(contactActions || privateNote || share)

    const [selfView, setSelfView] = useState<PersonCardView>(defaultView)
    const currentView = view ?? selfView
    const setView = (next: PersonCardView) => {
      if (view === undefined) setSelfView(next)
      onViewChange?.(next)
    }

    /*
     * Closing a share goes back to whichever profile raised it, not to the
     * person's card every time. Sharing the company from the company's own
     * face and landing back on someone's portrait would lose your place in a
     * card you had deliberately turned over.
     */
    const sharing = currentView === 'share' || currentView === 'company-share'
    const activeShare =
      currentView === 'company-share' ? companyProfile?.share : share

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

    /*
     * One control in the corner, and which one it is says where you are.
     * A pencil edits the card you are looking at; a cross puts a code away
     * and gives the card back; an arrow returns from the company to the
     * person whose card led you there.
     */
    const cornerAction = sharing ? (
      <button
        type="button"
        className="deck-person-card__corner-button"
        onClick={() => setView(currentView === 'company-share' ? 'company' : 'profile')}
      >
        <CloseIcon />
        <span className="deck-visually-hidden">Close share</span>
      </button>
    ) : currentView === 'company' ? (
      <button
        type="button"
        className="deck-person-card__corner-button"
        onClick={() => setView('profile')}
      >
        <ArrowLeftIcon />
        <span className="deck-visually-hidden">Back to {name}'s card</span>
      </button>
    ) : onEdit ? (
      <button
        type="button"
        className="deck-person-card__corner-button"
        onClick={onEdit}
      >
        <PencilIcon />
        <span className="deck-visually-hidden">{editLabel}</span>
      </button>
    ) : null

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
          {/* The chip says which of your cards this is, so it belongs to the
              card's own face and not to what the card is currently showing. */}
          {kind && currentView === 'profile' ? (
            <span className="deck-person-card__kind">{kind}</span>
          ) : null}

          {cornerAction}
        </div>

        {sharing && activeShare ? (
          <ShareFace
            share={activeShare}
            heading={
              currentView === 'company-share' && companyProfile
                ? `Share ${companyProfile.name}`
                : 'Share this card'
            }
          />
        ) : currentView === 'company' && companyProfile ? (
          <CompanyFace
            profile={companyProfile}
            onShare={
              companyProfile.share ? () => setView('company-share') : undefined
            }
          />
        ) : (
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
                  {contactActions || share ? (
                    <div className="deck-person-card__contact-actions">
                      {contactActions}
                      {/* The card's own, not the caller's. Sharing turns this
                          card over, and only the card knows how to do that. */}
                      {share ? (
                        <button
                          type="button"
                          className="deck-person-card__share"
                          onClick={() => setView('share')}
                        >
                          <QrCodeIcon />
                          Share
                        </button>
                      ) : null}
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
                      {/* Three things the company's name can be, and they are
                          not interchangeable: a face of this card, a link off
                          it, or neither. Turning the card wins when there is
                          a profile to turn to, because it keeps you holding
                          the card you were reading. */}
                      {companyProfile ? (
                        <button
                          type="button"
                          className="deck-person-card__company-link"
                          onClick={() => setView('company')}
                        >
                          {company}
                        </button>
                      ) : companyHref ? (
                        <a
                          href={companyHref}
                          className="deck-person-card__company-link"
                        >
                          {company}
                        </a>
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
        )}
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
