import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Badge, type BadgeTone } from '../Badge/Badge'
import { Card, CardFooter, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Link } from '../Link/Link'
import { Text } from '../Text/Text'
import './ContactCard.css'

export interface ContactDetail {
  /** Row label, e.g. "Email". */
  label: string
  /** Displayed value, e.g. "ada@meetcard.com". */
  value: string
  /** Makes the value actionable — `mailto:`, `tel:`, or a URL. */
  href?: string
}

export interface ContactCardProps
  extends Omit<CardProps, 'children' | 'title'> {
  name: string
  title?: string
  company?: string
  avatarSrc?: string
  /** Reachable details, rendered as a description list. */
  details?: ContactDetail[]
  /** Where and when you met — the context that makes a contact useful later. */
  metAt?: string
  /** Follow-up state, e.g. `{ label: 'Follow up', tone: 'warning' }`. */
  status?: { label: string; tone?: BadgeTone }
  /** Footer controls, typically Buttons. */
  actions?: ReactNode
}

/**
 * A saved contact, with their reachable details and follow-up state.
 *
 * This is the "after the handshake" view: `PersonCard` helps you find someone,
 * `ContactCard` helps you act on the relationship. Details render as a real
 * `<dl>` so the label/value pairing survives in a screen reader.
 *
 * @example
 * <ContactCard
 *   name="Ada Lovelace"
 *   company="MeetCard"
 *   metAt="Met at SaaSConf · 12 June"
 *   details={[{ label: 'Email', value: 'ada@meetcard.com', href: 'mailto:ada@meetcard.com' }]}
 *   status={{ label: 'Follow up', tone: 'warning' }}
 * />
 */
export const ContactCard = forwardRef<HTMLElement, ContactCardProps>(
  function ContactCard(
    {
      name,
      title,
      company,
      avatarSrc,
      details,
      metAt,
      status,
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
        className={cx('deck-contact-card', className)}
        {...cardProps}
      >
        <div className="deck-contact-card__header">
          <Avatar name={name} src={avatarSrc} size="lg" decorative />

          <div className="deck-contact-card__identity">
            <div className="deck-contact-card__heading">
              <Heading level={3} size="md" truncate>
                {name}
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

            {metAt ? (
              <Text size="xs" tone="muted">
                {metAt}
              </Text>
            ) : null}
          </div>
        </div>

        {details && details.length > 0 ? (
          <dl className="deck-contact-card__details">
            {details.map((detail) => (
              <div key={detail.label} className="deck-contact-card__detail">
                <dt className="deck-contact-card__detail-label">
                  {detail.label}
                </dt>
                <dd className="deck-contact-card__detail-value">
                  {detail.href ? (
                    <Link href={detail.href}>{detail.value}</Link>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {actions ? <CardFooter divided>{actions}</CardFooter> : null}
      </Card>
    )
  },
)
