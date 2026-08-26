import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Tag.css'

export interface TagProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  children: ReactNode
  /** Renders a remove control. Omit for a read-only tag. */
  onRemove?: () => void
  /**
   * Turns the tag into a filter toggle. With this set the tag renders as a
   * real button exposing `aria-pressed`, so its state is announced.
   */
  onToggle?: () => void
  /** Selected state for a filter tag. Only meaningful with `onToggle`. */
  selected?: boolean
  size?: 'sm' | 'md'
  /** Label for the remove control; the tag text is appended automatically. */
  removeLabel?: string
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * A user-authored label on a connection, and the filter control for it.
 *
 * Distinct from `Badge`: a Badge is system-assigned status you read, a Tag is
 * user data you can remove or filter by. Tags are how a holder makes captured
 * connections findable later, so filtering state is exposed via `aria-pressed`
 * rather than implied by color.
 *
 * @example
 * <Tag onRemove={() => remove('follow-up')}>follow-up</Tag>
 * <Tag onToggle={toggle} selected={isOn}>SaaSConf</Tag>
 */
export const Tag = forwardRef<HTMLElement, TagProps>(function Tag(
  {
    children,
    onRemove,
    onToggle,
    selected = false,
    size = 'md',
    removeLabel = 'Remove tag',
    className,
    ...props
  },
  ref,
) {
  const classes = cx(
    'deck-tag',
    `deck-tag--${size}`,
    onToggle && 'deck-tag--toggle',
    onToggle && selected && 'deck-tag--selected',
    className,
  )

  if (onToggle) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        aria-pressed={selected}
        onClick={onToggle}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    )
  }

  return (
    <span ref={ref as React.Ref<HTMLSpanElement>} className={classes} {...props}>
      <span className="deck-tag__label">{children}</span>
      {onRemove ? (
        <button
          type="button"
          className="deck-tag__remove"
          aria-label={`${removeLabel}: ${
            typeof children === 'string' ? children : ''
          }`.trim()}
          onClick={onRemove}
        >
          <CloseIcon />
        </button>
      ) : null}
    </span>
  )
})
