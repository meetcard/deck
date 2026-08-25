import { forwardRef } from 'react'
import type { ReactNode } from 'react'
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
}

/**
 * A company as a card — used in company search, org pages, and the
 * "who do I know here?" surfaces.
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
      className,
      ...cardProps
    },
    ref,
  ) {
    return (
      <Card
        ref={ref}
        as="article"
        interactive={Boolean(href)}
        className={cx('deck-company-card', className)}
        {...cardProps}
      >
        <div className="deck-company-card__row">
          <Avatar
            name={name}
            src={logoSrc}
            size="md"
            shape="rounded"
            decorative
          />

          <div className="deck-company-card__body">
            <div className="deck-company-card__heading">
              <Heading level={3} size="sm" truncate>
                {href ? (
                  <Link href={href} tone="default">
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </Heading>
              {typeof connectionCount === 'number' ? (
                <Badge tone="brand" size="sm">
                  {connectionCount} connection
                  {connectionCount === 1 ? '' : 's'}
                </Badge>
              ) : null}
            </div>

            {industry ? (
              <Text size="sm" tone="muted" truncate>
                {industry}
              </Text>
            ) : null}

            {description ? (
              <Text size="sm" tone="muted">
                {description}
              </Text>
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
          </div>

          {actions ? (
            <div className="deck-company-card__actions">{actions}</div>
          ) : null}
        </div>
      </Card>
    )
  },
)
