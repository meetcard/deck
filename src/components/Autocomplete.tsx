import { useId, useState } from 'react'
import type { InputHTMLAttributes, KeyboardEvent } from 'react'
import './Autocomplete.css'

export type AutocompleteOption = {
  value: string
  label: string
}

export type AutocompleteSize = 'sm' | 'md'

export type AutocompleteProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange' | 'value'
> & {
  options: AutocompleteOption[]
  value: string
  onChange: (value: string) => void
  onSelect?: (option: AutocompleteOption) => void
  size?: AutocompleteSize
}

export function Autocomplete({
  options,
  value,
  onChange,
  onSelect,
  size = 'md',
  className,
  id,
  ...props
}: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listboxId = useId()
  const generatedId = useId()
  const inputId = id ?? generatedId

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(value.toLowerCase()),
  )
  const showList = open && filtered.length > 0

  function selectOption(option: AutocompleteOption) {
    onChange(option.label)
    onSelect?.(option)
    setOpen(false)
    setActiveIndex(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      setOpen(true)
      return
    }

    if (!open || filtered.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % filtered.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) =>
        index <= 0 ? filtered.length - 1 : index - 1,
      )
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault()
        selectOption(filtered[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const classes = ['autocomplete', `autocomplete--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <input
        autoComplete="off"
        {...props}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        className="autocomplete__input"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
          setActiveIndex(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {showList && (
        <ul id={listboxId} role="listbox" className="autocomplete__list">
          {filtered.map((option, index) => (
            <li
              key={option.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={
                'autocomplete__option' +
                (index === activeIndex ? ' autocomplete__option--active' : '')
              }
              onMouseDown={(event) => {
                event.preventDefault()
                selectOption(option)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
