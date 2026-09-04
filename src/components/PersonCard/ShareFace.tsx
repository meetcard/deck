import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { CopyField } from '../CopyField/CopyField'
import { QRCode } from '../QRCode/QRCode'
import { DownloadIcon, LinkedInIcon, LinkIcon } from './cardIcons'

/**
 * What a card hands over — and, by the same type, what an `EventHero` does.
 *
 * One vocabulary across every surface that can be shared: `value`, the code,
 * the two callbacks. A card's link and an event's link are the same kind of
 * thing, and two names for it is how two surfaces start drifting apart.
 */
export interface CardShare {
  /**
   * The short link — displayed, copied, and the code's accessible name, e.g.
   * `"meetcard.io/ben@meetcard"`.
   */
  value: string
  /**
   * The single line a recipient reads before deciding to follow it — "Ben
   * Ackles, Builder at MeetCard". It is a snapshot of whichever profile is
   * being shared, which is why the company's share says the company.
   */
  summary?: ReactNode
  /** Rendered QR image. Deck encodes nothing — generate it upstream. */
  qrSrc?: string
  /** An inline `<svg>` of the code, as an alternative to `qrSrc`. */
  qr?: ReactNode
  /** Omit to hide the download action. */
  onDownloadQr?: () => void
  /** Omit to hide the LinkedIn action. */
  onShareLinkedIn?: () => void
}

/**
 * The card, showing what it would hand over.
 *
 * Not a dialog. Sharing a card is the card doing something, so it happens on
 * the card: the same object, same size, same colours, showing its code
 * instead of its face. A panel over the top would put the thing being shared
 * behind the thing describing it.
 */
export function ShareFace({
  share,
  heading,
}: {
  share: CardShare
  /** The eyebrow above "Scan or copy the link" — "Share this card". */
  heading: string
}) {
  return (
    <div className="deck-person-card__body">
      <div className="deck-person-card__portrait">
        <div className="deck-person-card__qr">
          <QRCode value={share.value} src={share.qrSrc} size="lg">
            {share.qr}
          </QRCode>
        </div>
      </div>

      <div className="deck-person-card__content">
        <span className="deck-person-card__eyebrow">{heading}</span>
        <p className="deck-person-card__name deck-person-card__share-title">
          Scan or copy the link
        </p>

        <CopyField
          label="Share link"
          value={share.value}
          icon={<LinkIcon />}
          className="deck-person-card__link"
        />

        {share.summary ? (
          <p className="deck-person-card__detail deck-person-card__summary">
            {share.summary}
          </p>
        ) : null}

        {share.onDownloadQr || share.onShareLinkedIn ? (
          <div className="deck-person-card__footer">
            {share.onDownloadQr ? (
              <Button iconStart={<DownloadIcon />} onClick={share.onDownloadQr}>
                Download QR
              </Button>
            ) : null}
            {share.onShareLinkedIn ? (
              <Button
                variant="secondary"
                iconStart={<LinkedInIcon />}
                onClick={share.onShareLinkedIn}
              >
                Share on LinkedIn
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
