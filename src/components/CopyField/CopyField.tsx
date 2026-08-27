import { useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import type { ControlSize } from '../Field/Field'
import '../Field/Field.css'
import './CopyField.css'

export interface CopyFieldProps {
  value: string
  /** Accessible name for the field. */
  label: ReactNode
  /** Show the label above the field instead of only to assistive tech. */
  showLabel?: boolean
  /** Decorative leading icon, e.g. a link glyph. */
  icon?: ReactNode
  size?: ControlSize
  /** Accessible name for the copy control, before a copy succeeds. */
  copyLabel?: string
  id?: string
  className?: string
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M3.5 10.5h-.5a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 10.5 3v.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3 8.5l3.5 3.5L13 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * A read-only value with a one-click copy — a shareable link, an API key,
 * an invite code.
 *
 * The value is a real `readOnly` input rather than plain text, so it stays
 * selectable and copyable by hand as a fallback when `navigator.clipboard`
 * is unavailable or denied.
 *
 * @example
 * <CopyField label="Shareable link" value="meetcard.io/ben" icon={<LinkIcon />} />
 */
export function CopyField({
  value,
  label,
  showLabel = false,
  icon,
  size = 'md',
  copyLabel = 'Copy link',
  id: providedId,
  className,
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false)
  const { id } = useFieldIds({ id: providedId, hasDescription: false, hasError: false })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied or unavailable — the value stays selectable
      // in the input as a manual fallback.
    }
  }

  return (
    <div className={cx('deck-copy-field', className)}>
      <label
        htmlFor={id}
        className={cx('deck-field__label', !showLabel && 'deck-visually-hidden')}
      >
        {label}
      </label>

      <div className="deck-copy-field__control">
        {icon ? (
          <span className="deck-copy-field__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          type="text"
          readOnly
          value={value}
          className={cx(
            'deck-control',
            `deck-control--${size}`,
            'deck-copy-field__input',
            !icon && 'deck-copy-field__input--no-icon',
          )}
          onFocus={(e) => e.currentTarget.select()}
        />

        <button
          type="button"
          className={cx('deck-copy-field__copy', copied && 'deck-copy-field__copy--copied')}
          aria-label={copied ? 'Copied' : copyLabel}
          onClick={handleCopy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  )
}
