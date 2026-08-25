import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
// Shared `.deck-choice` layout and field label/description/error styles.
// Imported directly because Checkbox does not render <Field>.
import '../Field/Field.css'
import './Checkbox.css'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  /**
   * Renders the mixed state. Maps to the DOM `indeterminate` property, which
   * has no HTML attribute equivalent, and sets `aria-checked="mixed"`.
   */
  indeterminate?: boolean
}

/**
 * A single checkbox with its label.
 *
 * The tick is an overlaid `<svg>` rather than a `background-image`, so it
 * inherits the on-color token and stays correct in both themes.
 *
 * @example
 * <Checkbox label="Add to CRM" defaultChecked />
 * <Checkbox label="Select all" indeterminate />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      label,
      description,
      error,
      indeterminate = false,
      id: providedId,
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    // `indeterminate` is a DOM property with no attribute equivalent.
    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate
    }, [indeterminate])

    const { id, descriptionId, errorId, describedBy } = useFieldIds({
      id: providedId,
      hasDescription: Boolean(description),
      hasError: Boolean(error),
    })

    return (
      <div className={cx('deck-choice', disabled && 'deck-choice--disabled')}>
        <span className="deck-checkbox__control">
          <input
            ref={innerRef}
            type="checkbox"
            id={id}
            disabled={disabled}
            aria-checked={indeterminate ? 'mixed' : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cx('deck-checkbox', className)}
            {...props}
          />
          <svg
            className="deck-checkbox__mark"
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              className="deck-checkbox__tick"
              d="M3.5 8.5l3 3 6-6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="deck-checkbox__dash"
              d="M4 8h8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <label htmlFor={id} className="deck-choice__label">
          {label}
        </label>

        {description ? (
          <p id={descriptionId} className="deck-choice__description">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="deck-choice__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
