import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CompanyProfileCard } from './CompanyProfileCard'

describe('CompanyProfileCard', () => {
  it('names the company in its heading, and says what it says', () => {
    render(
      <CompanyProfileCard
        name="MeetCard"
        tagline="Meet people. Remember them."
        description="In-person introductions, remembered."
      />,
    )
    expect(screen.getByRole('heading', { name: 'MeetCard' })).toBeVisible()
    expect(screen.getByText('Company profile')).toBeVisible()
    expect(screen.getByText('Meet people. Remember them.')).toBeVisible()
    expect(screen.getByText('In-person introductions, remembered.')).toBeVisible()
  })

  it('keeps the name as the heading when a wordmark shows it', () => {
    render(<CompanyProfileCard name="MeetCard" logoSrc="/logo.svg" />)
    expect(screen.getByRole('heading', { name: 'MeetCard' })).toBeVisible()
    expect(screen.getByRole('img', { name: 'MeetCard' })).toHaveAttribute(
      'src',
      '/logo.svg',
    )
  })

  it('makes a pill with an address a link, and one without a button', () => {
    const onShare = vi.fn()
    render(
      <CompanyProfileCard
        name="MeetCard"
        links={[
          { label: 'meetcard.io', href: 'https://meetcard.io' },
          { label: 'Share', onClick: onShare },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'meetcard.io' })).toHaveAttribute(
      'href',
      'https://meetcard.io',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(onShare).toHaveBeenCalledOnce()
  })

  it('still names an icon-only pill', () => {
    render(
      <CompanyProfileCard
        name="MeetCard"
        links={[{ label: 'LinkedIn', href: 'https://linkedin.com', iconOnly: true }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
  })

  it('names the faces after the company unless told otherwise', () => {
    const people = [{ name: 'Hannah Davis' }, { name: 'Marcus Chen' }]
    const { rerender } = render(<CompanyProfileCard name="MeetCard" people={people} />)
    expect(screen.getByRole('list', { name: 'People at MeetCard' })).toBeVisible()

    rerender(
      <CompanyProfileCard name="MeetCard" people={people} peopleLabel="Your team" />,
    )
    expect(screen.getByRole('list', { name: 'Your team' })).toBeVisible()
  })

  it('publishes which way up it is', () => {
    const { container } = render(
      <CompanyProfileCard name="MeetCard" orientation="portrait" />,
    )
    expect(container.firstElementChild).toHaveAttribute(
      'data-card-orientation',
      'portrait',
    )
  })
})
