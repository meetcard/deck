import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import './MeetCard.css'

export interface MeetCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card holder's full name. */
  name: string
  /** Job title or role, e.g. "Head of Partnerships". */
  title?: string
  company?: string
  /** Photo. Falls back to initials. */
  avatarSrc?: string
  /** Short personal line shown under the identity block. */
  tagline?: string
  /** `brand` is the signature green card; `paper` is the light variant. */
  tone?: 'brand' | 'paper'
  /** Action row, typically Buttons or IconButtons. */
  actions?: ReactNode
  /** Slot in the top-right, e.g. a company logo or QR code. */
  aside?: ReactNode
}

/**
 * The flagship object of the product: a person's digital business card.
 *
 * This is the physical-card metaphor made concrete — a fixed aspect, a
 * tactile surface, and an identity block that reads at a glance. Where
 * `PersonCard` is a row in a list, `MeetCard` is the artifact you hand over.
 *
 * @example
 * <MeetCard
 *   name="Ada Lovelace"
 *   title="Head of Partnerships"
 *   company="MeetCard"
 *   tagline="Let's find the overlap."
 *   actions={<Button variant="secondary" size="sm">Share</Button>}
 * />
 */
export const MeetCard = forwardRef<HTMLDivElement, MeetCardProps>(
  function MeetCard(
    {
      name,
      title,
      company,
      avatarSrc,
      tagline,
      tone = 'brand',
      actions,
      aside,
      className,
      ...props
    },
    ref,
  ) {
    const subtitle = [title, company].filter(Boolean).join(' · ')

    return (
      <div
        ref={ref}
        className={cx(
          'deck-meetcard',
          `deck-meetcard--${tone}`,
          // Re-points descendant tokens to the fill's guaranteed on-color.
          tone === 'brand' && 'deck-solid-surface',
          className,
        )}
        {...props}
      >
        <div className="deck-meetcard__top">
          <Avatar name={name} src={avatarSrc} size="lg" decorative />
          {aside ? <div className="deck-meetcard__aside">{aside}</div> : null}
        </div>

        <div className="deck-meetcard__identity">
          <Heading level={3} size="lg" className="deck-meetcard__name">
            {name}
          </Heading>
          {subtitle ? (
            <Text size="sm" className="deck-meetcard__subtitle">
              {subtitle}
            </Text>
          ) : null}
        </div>

        {tagline ? (
          <Text size="sm" className="deck-meetcard__tagline">
            {tagline}
          </Text>
        ) : null}

        {actions ? (
          <div className="deck-meetcard__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
