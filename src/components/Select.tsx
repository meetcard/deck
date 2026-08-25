import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import './Select.css'

export type SelectSize = 'sm' | 'md'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label: string
  options: SelectOption[]
  size?: SelectSize
}

export function Select({
  label,
  options,
  size = 'md',
  className,
  id,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const classes = ['select', `select--${size}`, className].filter(Boolean).join(' ')

  return (
    <span className="select-wrapper">
      <select {...props} id={selectId} aria-label={label} className={classes}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="select__chevron"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  )
}
