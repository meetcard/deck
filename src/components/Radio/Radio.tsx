import { createContext, forwardRef, useContext, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
// Shared `.deck-choice` layout and field label/description/error styles.
// Imported directly because Radio does not render <Field>.
import '../Field/Field.css'
import './Radio.css'

interface RadioGroupContextValue {
  name: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: ReactNode
  description?: ReactNode
  value: string
}

/**
 * One option within a `RadioGroup`.
 *
 * Can also stand alone if you pass `name` yourself, but grouping is strongly
 * preferred — it is what gives screen readers the set semantics.
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    description,
    value,
    id: providedId,
    name,
    checked,
    onChange,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const group = useContext(RadioGroupContext)
  const { id, descriptionId, describedBy } = useFieldIds({
    id: providedId,
    hasDescription: Boolean(description),
    hasError: false,
  })

  const isDisabled = disabled ?? group?.disabled
  const resolvedChecked = group ? group.value === value : checked

  return (
    <div className={cx('deck-choice', isDisabled && 'deck-choice--disabled')}>
      <input
        ref={ref}
        type="radio"
        id={id}
        value={value}
        name={name ?? group?.name}
        checked={resolvedChecked}
        disabled={isDisabled}
        aria-describedby={describedBy}
        className={cx('deck-radio', className)}
        onChange={(event) => {
          group?.onChange?.(event.target.value)
          onChange?.(event)
        }}
        {...props}
      />
      <label htmlFor={id} className="deck-choice__label">
        {label}
      </label>
      {description ? (
        <p id={descriptionId} className="deck-choice__description">
          {description}
        </p>
      ) : null}
    </div>
  )
})

export interface RadioGroupProps {
  /** Group label, rendered as a `<legend>`. */
  label: ReactNode
  children: ReactNode
  /** Shared form control name. Generated when omitted. */
  name?: string
  value?: string
  onChange?: (value: string) => void
  description?: ReactNode
  error?: ReactNode
  disabled?: boolean
  hideLabel?: boolean
  className?: string
}

/**
 * A set of mutually exclusive options.
 *
 * Renders a real `<fieldset>`/`<legend>`, which is what tells assistive tech
 * the options belong together, and distributes `name`/`value` to its
 * `Radio` children so each option stays a one-liner.
 *
 * @example
 * <RadioGroup label="Card visibility" value={v} onChange={setV}>
 *   <Radio value="public" label="Anyone with the link" />
 *   <Radio value="private" label="Only me" />
 * </RadioGroup>
 */
export function RadioGroup({
  label,
  children,
  name,
  value,
  onChange,
  description,
  error,
  disabled,
  hideLabel = false,
  className,
}: RadioGroupProps) {
  const generatedName = useId()
  const { descriptionId, errorId, describedBy } = useFieldIds({
    hasDescription: Boolean(description),
    hasError: Boolean(error),
  })

  return (
    <fieldset
      className={cx('deck-radio-group', className)}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
    >
      <legend
        className={cx(
          'deck-radio-group__legend',
          hideLabel && 'deck-visually-hidden',
        )}
      >
        {label}
      </legend>

      {description ? (
        <p id={descriptionId} className="deck-field__description">
          {description}
        </p>
      ) : null}

      <RadioGroupContext.Provider
        value={{ name: name ?? generatedName, value, onChange, disabled }}
      >
        <div className="deck-radio-group__options">{children}</div>
      </RadioGroupContext.Provider>

      {error ? (
        <p id={errorId} className="deck-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
