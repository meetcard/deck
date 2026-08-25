import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
// Shared `.deck-choice` layout and field label/description/error styles.
// Imported directly because Switch does not render <Field>.
import '../Field/Field.css'
import './Switch.css'

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode
  description?: ReactNode
}

/**
 * An immediate on/off toggle.
 *
 * Use a Switch when the change applies straight away (for example, "Discoverable
 * by email"). If the value only takes effect on submit, use a `Checkbox`.
 *
 * Built on `input[type="checkbox"]` with `role="switch"`, so it keeps native
 * keyboard and form behaviour while announcing as a switch.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, id: providedId, className, disabled, ...props },
  ref,
) {
  const { id, descriptionId, describedBy } = useFieldIds({
    id: providedId,
    hasDescription: Boolean(description),
    hasError: false,
  })

  return (
    <div
      className={cx(
        'deck-switch-row',
        disabled && 'deck-choice--disabled',
      )}
    >
      <span className="deck-switch">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          disabled={disabled}
          aria-describedby={describedBy}
          className={cx('deck-switch__input', className)}
          {...props}
        />
        <span className="deck-switch__thumb" aria-hidden="true" />
      </span>

      <div className="deck-switch-row__text">
        <label htmlFor={id} className="deck-choice__label">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="deck-choice__description">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
})
