import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Field.css'

/** Shared sizing scale for the text-entry controls (Input, Textarea, Select). */
export type ControlSize = 'sm' | 'md' | 'lg'

export interface FieldProps {
  /** Must match the `id` of the control rendered as `children`. */
  htmlFor: string
  label: ReactNode
  description?: ReactNode
  /** When present the field renders in its error state. */
  error?: ReactNode
  /** Id given to the description element, for `aria-describedby`. */
  descriptionId?: string
  /** Id given to the error element, for `aria-describedby`. */
  errorId?: string
  required?: boolean
  /** Keep the label for screen readers but hide it visually. */
  hideLabel?: boolean
  className?: string
  children: ReactNode
}

/**
 * Label, description, and error scaffolding shared by every Deck form control.
 *
 * Exported so product teams can wire up bespoke controls with exactly the
 * same markup, spacing, and announcement behaviour as the built-in ones.
 * The control itself owns the `aria-describedby`/`aria-invalid` wiring —
 * `Field` supplies the ids to point at.
 */
export function Field({
  htmlFor,
  label,
  description,
  error,
  descriptionId,
  errorId,
  required = false,
  hideLabel = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cx('deck-field', className)}>
      <label
        htmlFor={htmlFor}
        className={cx(
          'deck-field__label',
          hideLabel && 'deck-visually-hidden',
        )}
      >
        {label}
        {required ? (
          <span className="deck-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {children}

      {description ? (
        <p id={descriptionId} className="deck-field__description">
          {description}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="deck-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
