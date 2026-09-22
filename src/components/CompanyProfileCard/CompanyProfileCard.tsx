import { forwardRef } from 'react'
import type { MouseEventHandler, ReactNode } from 'react'
import {
  AvatarGroup,
  type AvatarGroupPerson,
} from '../AvatarGroup/AvatarGroup'
import { CoverCard, type CoverCardProps } from '../CoverCard/CoverCard'
import { Heading, type HeadingLevel } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { cx } from '../../lib/cx'
import './CompanyProfileCard.css'

export interface CompanyProfileCardLink {
  label: string
  /** Decorative — `label` carries the meaning. */
  icon?: ReactNode
  /** Renders the pill as a link. Without it, the pill is a button. */
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  /**
   * Show the icon alone, with `label` as its accessible name. For a mark
   * everyone reads without a word beside it — LinkedIn's, say.
   */
  iconOnly?: boolean
}

export interface CompanyProfileCardProps
  extends Omit<CoverCardProps, 'children' | 'title'> {
  /** The company. The card's heading, spoken even when a logo shows it. */
  name: string
  /** The company's wordmark. Falls back to the name, set in type. */
  logoSrc?: string
  /** Heading level for the name. `2` by default. */
  level?: HeadingLevel
  /** Small caps above the tagline. "Company profile" by default. */
  eyebrow?: string
  /** What the company says about itself, big — "Meet people. Remember them." */
  tagline?: string
  /** A sentence under the tagline. The first thing to go when space runs out. */
  description?: string
  /** Website, location, socials, share — one pill each, on one row. */
  links?: CompanyProfileCardLink[]
  /** The people you can meet there, as a stack of faces. */
  people?: AvatarGroupPerson[]
  /** Accessible name for the faces. "People at {name}" by default. */
  peopleLabel?: string
  /**
   * Controls along the top edge — usually a back and an expand
   * `IconButton`. They sit at either end of the row.
   */
  actions?: ReactNode
}

/**
 * A company's own card — what you see when you turn a company-branded
 * person's card over, or open the company from it.
 *
 * Where `CompanyCard` is a company *in a list* — a logo, a line, a count of
 * people you know — this is the company speaking for itself: its wordmark,
 * its tagline, where to find it, and who works there, over the company's
 * cover photo. It is the same physical object as every other card in Deck:
 * a fixed 1.75:1 box lying down, 1:1.75 stood up.
 *
 * Lying down, the wordmark takes the left third and the words the right,
 * with a rule between them. Stood up, the wordmark heads the card.
 *
 * The box never grows. The tagline clamps, the description is the first
 * thing to go on a small card and the faces the second, and pills that run
 * out of room fade at the edge rather than wrapping the card taller.
 *
 * @example
 * <CompanyProfileCard
 *   name="MeetCard"
 *   logoSrc={wordmark}
 *   coverSrc={cover}
 *   tagline="Meet people. Remember them."
 *   links={[{ icon: <Globe />, label: 'meetcard.io', href: 'https://meetcard.io' }]}
 * />
 */
export const CompanyProfileCard = forwardRef<
  HTMLElement,
  CompanyProfileCardProps
>(function CompanyProfileCard(
  {
    name,
    logoSrc,
    level = 2,
    eyebrow = 'Company profile',
    tagline,
    description,
    links,
    people,
    peopleLabel,
    actions,
    className,
    ...surfaceProps
  },
  ref,
) {
  return (
    <CoverCard
      ref={ref}
      className={cx('deck-company-profile-card', className)}
      {...surfaceProps}
    >
      {actions ? (
        <div className="deck-company-profile-card__actions">{actions}</div>
      ) : null}

      <div className="deck-company-profile-card__brand">
        <Heading level={level} size="lg" className="deck-company-profile-card__name">
          {logoSrc ? (
            <img
              className="deck-company-profile-card__logo"
              src={logoSrc}
              alt={name}
            />
          ) : (
            name
          )}
        </Heading>
      </div>

      <span className="deck-company-profile-card__rule" aria-hidden="true" />

      <div className="deck-company-profile-card__body">
        <Text size="xs" className="deck-company-profile-card__eyebrow">
          {eyebrow}
        </Text>

        {tagline ? (
          <p className="deck-company-profile-card__tagline">{tagline}</p>
        ) : null}

        {description ? (
          <Text size="md" className="deck-company-profile-card__description">
            {description}
          </Text>
        ) : null}

        {links && links.length > 0 ? (
          <ul className="deck-company-profile-card__links">
            {links.map((link) => (
              <li key={link.label}>
                <Pill link={link} />
              </li>
            ))}
          </ul>
        ) : null}

        {people && people.length > 0 ? (
          <AvatarGroup
            className="deck-company-profile-card__people"
            people={people}
            max={3}
            size="sm"
            label={peopleLabel ?? `People at ${name}`}
          />
        ) : null}
      </div>
    </CoverCard>
  )
})

function Pill({ link }: { link: CompanyProfileCardLink }) {
  const className = cx(
    'deck-company-profile-card__pill',
    link.iconOnly && 'deck-company-profile-card__pill--icon-only',
  )
  const content = (
    <>
      {link.icon ? (
        <span className="deck-company-profile-card__pill-icon" aria-hidden="true">
          {link.icon}
        </span>
      ) : null}
      <span className={link.iconOnly ? 'deck-visually-hidden' : undefined}>
        {link.label}
      </span>
    </>
  )

  return link.href ? (
    <a className={className} href={link.href} onClick={link.onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className={className} onClick={link.onClick}>
      {content}
    </button>
  )
}
