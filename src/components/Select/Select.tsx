import { forwardRef } from 'react'
import type { ReactNode, SelectHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import { Field, type ControlSize } from '../Field/Field'
import './Select.css'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children'> {
  label: ReactNode
  options: SelectOption[]
  description?: ReactNode
  error?: ReactNode
  size?: ControlSize
  hideLabel?: boolean
  /** Renders a non-selectable first option, for empty-state selects. */
  placeholder?: string
  fieldClassName?: string
}

/**
 * A dropdown built on the native `<select>`.
 *
 * Native on purpose: it gets platform keyboard behaviour, mobile pickers, and
 * screen reader support for free. The chevron is a real `<svg>` rather than a
 * CSS `background-image`, so automated contrast checks can still resolve the
 * control's background colour.
 *
 * @example
 * <Select label="Card type" options={[{ value: 'work', label: 'Work' }]} />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    description,
    error,
    size = 'md',
    hideLabel = false,
    placeholder,
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
      <span className="deck-select__wrapper">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'deck-control',
            `deck-control--${size}`,
            'deck-select',
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="deck-select__chevron"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Field>
  )
})
