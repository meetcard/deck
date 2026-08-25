import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import { Field, type ControlSize } from '../Field/Field'
import './Input.css'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Accessible name. Use `hideLabel` if the design has no visible label. */
  label: ReactNode
  description?: ReactNode
  /** Message shown below the field; also sets `aria-invalid`. */
  error?: ReactNode
  size?: ControlSize
  hideLabel?: boolean
  /** Decorative leading adornment, e.g. a search or currency glyph. */
  iconStart?: ReactNode
  /** Class applied to the wrapping field rather than the `<input>`. */
  fieldClassName?: string
}

/**
 * A single-line text field.
 *
 * The label is a required prop rather than something you remember to add —
 * an unlabelled input is the most common form accessibility failure.
 *
 * @example
 * <Input label="Work email" type="email" placeholder="ada@meetcard.com" />
 * <Input label="Company" error="Company is required" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    description,
    error,
    size = 'md',
    hideLabel = false,
    iconStart,
    id: providedId,
    required,
    className,
    fieldClassName,
    ...props
  },
  ref,
) {
  const { id, descriptionId, errorId, describedBy } = useFieldIds({
    id: providedId,
    hasDescription: Boolean(description),
    hasError: Boolean(error),
  })

  const input = (
    <input
      ref={ref}
      id={id}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      className={cx(
        'deck-control',
        `deck-control--${size}`,
        'deck-input',
        Boolean(iconStart) && 'deck-input--with-icon',
        className,
      )}
      {...props}
    />
  )

  return (
    <Field
      htmlFor={id}
      label={label}
      description={description}
      error={error}
      descriptionId={descriptionId}
      errorId={errorId}
      required={required}
      hideLabel={hideLabel}
      className={fieldClassName}
    >
      {iconStart ? (
        <span className="deck-input__wrapper">
          <span className="deck-input__icon" aria-hidden="true">
            {iconStart}
          </span>
          {input}
        </span>
      ) : (
        input
      )}
    </Field>
  )
})
