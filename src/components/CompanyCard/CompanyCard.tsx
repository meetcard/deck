import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import {
  useCardOrientation,
  type CardOrientation,
} from '../../lib/cardOrientation'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Card, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './CompanyCard.css'

export interface CompanyCardProps
  extends Omit<CardProps, 'children' | 'title'> {
  name: string
  /** Sector or category, e.g. "Developer tools". */
  industry?: string
  /** Company logo. Falls back to the company's initial. */
  logoSrc?: string
  /** One-line positioning statement. */
  description?: string
  /** Website or profile URL — turns the name into a link. */
  href?: string
  /** Number of people you know there. Rendered as a badge. */
  connectionCount?: number
  /** Free-form tags, e.g. ["Series B", "Remote"]. */
  tags?: string[]
  actions?: ReactNode
  /**
   * Which way up the card sits. Default `responsive`: the surrounding
   * `CardPile`'s orientation if there is one, otherwise portrait on a phone
   * and landscape from `sm` up.
   */
  orientation?: CardOrientation
}

/**
 * A company as a card — the company-profile counterpart to `PersonCard`, and
 * the same physical object: a fixed 1.75:1 box lying down, 1:1.75 stood up,
 * portrait on a phone and landscape from `sm` up. The two sit side by side
 * in a pile without either looking like a different kind of thing.
 *
 * The box never grows. The name and industry truncate, the description
 * clamps, and tags that run out of room stop rather than wrapping the card
 * taller — a card is a fixed-size object, and what cannot fit on one does
 * not belong on one.
 *
 * Uses the `rounded` avatar shape, which reads as a logo rather than a person.
 *
 * @example
 * <CompanyCard
 *   name="MeetCard"
 *   industry="Developer tools"
 *   connectionCount={12}
 *   tags={['Series B', 'Remote']}
 * />
 */
export const CompanyCard = forwardRef<HTMLElement, CompanyCardProps>(
  function CompanyCard(
    {
      name,
      industry,
      logoSrc,
      description,
      href,
      connectionCount,
      tags,
      actions,
      orientation: preferredOrientation,
      className,
      ...cardProps
    },
    ref,
  ) {
    const orientation = useCardOrientation(preferredOrientation)

    return (
      <Card
        ref={ref}
        as="article"
        interactive={Boolean(href)}
        className={cx('deck-company-card', className)}
        data-card-orientation={orientation}
        {...cardProps}
      >
        <div className="deck-company-card__header">
          <Avatar
            name={name}
            src={logoSrc}
            size={orientation === 'portrait' ? 'lg' : 'md'}
            shape="rounded"
            decorative
          />

          <div className="deck-company-card__identity">
            <Heading level={3} size="sm" truncate>
              {href ? (
                <Link href={href} tone="default" underline="hover">
                  {name}
                </Link>
              ) : (
                name
              )}
            </Heading>
            {industry ? (
              <Text size="sm" tone="muted" truncate>
                {industry}
              </Text>
            ) : null}
          </div>
        </div>

        {description ? (
          <Text size="sm" tone="muted" className="deck-company-card__description">
            {description}
          </Text>
        ) : null}

        {/* Pinned to the bottom edge, so a card with a short description
            ends in the same place as one with a long one. */}
        <div className="deck-company-card__footer">
          {typeof connectionCount === 'number' ? (
            <Badge tone="brand" size="sm">
              {connectionCount} connection
              {connectionCount === 1 ? '' : 's'}
            </Badge>
          ) : null}

          {tags && tags.length > 0 ? (
            <ul className="deck-company-card__tags">
              {tags.map((tag) => (
                <li key={tag}>
                  <Badge tone="neutral" variant="outline" size="sm">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}

          {actions ? (
            <div className="deck-company-card__actions">{actions}</div>
          ) : null}
        </div>
      </Card>
    )
  },
)
