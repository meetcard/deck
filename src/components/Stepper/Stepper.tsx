import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Stepper.css'

export interface Step {
  /** Stable key, typically the route segment, e.g. "purpose". */
  id: string
  label: ReactNode
  /** Link for a completed step, enabling back-navigation. */
  href?: string
}

export interface StepperProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  steps: Step[]
  /** `id` of the step in progress. */
  currentStepId: string
  /** Accessible name for the progress nav. */
  label?: string
  /** Called when a completed step is activated, for non-link navigation. */
  onSelect?: (stepId: string) => void
}

/**
 * Progress through a multi-step flow.
 *
 * Built for the booking wizard, where each step is its own route
 * (`purpose → availability → details → booked`) so a booking can be linked
 * or resumed at any stage.
 *
 * Completed steps are navigable; upcoming ones are inert. State is conveyed
 * with text and `aria-current`, not only the marker's color, and the whole
 * list is a `<nav>` with an ordered list so the sequence is announced.
 *
 * @example
 * <Stepper currentStepId="availability" steps={[
 *   { id: 'purpose', label: 'Purpose', href: './purpose' },
 *   { id: 'availability', label: 'Time' },
 *   { id: 'details', label: 'Details' },
 *   { id: 'booked', label: 'Confirmed' },
 * ]} />
 */
export const Stepper = forwardRef<HTMLElement, StepperProps>(function Stepper(
  { steps, currentStepId, label = 'Progress', onSelect, className, ...props },
  ref,
) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId)

  return (
    <nav
      ref={ref}
      aria-label={label}
      className={cx('deck-stepper', className)}
      {...props}
    >
      <ol className="deck-stepper__list">
        {steps.map((step, index) => {
          const state =
            index < currentIndex
              ? 'complete'
              : index === currentIndex
                ? 'current'
                : 'upcoming'
          const interactive = state === 'complete' && (step.href || onSelect)

          const content = (
            <>
              <span className="deck-stepper__marker" aria-hidden="true">
                {state === 'complete' ? (
                  <svg viewBox="0 0 16 16" focusable="false">
                    <path
                      d="M3.5 8.5l3 3 6-6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="deck-stepper__label">
                {step.label}
                {/* Spells out state so it is not carried by color alone. */}
                <span className="deck-visually-hidden">
                  {state === 'complete'
                    ? ' (completed)'
                    : state === 'current'
                      ? ' (current step)'
                      : ' (not yet reached)'}
                </span>
              </span>
            </>
          )

          return (
            <li
              key={step.id}
              className={cx('deck-stepper__step', `deck-stepper__step--${state}`)}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {interactive ? (
                step.href ? (
                  <a className="deck-stepper__action" href={step.href}>
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="deck-stepper__action"
                    onClick={() => onSelect?.(step.id)}
                  >
                    {content}
                  </button>
                )
              ) : (
                <span className="deck-stepper__action">{content}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
})
