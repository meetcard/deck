import { useId } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './ChoiceGroup.css'

export interface ChoiceOption {
  value: string
  label: ReactNode
  /** Secondary line inside the control, e.g. "Fastest to schedule". */
  description?: ReactNode
  /**
   * Consequence of picking this option, revealed under the group once it is
   * selected — e.g. "Routes to Priya Shah". Surfacing it on selection rather
   * than up front keeps the choices scannable while still explaining what
   * the choice does before the person commits.
   */
  hint?: ReactNode
  disabled?: boolean
}

export type ChoiceGroupVariant = 'pill' | 'tile'

export interface ChoiceGroupProps {
  label: ReactNode
  options: ChoiceOption[]
  /** `value` of the selected option. Leave undefined for no selection. */
  value?: string
  onChange?: (value: string) => void
  /** Shared radio name. Generated when omitted. */
  name?: string
  /**
   * `pill` hugs its content for short labels that wrap freely; `tile` lays
   * the options out in equal-width columns for comparable choices.
   */
  variant?: ChoiceGroupVariant
  /** Column count for `tile`. Collapses to one column on narrow screens. */
  columns?: 2 | 3 | 4
  description?: ReactNode
  /** When present the group renders in its error state. */
  error?: ReactNode
  required?: boolean
  /** Keep the label for screen readers but hide it visually. */
  hideLabel?: boolean
  className?: string
}

/**
 * A single choice from a small set, laid out as pills or tiles.
 *
 * The booking flow asks the same shape of question three times — what to
 * discuss, how long, which team member — so this is one component rather
 * than three. Built on native radios in a `<fieldset>`, so arrow keys move
 * between options and the group is announced with its legend.
 *
 * Reach for `RadioGroup` instead when the options need long descriptions
 * and read as a form question; reach for this when they read as a choice
 * the person makes at a glance.
 *
 * @example
 * <ChoiceGroup
 *   label="What are you looking to discuss?"
 *   required
 *   value={topic}
 *   onChange={setTopic}
 *   options={[
 *     { value: 'sales', label: 'Sales inquiry', hint: 'Routes to Priya Shah' },
 *     { value: 'demo', label: 'Product demo' },
 *   ]}
 * />
 */
export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  name,
  variant = 'pill',
  columns = 3,
  description,
  error,
  required,
  hideLabel,
  className,
}: ChoiceGroupProps) {
  const generatedName = useId()
  const groupName = name ?? generatedName
  const descriptionId = `${groupName}-description`
  const errorId = `${groupName}-error`
  const selected = options.find((option) => option.value === value)

  return (
    <fieldset
      className={cx('deck-choice-group', className)}
      aria-describedby={
        cx(description && descriptionId, error && errorId) || undefined
      }
    >
      <legend
        className={cx(
          'deck-choice-group__legend',
          hideLabel && 'deck-visually-hidden',
        )}
      >
        {label}
        {required && (
          <span className="deck-choice-group__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </legend>

      {description && (
        <p id={descriptionId} className="deck-choice-group__description">
          {description}
        </p>
      )}

      <div
        className={cx(
          'deck-choice-group__options',
          `deck-choice-group__options--${variant}`,
        )}
        style={
          variant === 'tile'
            ? ({ '--deck-choice-columns': columns } as React.CSSProperties)
            : undefined
        }
      >
        {options.map((option) => {
          const id = `${groupName}-${option.value}`
          return (
            <label
              key={option.value}
              className={cx(
                'deck-choice-group__option',
                option.disabled && 'deck-choice-group__option--disabled',
              )}
              htmlFor={id}
            >
              <input
                id={id}
                className="deck-visually-hidden deck-choice-group__input"
                type="radio"
                name={groupName}
                value={option.value}
                checked={value === option.value}
                disabled={option.disabled}
                aria-invalid={error ? true : undefined}
                onChange={() => onChange?.(option.value)}
              />
              <span className="deck-choice-group__control">
                <span className="deck-choice-group__label">{option.label}</span>
                {option.description && (
                  <span className="deck-choice-group__option-description">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </div>

      {/*
        Announced politely so the routing consequence reaches screen readers
        on selection, without interrupting the rest of the question.
      */}
      <div className="deck-choice-group__hint" aria-live="polite">
        {selected?.hint}
      </div>

      {error && (
        <p id={errorId} className="deck-choice-group__error" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}
