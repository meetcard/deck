import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PersonCard } from './PersonCard'

describe('PersonCard', () => {
  it('renders the person as a heading inside an article', () => {
    render(<PersonCard name="Ada Lovelace" />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible()
  })

  it('joins title and company into one subtitle', () => {
    render(
      <PersonCard name="Ada Lovelace" title="Head of Partnerships" company="MeetCard" />,
    )

    expect(
      screen.getByText('Head of Partnerships · MeetCard'),
    ).toBeVisible()
  })

  it('omits the separator when only one is given', () => {
    render(<PersonCard name="Ada Lovelace" company="MeetCard" />)
    expect(screen.getByText('MeetCard')).toBeVisible()
  })

  // The card is only "interactive" visually; the link is what makes it
  // reachable by keyboard.
  it('makes the name a link when href is supplied', () => {
    render(<PersonCard name="Ada Lovelace" href="/people/ada" />)

    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
      'href',
      '/people/ada',
    )
  })

  it('renders no link without href', () => {
    render(<PersonCard name="Ada Lovelace" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('does not announce the avatar separately from the name', () => {
    render(<PersonCard name="Ada Lovelace" />)

    // Avatar is decorative here, so "Ada Lovelace" is announced once.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows a status badge', () => {
    render(
      <PersonCard
        name="Ada Lovelace"
        status={{ label: 'Connected', tone: 'success' }}
      />,
    )

    expect(screen.getByText('Connected')).toBeVisible()
  })
})
