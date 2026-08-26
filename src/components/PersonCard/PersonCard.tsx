import { forwardRef } from 'react'
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
      className,
      ...cardProps
    },
    ref,
  ) {
    const hasMetaRow = Boolean(tagline || privateNote)
    const hasDetailPill = Boolean(title || company || location)

    return (
      <Card
        ref={ref}
        as="article"
        surface="elevated"
        padding={24}
        className={cx('deck-person-card', className)}
        {...cardProps}
      >
        <div className="deck-person-card__header">
          <div className="deck-person-card__avatar-wrap">
            <span className="deck-person-card__avatar-glow" aria-hidden="true" />
            <Avatar name={name} src={avatarSrc} size="xl" decorative />
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
                onClick={privateNote.onClick}
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
                <Text as="span" size="sm" tone="muted">
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
  },
)
