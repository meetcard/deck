import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AvatarStack } from './AvatarStack'

const PEOPLE = [
  { name: 'Hannah Davis' },
  { name: 'Marcus Lee' },
  { name: 'Priya Shah' },
]

describe('AvatarStack', () => {
  it('names every face it shows', () => {
    render(<AvatarStack people={PEOPLE} />)

    for (const person of PEOPLE) {
      expect(screen.getByRole('img', { name: person.name })).toBeInTheDocument()
    }
  })

  it('collapses the tail past max into a counted chip', () => {
    render(<AvatarStack people={PEOPLE} max={2} />)

    expect(screen.getByRole('img', { name: 'Marcus Lee' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Priya Shah' })).not.toBeInTheDocument()
    // The chip counts in words for assistive tech, not just "+1".
    expect(screen.getByText('1 more')).toBeInTheDocument()
  })

  it('omits the overflow chip when everyone fits', () => {
    render(<AvatarStack people={PEOPLE} max={3} />)
    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('labels the group so the faces read as one thing', () => {
    render(<AvatarStack people={PEOPLE} label="Cards exchanged here" />)
    expect(
      screen.getByRole('list', { name: 'Cards exchanged here' }),
    ).toBeInTheDocument()
  })
})
