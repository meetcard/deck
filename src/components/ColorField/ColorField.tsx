import { forwardRef, useId } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Field } from '../Field/Field'
import './ColorField.css'

export interface ColorFieldProps {
  /** What the colour is for, e.g. "Primary color". */
  label: ReactNode
  /**
   * The colour's name in the brand's own words — "Signal Green". Shown
   * beside the label, because `#2E6E5B` is not what anyone calls it.
   */
  colorName?: ReactNode
  /** Hex, `#rrggbb`. The swatch and the text field are two views of it. */
  value: string
  onValueChange?: (value: string) => void
  description?: ReactNode
  id?: string
  className?: string
}

/** `#2E6E5B` — what `<input type="color">` will accept back. */
const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value)

/**
 * A colour, picked or typed.
 *
 * Two controls over one value, because the two ways of choosing a colour are
 * genuinely different jobs: the swatch opens the platform's picker for
 * finding a colour, and the hex field is for entering one you already have —
 * which is how a brand colour actually arrives, out of a guidelines PDF.
 *
 * The text field takes what you type as you type it, and the swatch follows
 * only once the value is a complete hex. Anything else means a half-typed
 * `#2E6` snapping the swatch to black between keystrokes.
 *
 * @example
 * <ColorField
 *   label="Primary color"
 *   colorName="Signal Green"
 *   value={primary}
 *   onValueChange={setPrimary}
 * />
 */
export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  function ColorField(
    { label, colorName, value, onValueChange, description, id, className },
    ref,
  ) {
    const generated = useId()
    const fieldId = id ?? generated
    const swatchId = `${fieldId}-swatch`

    const change = (event: ChangeEvent<HTMLInputElement>) =>
      onValueChange?.(event.target.value)

    return (
      <Field
        htmlFor={fieldId}
        label={
          <>
            {label}
            {colorName ? (
              <span className="deck-color-field__name"> · {colorName}</span>
            ) : null}
          </>
        }
        description={description}
        className={cx('deck-color-field', className)}
      >
        <div className="deck-color-field__row">
          {/*
            Its own label rather than the field's: two inputs cannot share
            one `htmlFor`, and "Primary color swatch" is what this control
            is — the picker, not the value.
          */}
          <input
            id={swatchId}
            type="color"
            className="deck-color-field__swatch"
            aria-label={
              typeof label === 'string' ? `${label} swatch` : 'Colour swatch'
            }
            /* A partially typed hex would snap this to black; it waits for a
               complete one and keeps showing the last good colour. */
            value={isHex(value) ? value : '#000000'}
            onChange={change}
          />
          <input
            ref={ref}
            id={fieldId}
            type="text"
            className="deck-color-field__hex"
            spellCheck={false}
            autoComplete="off"
            value={value}
            onChange={change}
          />
        </div>
      </Field>
    )
  },
)
