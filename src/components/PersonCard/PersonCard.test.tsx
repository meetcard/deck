import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PersonCard } from './PersonCard'

describe('PersonCard', () => {
  it('renders the name as a heading inside an article', () => {
    render(<PersonCard name="Ben Ackles" />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ben Ackles' })).toBeVisible()
  })

  it('defaults the eyebrow to "Meet"', () => {
    render(<PersonCard name="Ben Ackles" />)
    expect(screen.getByText('Meet')).toBeVisible()
  })

  it('accepts a custom eyebrow', () => {
    render(<PersonCard name="Ben Ackles" eyebrow="Founder" />)
    expect(screen.getByText('Founder')).toBeVisible()
    expect(screen.queryByText('Meet')).not.toBeInTheDocument()
  })

  it('does not announce the avatar separately from the name', () => {
    render(<PersonCard name="Ben Ackles" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  describe('detail pill', () => {
    it('joins title, company, and location', () => {
      render(
        <PersonCard
          name="Ben Ackles"
          title="Builder"
          company="MeetCard"
          location="Boulder, Colorado"
        />,
      )

      expect(screen.getByText('Builder')).toBeVisible()
      expect(screen.getByText('at', { exact: false })).toBeVisible()
      expect(screen.getByText('MeetCard')).toBeVisible()
      expect(screen.getByText('Boulder, Colorado')).toBeVisible()
    })

    it('renders company as a link when companyHref is given', () => {
      render(
        <PersonCard name="Ben Ackles" company="MeetCard" companyHref="/c/meetcard" />,
      )

      expect(screen.getByRole('link', { name: 'MeetCard' })).toHaveAttribute(
        'href',
        '/c/meetcard',
      )
    })

    it('renders company as plain text without companyHref', () => {
      render(<PersonCard name="Ben Ackles" company="MeetCard" />)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('MeetCard')).toBeVisible()
    })

    it('omits the pill entirely when no detail is given', () => {
      render(<PersonCard name="Ben Ackles" />)
      expect(document.querySelector('.deck-person-card__pill')).toBeNull()
    })
  })

  describe('tagline and private note', () => {
    it('renders the tagline', () => {
      render(<PersonCard name="Ben Ackles" tagline="What a lovable guy" />)
      expect(screen.getByText('What a lovable guy')).toBeVisible()
    })

    it('renders the private note with a default label and calls onClick', async () => {
      const onClick = vi.fn()
      render(<PersonCard name="Ben Ackles" privateNote={{ onClick }} />)

      const note = screen.getByRole('button', { name: /Your private note/ })
      expect(note).toBeVisible()

      await userEvent.click(note)
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('accepts a custom private note label', () => {
      render(<PersonCard name="Ben Ackles" privateNote={{ label: 'Follow up next week' }} />)
      expect(
        screen.getByRole('button', { name: 'Follow up next week' }),
      ).toBeVisible()
    })

    it('shows an unread indicator only when hasContent is true', () => {
      const { rerender } = render(
        <PersonCard name="Ben Ackles" privateNote={{ hasContent: false }} />,
      )
      expect(document.querySelector('.deck-person-card__note-dot')).toBeNull()

      rerender(<PersonCard name="Ben Ackles" privateNote={{ hasContent: true }} />)
      expect(
        document.querySelector('.deck-person-card__note-dot'),
      ).not.toBeNull()
    })

    it('omits the meta row entirely without a tagline or private note', () => {
      render(<PersonCard name="Ben Ackles" />)
      expect(document.querySelector('.deck-person-card__meta-row')).toBeNull()
    })
  })

  it('renders contact actions and a footer as passed-through slots', () => {
    render(
      <PersonCard
        name="Ben Ackles"
        contactActions={<button type="button">Email</button>}
        footer={<button type="button">Book with me</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Email' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Book with me' })).toBeVisible()
  })

  it('forwards a ref to the card element', () => {
    const ref = { current: null as HTMLElement | null }
    render(<PersonCard ref={ref} name="Ben Ackles" />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })
})
