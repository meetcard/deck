import type { SelectHTMLAttributes } from 'react'
import './Select.css'

export type SelectSize = 'sm' | 'md'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: SelectOption[]
  size?: SelectSize
}

export function Select({ options, size = 'md', className, ...props }: SelectProps) {
  const classes = ['select', `select--${size}`, className].filter(Boolean).join(' ')

  return (
    <select className={classes} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
