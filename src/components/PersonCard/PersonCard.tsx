import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge, type BadgeTone } from '../Badge/Badge'
import { Card, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './PersonCard.css'

export interface PersonCardProps
  extends Omit<CardProps, 'children' | 'title'> {
  name: string
  title?: string
  company?: string
  avatarSrc?: string
  /** Short status pill, e.g. `{ label: 'Connected', tone: 'success' }`. */
  status?: { label: string; tone?: BadgeTone }
  /** Turns the name into a link and gives the whole card hover affordance. */
  href?: string
  /** Supporting line, e.g. "Met at SaaSConf · 3 days ago". */
  meta?: ReactNode
  /** Trailing controls, typically an IconButton or small Button. */
  actions?: ReactNode
}

/**
 * A person as they appear in a list or grid — search results, your network,
 * or suggested connections.
 *
 * Where `MeetCard` is the artifact you hand over, `PersonCard` is the
 * scannable row that points at it.
 *
 * @example
 * <PersonCard
 *   name="Ada Lovelace"
 *   title="Head of Partnerships"
 *   company="MeetCard"
 *   href="/people/ada"
 *   status={{ label: 'Connected', tone: 'success' }}
 * />
 */
export const PersonCard = forwardRef<HTMLElement, PersonCardProps>(
  function PersonCard(
    {
      name,
      title,
      company,
      avatarSrc,
      status,
      href,
      meta,
      actions,
      className,
      ...cardProps
    },
    ref,
  ) {
    const subtitle = [title, company].filter(Boolean).join(' · ')

    return (
      <Card
        ref={ref}
        as="article"
        interactive={Boolean(href)}
        className={cx('deck-person-card', className)}
        {...cardProps}
      >
        <div className="deck-person-card__row">
          <Avatar name={name} src={avatarSrc} size="md" decorative />

          <div className="deck-person-card__body">
            <div className="deck-person-card__heading">
              <Heading level={3} size="sm" truncate>
                {href ? (
                  <Link href={href} tone="default">
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </Heading>
              {status ? (
                <Badge tone={status.tone ?? 'neutral'} size="sm" dot>
                  {status.label}
                </Badge>
              ) : null}
            </div>

            {subtitle ? (
              <Text size="sm" tone="muted" truncate>
                {subtitle}
              </Text>
            ) : null}

            {meta ? (
              <Text size="xs" tone="muted" truncate>
                {meta}
              </Text>
            ) : null}
          </div>

          {actions ? (
            <div className="deck-person-card__actions">{actions}</div>
          ) : null}
        </div>
      </Card>
    )
  },
)
