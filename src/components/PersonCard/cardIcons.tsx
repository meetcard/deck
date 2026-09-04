/*
 * The card's own glyphs.
 *
 * Hand-drawn rather than imported: `src/components` ships in the published
 * bundle and stays free of runtime dependencies — icon sets belong to the
 * composition layer. 1.3–1.5 is the house stroke on a 16 grid.
 *
 * Sized in `em` so each one takes the size of whatever control it is set in,
 * and the card's scaling carries them along with everything else.
 */

const base = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
}

export const LockIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
)

export const PencilIcon = () => (
  <svg {...base}>
    <path d="M11.2 2.3a1.5 1.5 0 0 1 2.1 2.1l-7.2 7.2-2.8.7.7-2.8 7.2-7.2Z" />
  </svg>
)

export const CloseIcon = () => (
  <svg {...base} strokeWidth={1.5}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

export const ArrowLeftIcon = () => (
  <svg {...base} strokeWidth={1.5}>
    <path d="M12.5 8h-9M7 3.5 2.5 8 7 12.5" />
  </svg>
)

/*
 * The Share affordance wears a QR code rather than the usual three connected
 * nodes.
 *
 * The nodes glyph is a promise about a menu — pick a destination, send it
 * somewhere. That is not what this button does. It turns the card over to its
 * code, to be held up and scanned by the person standing in front of you, and
 * a picture of the thing you are about to see is a better description of that
 * than a diagram of a network you are not going to touch.
 *
 * Drawn to Lucide's `qr-code` on Deck's 16 grid rather than scaled down from
 * its 24: two thirds of a 24-unit coordinate is a fractional one, and at the
 * size these render that lands the finder squares off the pixel.
 */
export const QrCodeIcon = () => (
  <svg {...base}>
    <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
    <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
    <path d="M9 9h2v2" />
    <path d="M13.5 9h.01" />
    <path d="M13.5 12v1.5H12" />
    <path d="M9 13.5h.01" />
  </svg>
)

export const LinkIcon = () => (
  <svg {...base}>
    <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 0 0-3.5-3.5l-.5.5" />
    <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 0 0 3.5 3.5l.5-.5" />
  </svg>
)

export const DownloadIcon = () => (
  <svg {...base}>
    <path d="M8 2.5v7M5 7l3 3 3-3" />
    <path d="M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
  </svg>
)

export const LinkedInIcon = () => (
  <svg {...base}>
    <path d="M10.5 6.5A3 3 0 0 1 13.5 9.5v4h-2.5v-4a.75.75 0 0 0-1.5 0v4H7v-4a3 3 0 0 1 3.5-3Z" />
    <rect x="2.5" y="6.5" width="2.5" height="7" />
    <circle cx="3.75" cy="3.25" r="1.25" />
  </svg>
)

export const GlobeIcon = () => (
  <svg {...base}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M2.5 8h11" />
    <path d="M8 2.5a9 9 0 0 1 0 11 9 9 0 0 1 0-11Z" />
  </svg>
)

export const PinIcon = () => (
  <svg {...base}>
    <path d="M8 14s4.5-4 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 10 8 14 8 14Z" />
    <circle cx="8" cy="6.5" r="1.75" />
  </svg>
)
