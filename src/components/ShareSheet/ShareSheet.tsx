import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { CopyField } from '../CopyField/CopyField'
import { QRCode } from '../QRCode/QRCode'
import { Sheet } from '../Sheet/Sheet'
import './ShareSheet.css'

/* Hand-drawn rather than imported: `src/components` ships in the published
   bundle and stays free of runtime dependencies. Icon sets belong to the
   composition layer. 1.5 is the house stroke at this 16 grid. */
const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const LinkIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.6.6" />
    <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.6-.6" />
  </svg>
)

const DownloadIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M8 2v7.5M5 7l3 3 3-3M2.5 12.5v1h11v-1" />
  </svg>
)

const LinkedInIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <path d="M5 7v4M5 4.8v.01M8 11V8.6a1.6 1.6 0 0 1 3 0V11" />
  </svg>
)

export interface ShareSheetProps {
  open: boolean
  onClose: () => void
  /**
   * The short link — displayed, copied, and named in the code's accessible
   * description, e.g. `"meetcard.io/ben@meetcard"`.
   */
  value: string
  /**
   * The noun in "Share this …". Defaults to `card`, which is what a person's
   * card, a company profile, and a booking flow all use — only an event says
   * anything else. Passing a whole title instead would let the four surfaces
   * drift apart, which is the thing this component exists to prevent.
   */
  subject?: ReactNode
  /** Rendered QR image. See the note on `children` — Deck encodes nothing. */
  qrSrc?: string
  /**
   * An inline `<svg>` of the code, as an alternative to `qrSrc`.
   *
   * `QRCode` is presentational: it draws a plate around an image you supply
   * and never generates one. Deck has no QR library and adding one would be
   * the first runtime dependency in `src/components`. Generate the code
   * upstream and pass it in.
   */
  children?: ReactNode
  /** Omit to hide the download action. */
  onDownloadQr?: () => void
  /** Omit to hide the LinkedIn action. */
  onShareLinkedIn?: () => void
}

/**
 * The share dialog, wherever something can be shared.
 *
 * One component rather than one per surface, because the product already
 * treats it as one: a person's card, a company profile, a booking flow and an
 * event all raise the same dialog, and three of those four call the thing
 * being shared "this card". Only the noun and the link change, which is why
 * `subject` is a noun slotted into a fixed sentence rather than a free title.
 *
 * An organism, not a molecule: it wraps `Sheet`, which is itself an organism,
 * and a molecule is a grouping of atoms. It composes `Sheet` + `CopyField`
 * (molecule) + `QRCode` and two `Button`s (atoms).
 *
 * Inherits `Sheet`'s placement, so it is a bottom sheet on a phone and a
 * centred panel from 640px up — which is where you are when you are sharing
 * a link, and where a thumb is when you are sharing a code.
 *
 * The code carries the link as its accessible description, so someone who
 * cannot scan still reaches the destination. `showValue` is off because the
 * copy row beneath already prints it, and twice is noise.
 *
 * @example
 * <ShareSheet open={open} onClose={close} value="meetcard.io/ben@meetcard">
 *   <SomeGeneratedSvg />
 * </ShareSheet>
 */
export function ShareSheet({
  open,
  onClose,
  value,
  subject = 'card',
  qrSrc,
  children,
  onDownloadQr,
  onShareLinkedIn,
}: ShareSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={<>Share this {subject}</>}
      description="Scan the code or share the short link."
      className="deck-share-sheet"
    >
      <div className="deck-share-sheet__body">
        <QRCode value={value} src={qrSrc} size="lg">
          {children}
        </QRCode>

        <CopyField label="Share link" value={value} icon={LinkIcon} />

        {onDownloadQr || onShareLinkedIn ? (
          <div className="deck-share-sheet__actions">
            {onDownloadQr ? (
              <Button
                variant="secondary"
                iconStart={DownloadIcon}
                onClick={onDownloadQr}
              >
                QR
              </Button>
            ) : null}
            {onShareLinkedIn ? (
              <Button
                variant="secondary"
                iconStart={LinkedInIcon}
                onClick={onShareLinkedIn}
              >
                LinkedIn
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Sheet>
  )
}
