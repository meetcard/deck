import type { SVGProps } from 'react'

export type MarkProps = SVGProps<SVGSVGElement>

/**
 * The MeetCard mark — two overlapping cards, Deck's icon-only brand symbol.
 *
 * Fixed brand colors driven by the Signal Green primitive, not the semantic
 * text tokens: the mark must always read as "MeetCard green," in both
 * themes, rather than adapting like body content does.
 *
 * This is the "Full Color — Light" variant (for light-ish or neutral
 * surfaces). No dark/mono variant has been supplied yet — see the note in
 * Foundations docs.
 *
 * @example
 * <AppBar brand={<Mark aria-hidden="true" style={{ height: 24 }} />} />
 */
export function Mark(props: MarkProps) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MeetCard"
      {...props}
    >
      <rect
        width="42"
        height="67"
        rx="5"
        transform="matrix(-0.961262 0.275637 0.275637 0.961262 82.2724 15.0163)"
        fill="var(--deck-primitive-signal-green)"
        fillOpacity="0.5"
      />
      <rect
        width="42"
        height="67"
        rx="5"
        transform="matrix(-0.981627 -0.190809 -0.190809 0.981627 53.2724 17.0163)"
        fill="var(--deck-primitive-signal-green)"
      />
    </svg>
  )
}
