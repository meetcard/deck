import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { Mark } from '../../foundations/brand'
import { cx } from '../../lib/cx'
import './QRCode.css'

export type QRCodeSize = 'sm' | 'md' | 'lg' | 'xl'

export interface QRCodeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The URL the code encodes, e.g. `meetcard.io/ben@meetcard`.
   *
   * Not rendered. It is the code's accessible name, so someone who cannot
   * scan still learns where it goes. Surfaces that want the link readable —
   * `ShareSheet` does — put it next to the code as copyable text, which is
   * more useful than a caption nobody can select.
   */
  value: string
  /** Rendered QR image, e.g. a generated PNG or SVG data URI. */
  src?: string
  /** Inline `<svg>` alternative to `src`, for a locally rendered code. */
  children?: ReactNode
  size?: QRCodeSize
  /**
   * The centre mark. Defaults to MeetCard's, since every code Deck draws is
   * a MeetCard code. Pass `null` for a bare matrix.
   *
   * It sits directly on the code with nothing behind it, because generators
   * reserve the centre when a logo is configured. A code generated *without*
   * that reservation has modules under the mark and should be given `null`.
   */
  logo?: ReactNode
}

/**
 * A QR code — the matrix, plated, with the mark in the middle.
 *
 * Deck encodes nothing. This draws a code you supply, either as `src` or as
 * inline SVG, which is why there is no QR library in the dependency list and
 * why `src/components` stays dependency-free. Generate the code upstream.
 *
 * It draws only the code. It used to also carry a caption above and the URL
 * beneath, which made an atom responsible for the layout around it — three
 * jobs, and two of them the parent's. The surfaces that need a heading or a
 * readable link compose them.
 *
 * @example
 * <QRCode value="meetcard.io/ben@meetcard" size="lg">
 *   <MatrixSvg />
 * </QRCode>
 */
export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
  { value, src, children, size = 'md', logo = <Mark />, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('deck-qrcode', `deck-qrcode--${size}`, className)}
      {...props}
    >
      <div className="deck-qrcode__code">
        {src ? (
          <img
            className="deck-qrcode__image"
            src={src}
            alt={`QR code for ${value}`}
          />
        ) : (
          /* Inline codes are decorative markup; the label carries the
             meaning for assistive tech. */
          <div
            className="deck-qrcode__inline"
            role="img"
            aria-label={`QR code for ${value}`}
          >
            {children}
          </div>
        )}

        {logo ? (
          <span className="deck-qrcode__logo" aria-hidden="true">
            {logo}
          </span>
        ) : null}
      </div>
    </div>
  )
})
