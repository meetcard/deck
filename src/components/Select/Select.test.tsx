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

  // The grouping is the same information a sectioned list carries on a wider
  // screen; a select that drops it when the list collapses loses it.
  it('renders grouped options as optgroups', () => {
    render(
      <Select
        label="Settings section"
        options={[
          {
            label: 'User',
            options: [
              { value: 'profile', label: 'Profile' },
              { value: 'account', label: 'Account' },
            ],
          },
          { label: 'Admin', options: [{ value: 'billing', label: 'Billing' }] },
        ]}
      />,
    )

    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAttribute('label', 'User')
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('still accepts a plain list', () => {
    render(
      <Select
        label="Card type"
        options={[{ value: 'work', label: 'Work' }]}
      />,
    )
    expect(screen.queryAllByRole('group')).toHaveLength(0)
    expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument()
  })
})
