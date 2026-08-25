import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Select } from './Select'

const options = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
]

describe('Select', () => {
  // `label` is a required prop precisely because an unnamed <select> was a
  // real critical a11y violation in this codebase before.
  it('gives the select an accessible name', () => {
    render(<Select label="Card type" options={options} />)
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Card type')
  })

  it('renders every option', () => {
    render(<Select label="Card type" options={options} />)
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('selects an option by user choice', async () => {
    const onChange = vi.fn()
    render(<Select label="Card type" options={options} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'personal')

    expect(screen.getByRole('combobox')).toHaveValue('personal')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders a placeholder as a disabled first option', () => {
    render(
      <Select
        label="Card type"
        options={options}
        placeholder="Choose a type…"
        defaultValue=""
      />,
    )

    const placeholder = screen.getByRole('option', { name: 'Choose a type…' })
    expect(placeholder).toBeDisabled()
  })

  it('honours a disabled option', () => {
    render(
      <Select
        label="Card type"
        options={[...options, { value: 'team', label: 'Team', disabled: true }]}
      />,
    )

    expect(screen.getByRole('option', { name: 'Team' })).toBeDisabled()
  })

  it('marks itself invalid and describes the error', () => {
    render(
      <Select label="Card type" options={options} error="Choose a type" />,
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Choose a type')
  })
})
