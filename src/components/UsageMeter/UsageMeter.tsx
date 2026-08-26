import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './UsageMeter.css'

export interface UsageMeterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: ReactNode
  value: number
  max: number
  /** Fraction (0–1) at which the meter warns. Defaults to 0.8. */
  warnAt?: number
  /** Formats the "x of y" readout. Defaults to `${value} of ${max}`. */
  formatValue?: (value: number, max: number) => string
  /** Shown beneath the bar — typically the upgrade nudge. */
  footer?: ReactNode
}

/**
 * Consumption against a plan cap.
 *
 * Surfacing usage is how MeetCard triggers upgrades at the moment of realised
 * value rather than by withholding features — the Solo connections cap is the
 * primary case.
 *
 * Renders a real `role="meter"` with its ARIA value attributes, and states
 * the level in text, so the reading never depends on the bar's color.
 *
 * @example
 * <UsageMeter label="Connections" value={92} max={100}
 *   footer={<Button size="sm">Upgrade to Pro</Button>} />
 */
export const UsageMeter = forwardRef<HTMLDivElement, UsageMeterProps>(
  function UsageMeter(
    {
      label,
      value,
      max,
      warnAt = 0.8,
      formatValue = (v, m) => `${v} of ${m}`,
      footer,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const safeMax = max > 0 ? max : 1
    const ratio = Math.min(Math.max(value / safeMax, 0), 1)
    const level = ratio >= 1 ? 'full' : ratio >= warnAt ? 'warn' : 'ok'
    const readout = formatValue(value, max)

    return (
      <div
        ref={ref}
        className={cx('deck-usage-meter', className)}
        style={{ '--deck-usage-ratio': String(ratio), ...style } as CSSProperties}
        {...props}
      >
        <div className="deck-usage-meter__header">
          <span className="deck-usage-meter__label">{label}</span>
          <span className="deck-usage-meter__readout">{readout}</span>
        </div>

        <div
          className={cx(
            'deck-usage-meter__track',
            `deck-usage-meter__track--${level}`,
          )}
          role="meter"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={readout}
          aria-label={typeof label === 'string' ? label : undefined}
        >
          <div className="deck-usage-meter__fill" />
        </div>

        {level !== 'ok' ? (
          <p
            className={cx(
              'deck-usage-meter__status',
              `deck-usage-meter__status--${level}`,
            )}
          >
            {level === 'full'
              ? 'Limit reached'
              : `Approaching limit — ${readout} used`}
          </p>
        ) : null}

        {footer ? <div className="deck-usage-meter__footer">{footer}</div> : null}
      </div>
    )
  },
)
