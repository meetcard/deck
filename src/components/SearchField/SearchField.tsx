import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import type { ControlSize } from '../Field/Field'
import '../Field/Field.css'
import './SearchField.css'

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Accessible name. Usually hidden — the magnifier conveys purpose visually. */
  label: ReactNode
  size?: ControlSize
  /** Show the label above the field instead of only to assistive tech. */
  showLabel?: boolean
  /** Called when the clear control is used, after the value is emptied. */
  onClear?: () => void
  clearLabel?: string
  /** Live result count, announced politely as the user types. */
  resultCount?: number
}

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/**
 * The search input for Rolodex and other lists.
 *
 * Search is the primary interaction in a contact list, so this is a distinct
 * component rather than an `Input` with an icon: it renders `type="search"`
 * (giving mobile keyboards a Search key), offers a clear control, and can
 * announce a live result count so screen reader users hear the list change.
 *
 * @example
 * <SearchField label="Search connections" resultCount={n}
 *   value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      label,
      size = 'md',
      showLabel = false,
      onClear,
      clearLabel = 'Clear search',
      resultCount,
      id: providedId,
      className,
      value,
      ...props
    },
    ref,
  ) {
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    const { id } = useFieldIds({
      id: providedId,
      hasDescription: false,
      hasError: false,
    })

    const hasValue = typeof value === 'string' && value.length > 0

    return (
      <div className={cx('deck-search-field', className)}>
        <label
          htmlFor={id}
          className={cx(
            'deck-field__label',
            !showLabel && 'deck-visually-hidden',
          )}
        >
          {label}
        </label>

        <div className="deck-search-field__control">
          <span className="deck-search-field__icon" aria-hidden="true">
            <SearchIcon />
          </span>

          <input
            ref={innerRef}
            id={id}
            type="search"
            value={value}
            className={cx(
              'deck-control',
              `deck-control--${size}`,
              'deck-search-field__input',
            )}
            {...props}
          />

          {onClear && hasValue ? (
            <button
              type="button"
              className="deck-search-field__clear"
              aria-label={clearLabel}
              onClick={() => {
                onClear()
                innerRef.current?.focus()
              }}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Politely announces "N results" so the list change is perceivable
            without sight. Silent until a count is supplied. */}
        <span className="deck-visually-hidden" role="status">
          {typeof resultCount === 'number'
            ? `${resultCount} result${resultCount === 1 ? '' : 's'}`
            : ''}
        </span>
      </div>
    )
  },
)
