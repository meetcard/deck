import { forwardRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Card, type CardProps } from '../Card/Card'
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

export interface PersonCardPrivateNote {
  /** Defaults to "Your private note". */
  label?: string
  /** Shows an unread indicator dot when true. */
  hasContent?: boolean
  onClick?: () => void
}

export interface PersonCardProps
  extends Omit<CardProps, 'children' | 'title'> {
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
   *
   * Without this the card renders exactly as before, unwrapped, and
   * `privateNote.onClick` is left to the caller.
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
 * Sized to roughly a physical business card's proportions. Height is
 * content-driven rather than a hard CSS `aspect-ratio`, so a long name or a
 * populated footer never gets clipped.
 *
 * @example
 * <PersonCard
 *   name="Ben Ackles"
 *   title="Builder"
 *   company="MeetCard"
 *   companyHref="/companies/meetcard"
 *   location="Boulder, Colorado"
 *   tagline="What a lovable guy"
 *   footer={<>
 *     <Button iconStart={<CalendarIcon />}>Book with me</Button>
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
    const hasMetaRow = Boolean(tagline || privateNote)
    const hasDetailPill = Boolean(title || company || location)

    const [selfFlipped, setSelfFlipped] = useState(false)
    const isControlled = flipped !== undefined
    const isFlipped = isControlled ? flipped : selfFlipped

    const setFlipped = (next: boolean) => {
      if (!isControlled) setSelfFlipped(next)
      onFlippedChange?.(next)
    }

    const face = (
      <Card
        ref={ref}
        as="article"
        surface="elevated"
        padding={20}
        className={cx('deck-person-card', className)}
        {...cardProps}
      >
        <div className="deck-person-card__header">
          <div className="deck-person-card__avatar-wrap">
            <span className="deck-person-card__avatar-glow" aria-hidden="true" />
            <Avatar name={name} src={avatarSrc} size="lg" decorative />
          </div>

          <div className="deck-person-card__identity">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              tone="brand"
              className="deck-person-card__eyebrow"
            >
              {eyebrow}
            </Text>
            <Heading
              level={3}
              size="lg"
              family="serif"
              truncate
              className="deck-person-card__name"
            >
              {name}
            </Heading>
          </div>

          {contactActions ? (
            <div className="deck-person-card__contact-actions">
              {contactActions}
            </div>
          ) : null}
        </div>

        {hasMetaRow ? (
          <div className="deck-person-card__meta-row">
            {tagline ? (
              <Text
                size="sm"
                tone="muted"
                truncate
                className="deck-person-card__tagline"
              >
                {tagline}
              </Text>
            ) : null}

            {privateNote ? (
              <button
                type="button"
                className="deck-person-card__note"
                aria-expanded={back ? isFlipped : undefined}
                onClick={
                  back
                    ? () => setFlipped(true)
                    : privateNote.onClick
                }
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
          </div>
        ) : null}

        {hasDetailPill ? (
          <div className="deck-person-card__pill">
            {title ? (
              <Text as="span" size="sm" weight="medium">
                {title}
              </Text>
            ) : null}
            {title && company ? (
              <Text as="span" size="sm" tone="muted">
                {' '}
                at{' '}
              </Text>
            ) : null}
            {company ? (
              companyHref ? (
                <Link
                  href={companyHref}
                  tone="default"
                  underline="always"
                  className="deck-person-card__company-link"
                >
                  {company}
                </Link>
              ) : (
                <Text as="span" size="sm" weight="medium">
                  {company}
                </Text>
              )
            ) : null}
            {location ? (
              <>
                {title || company ? (
                  <span
                    className="deck-person-card__pill-divider"
                    aria-hidden="true"
                  />
                ) : null}
                {/* Named rather than matched as `:last-child`, because
                    portrait gives the place a line of its own and the last
                    child is the company whenever there is no place. */}
                <Text
                  as="span"
                  size="sm"
                  tone="muted"
                  className="deck-person-card__place"
                >
                  {location}
                </Text>
              </>
            ) : null}
          </div>
        ) : null}

        {footer ? (
          <div className="deck-person-card__footer">{footer}</div>
        ) : null}
      </Card>
    )

    // Unwrapped when there is no other side, so every existing use keeps its
    // exact markup and the article stays the card's own root element.
    if (!back) return face

    return (
      <div
        className={cx(
          'deck-person-card-flip',
          isFlipped && 'deck-person-card-flip--flipped',
        )}
      >
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
      </div>
    )
  },
)
