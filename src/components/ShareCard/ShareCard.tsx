import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '../Avatar/Avatar'
import { CoverCard, type CoverCardProps } from '../CoverCard/CoverCard'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import { cx } from '../../lib/cx'
import './ShareCard.css'

export interface ShareCardProps
  extends Omit<CoverCardProps, 'children' | 'title'> {
  /** Whose card this is. */
  name: string
  /** Role and company on one line — "Product Lead at Rivermark". */
  detail?: string
  /** Where they are. */
  location?: string
  /** Reachable details, one per line, under the name. */
  contacts?: string[]
  avatarSrc?: string
  /** Small caps above the title. */
  eyebrow?: string
  /** The instruction. "Scan to exchange cards" by default. */
  title?: string
  /**
   * The code itself — a `QRCode`, or whatever your generator returns. Held
   * in a white tile, because a QR code has to be dark-on-light to scan and
   * this card is neither.
   */
  children: ReactNode
}

/**
 * The card you hold up to be scanned.
 *
 * A card rather than a dialog, which is what separates it from `ShareSheet`:
 * this is the artifact — the same fixed box as a person's card, with the
 * same cover behind it — shown full-screen to someone pointing a phone at
 * it. `ShareSheet` is the surface you *raise* to share a link; this is what
 * the other person looks at.
 *
 * The code sits on white whatever the card is wearing. A QR code is read by
 * a camera expecting dark modules on a light field, and a code tinted to
 * match the card is a code that does not scan.
 *
 * @example
 * <ShareCard
 *   name="Nora Whitfield"
 *   detail="Product Lead at Rivermark"
 *   location="Denver, Colorado"
 *   contacts={['nora@rivermark.com', '(303) 555-0142']}
 *   coverSrc={cover}
 * >
 *   <QRCode value="meetcard.io/nora" />
 * </ShareCard>
 */
export const ShareCard = forwardRef<HTMLElement, ShareCardProps>(
  function ShareCard(
    {
      name,
      detail,
      location,
      contacts,
      avatarSrc,
      eyebrow = 'Exchange cards',
      title = 'Scan to exchange cards',
      children,
      className,
      ...surfaceProps
    },
    ref,
  ) {
    return (
      <CoverCard
        ref={ref}
        className={cx('deck-share-card', className)}
        {...surfaceProps}
      >
        <Text size="xs" className="deck-share-card__eyebrow">
          {eyebrow}
        </Text>

        <Heading level={2} size="sm" className="deck-share-card__title">
          {title}
        </Heading>

        {/* White, always. The camera reading this expects dark modules on a
            light field, and a code tinted to match the card is one that does
            not scan. */}
        <div className="deck-share-card__code">{children}</div>

        <div className="deck-share-card__identity">
          <Avatar name={name} src={avatarSrc} size="md" decorative />
          <div className="deck-share-card__lines">
            <Text size="sm" weight="semibold">
              {name}
            </Text>
            {detail ? <Text size="sm">{detail}</Text> : null}
            {location ? <Text size="sm">{location}</Text> : null}
            {contacts?.map((contact) => (
              <Text key={contact} size="sm">
                {contact}
              </Text>
            ))}
          </div>
        </div>
      </CoverCard>
    )
  },
)
