import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchField } from './SearchField'

function Controlled() {
  const [value, setValue] = useState('')
  return (
    <SearchField
      label="Search connections"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onClear={() => setValue('')}
    />
  )
}

describe('SearchField', () => {
  it('is labelled even though the label is visually hidden', () => {
    render(<SearchField label="Search connections" />)
    expect(screen.getByLabelText('Search connections')).toBeVisible()
  })

  // type="search" is what gives mobile keyboards a Search key.
  it('renders a search input', () => {
    render(<SearchField label="Search connections" />)
    expect(screen.getByLabelText('Search connections')).toHaveAttribute(
      'type',
      'search',
    )
  })

  describe('clear control', () => {
    it('is hidden while the field is empty', () => {
      render(<Controlled />)
      expect(
        screen.queryByRole('button', { name: 'Clear search' }),
      ).not.toBeInTheDocument()
    })

    it('appears once there is a value and empties the field', async () => {
      render(<Controlled />)
      const input = screen.getByLabelText('Search connections')

      await userEvent.type(input, 'ada')
      await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

      expect(input).toHaveValue('')
    })

    // Losing focus after clearing would force a mouse user back to the field.
    it('returns focus to the input', async () => {
      render(<Controlled />)
      const input = screen.getByLabelText('Search connections')

      await userEvent.type(input, 'ada')
      await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

      expect(input).toHaveFocus()
    })

    it('is absent when onClear is not supplied', async () => {
      render(<SearchField label="Search connections" value="ada" onChange={vi.fn()} />)
      expect(
        screen.queryByRole('button', { name: 'Clear search' }),
      ).not.toBeInTheDocument()
    })
  })

  it('announces the result count politely', () => {
    render(<SearchField label="Search connections" resultCount={3} />)
    expect(screen.getByRole('status')).toHaveTextContent('3 results')
  })

  it('uses the singular for one result', () => {
    render(<SearchField label="Search connections" resultCount={1} />)
    expect(screen.getByRole('status')).toHaveTextContent('1 result')
  })

  it('forwards a ref to the input', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<SearchField ref={ref} label="Search connections" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
