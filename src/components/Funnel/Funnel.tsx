import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Funnel.css'

export interface FunnelStage {
  /** Stable key. Falls back to the index. */
  id?: string
  /** The step, as a thing that happened — "Link clicks", "Contacts saved". */
  label: ReactNode
  /** How many got this far. Must be countable in the same unit throughout. */
  value: number
  /** What the step actually means, in the reader's terms. */
  description?: ReactNode
}

export interface FunnelProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  stages: FunnelStage[]
  /** Names the funnel for assistive tech, e.g. "Conversion funnel". */
  label: string
  /**
   * What the first stage counts, for the "% of views" reading — a noun, not
   * a sentence. Defaults to "total".
   */
  unit?: string
  formatValue?: (value: number) => string
}

const format = (value: number) => value.toLocaleString()
const percent = (ratio: number) => `${Math.round(ratio * 100)}%`

/**
 * Stages of a conversion, each measured twice: against the step before it,
 * and against the top of the funnel.
 *
 * Both readings are shown because they answer different questions and people
 * reliably confuse them. *From previous* is the one you can act on — it says
 * which step is leaking. *Of total* is the one that sets expectations — 3% of
 * views becoming meetings sounds bad until you know 17% of saved contacts do.
 * A funnel that reports only one of the two invites the wrong conclusion.
 *
 * Percentages are derived here rather than passed in, so the arithmetic
 * cannot drift from the counts printed beside it.
 *
 * Bars are scaled to the first stage, which makes the narrowing itself the
 * picture. Every figure is also written out, so nothing is locked in the bar.
 *
 * @example
 * <Funnel label="Conversion funnel" unit="views" stages={[
 *   { label: 'Profile views', value: 1684, description: 'Everyone who opened your card' },
 *   { label: 'Link clicks', value: 742, description: 'Tapped a link or CTA' },
 * ]} />
 */
export const Funnel = forwardRef<HTMLUListElement, FunnelProps>(function Funnel(
  { stages, label, unit = 'total', formatValue = format, className, ...props },
  ref,
) {
  /* Negative counts are nonsense in a funnel and would draw a bar running
     backwards, so they are clamped rather than trusted. */
  const values = stages.map((stage) => Math.max(stage.value, 0))
  const top = values[0] ?? 0

  return (
    <ul
      ref={ref}
      className={cx('deck-funnel', className)}
      aria-label={label}
      {...props}
    >
      {stages.map((stage, index) => {
        const value = values[index] ?? 0
        const previous = values[index - 1]
        const ratio = top > 0 ? value / top : 0

        /* The first stage has nothing to fall from, and a stage after an
           empty one has nothing to divide by — both say so in words rather
           than printing a misleading 0% or an Infinity. */
        const fromPrevious =
          index === 0
            ? 'starting point'
            : previous && previous > 0
              ? `${percent(value / previous)} from previous`
              : 'no previous stage to compare'

        return (
          <li
            key={stage.id ?? index}
            className="deck-funnel__stage"
            style={{ '--deck-funnel-ratio': String(ratio) } as CSSProperties}
          >
            <div className="deck-funnel__heading">
              <span className="deck-funnel__label">{stage.label}</span>
              <span className="deck-funnel__value">{formatValue(stage.value)}</span>
            </div>

            <div className="deck-funnel__track" aria-hidden="true">
              <div className="deck-funnel__bar" />
            </div>

            <p className="deck-funnel__figures">
              {fromPrevious}
              <span className="deck-funnel__separator" aria-hidden="true">
                {' · '}
              </span>
              <span className="deck-visually-hidden">, </span>
              {percent(ratio)} of {unit}
            </p>

            {stage.description ? (
              <p className="deck-funnel__description">{stage.description}</p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
})
