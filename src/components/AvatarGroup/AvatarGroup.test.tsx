import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AvatarGroup } from './AvatarGroup'

const people = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Lee' },
  { name: 'Priya Shah' },
]

describe('AvatarGroup', () => {
  it('names the group for assistive tech', () => {
    render(<AvatarGroup people={people} label="Cards exchanged" />)
    expect(
      screen.getByRole('list', { name: 'Cards exchanged' }),
    ).toBeInTheDocument()
  })

  // A face nobody can name is a decoration. The prototype's `title`
  // attribute is not announced reliably; a labelled image is.
  it('announces every face by name', () => {
    render(<AvatarGroup people={people} label="Cards exchanged" />)
    expect(screen.getByRole('img', { name: 'Marcus Lee' })).toBeInTheDocument()
  })

  it('collapses the tail into a spoken count', () => {
    render(<AvatarGroup people={people} max={2} label="Cards exchanged" />)

    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.queryByRole('img', { name: 'Priya Shah' })).not.toBeInTheDocument()
    expect(screen.getByText('and 1 more')).toBeInTheDocument()
  })

  it('says nothing about overflow when everyone fits', () => {
    render(<AvatarGroup people={people} max={3} label="Cards exchanged" />)
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })
})
