import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import { Field, type ControlSize } from '../Field/Field'
import './PasswordInput.css'

/**
 * Which password the field is asking for.
 *
 * This is the whole reason the prop exists: `current` and `new` drive
 * different `autocomplete` values, and getting it wrong is the difference
 * between a password manager offering to fill and offering to generate.
 */
export type PasswordPurpose = 'current' | 'new'

const AUTOCOMPLETE: Record<PasswordPurpose, string> = {
  current: 'current-password',
  new: 'new-password',
}

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Accessible name. Use `hideLabel` if the design has no visible label. */
  label: ReactNode
  description?: ReactNode
  /** Message shown below the field; also sets `aria-invalid`. */
  error?: ReactNode
  size?: ControlSize
  hideLabel?: boolean
  /**
   * Sets `autocomplete`. `current` for sign-in, `new` for sign-up and
   * password changes — a `new` field is what prompts a password manager to
   * generate rather than fill.
   */
  purpose?: PasswordPurpose
  /**
   * Offer the reveal control. Turn it off only where showing the value would
   * be the wrong default — a field filled on a shared or projected screen.
   */
  revealable?: boolean
  /** Accessible name for the reveal control while the value is masked. */
  revealLabel?: string
  /** Accessible name for the reveal control while the value is visible. */
  concealLabel?: string
  /** Class applied to the wrapping field rather than the `<input>`. */
  fieldClassName?: string
}

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M1.5 8s2.4-4 6.5-4 6.5 4 6.5 4-2.4 4-6.5 4S1.5 8 1.5 8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="8"
      cy="8"
      r="1.9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
)

const EyeOffIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6.3 4.2A6.9 6.9 0 0 1 8 4c4.1 0 6.5 4 6.5 4a12 12 0 0 1-2.1 2.5M3.6 5.5A11.9 11.9 0 0 0 1.5 8s2.4 4 6.5 4c.9 0 1.7-.2 2.4-.5M6.7 6.7a1.9 1.9 0 0 0 2.6 2.6M2 2l12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * A password field with a reveal control.
 *
 * Distinct from `Input type="password"` rather than a variant of it, because
 * a password field is three things a plain input is not: it needs the right
 * `autocomplete` to cooperate with password managers (`purpose`), it needs a
 * way to see what you typed on a phone keyboard, and that reveal has to
 * *announce* — a control that silently changes whether a password is on
 * screen is exactly the kind of state a screen reader user needs told.
 *
 * The reveal is a button inside the control, so it is reachable in tab order
 * immediately after the field itself. Toggling keeps focus on the button and
 * leaves the value untouched.
 *
 * @example
 * <PasswordInput label="Password" purpose="current" />
 * <PasswordInput label="Password" purpose="new" description="At least 12 characters." />
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      label,
      description,
      error,
      size = 'md',
      hideLabel = false,
      purpose = 'current',
      revealable = true,
      revealLabel = 'Show password',
      concealLabel = 'Hide password',
      id: providedId,
      required,
      className,
      fieldClassName,
      ...props
    },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    const [revealed, setRevealed] = useState(false)
    // Separate from `revealed` so the status line is empty on first render:
    // a live region that already says "Password is hidden" when the form
    // loads announces nothing when it later changes to the same meaning.
    const [announcement, setAnnouncement] = useState('')

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
        <div className="deck-password-input">
          <input
            ref={innerRef}
            id={id}
            type={revealed ? 'text' : 'password'}
            autoComplete={AUTOCOMPLETE[purpose]}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cx(
              'deck-control',
              `deck-control--${size}`,
              'deck-password-input__control',
              revealable && 'deck-password-input__control--revealable',
              className,
            )}
            {...props}
          />

          {revealable ? (
            <button
              type="button"
              className="deck-password-input__toggle"
              // The name flips rather than carrying `aria-pressed`: "Hide
              // password" says what the control does next, which is what a
              // one-shot toggle in a form needs to convey. The status line
              // below carries the state that just changed.
              aria-label={revealed ? concealLabel : revealLabel}
              aria-controls={id}
              onClick={() => {
                const next = !revealed
                setRevealed(next)
                setAnnouncement(
                  next ? 'Password is visible' : 'Password is hidden',
                )
              }}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : null}
        </div>

        {/* Whether the password is on screen is the consequence of pressing
            the toggle, and nothing else announces it. Silent until pressed. */}
        {revealable ? (
          <span className="deck-visually-hidden" role="status">
            {announcement}
          </span>
        ) : null}
      </Field>
    )
  },
)
