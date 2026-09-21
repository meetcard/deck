import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CoverCard } from './CoverCard'

describe('CoverCard', () => {
  it('renders its children on the card', () => {
    render(<CoverCard>Held up to be read</CoverCard>)
    expect(screen.getByText('Held up to be read')).toBeVisible()
  })

  // The photo says which card this is at a glance; everything it needs to
  // say in words is said in the content beside it.
  it('leaves the cover out of the accessibility tree', () => {
    const { container } = render(
      <CoverCard coverSrc="/cover.jpg">Content</CoverCard>,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  // A card is never waiting on an image to look finished.
  it('keeps the scrim when there is no cover', () => {
    const { container } = render(<CoverCard>Content</CoverCard>)
    expect(container.querySelector('.deck-cover-card__image')).toBeNull()
    expect(container.querySelector('.deck-cover-card__scrim')).not.toBeNull()
  })

  it('publishes the orientation its CSS keys off', () => {
    const { container } = render(
      <CoverCard orientation="portrait">Content</CoverCard>,
    )
    expect(container.firstChild).toHaveAttribute(
      'data-card-orientation',
      'portrait',
    )
  })

  it('renders as the element the caller asks for', () => {
    const { container } = render(
      <CoverCard as="header">Content</CoverCard>,
    )
    expect(container.querySelector('header')).not.toBeNull()
  })
})
