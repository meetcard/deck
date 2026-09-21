import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ShareCard } from './ShareCard'

describe('ShareCard', () => {
  it('says what to do with it, and whose card it is', () => {
    render(
      <ShareCard name="Nora Whitfield" detail="Product Lead at Rivermark">
        <span data-testid="code" />
      </ShareCard>,
    )
    expect(
      screen.getByRole('heading', { name: 'Scan to exchange cards' }),
    ).toBeVisible()
    expect(screen.getByText('Nora Whitfield')).toBeVisible()
    expect(screen.getByText('Product Lead at Rivermark')).toBeVisible()
  })

  it('renders the code it is given', () => {
    render(
      <ShareCard name="Nora Whitfield">
        <span data-testid="code" />
      </ShareCard>,
    )
    expect(screen.getByTestId('code')).toBeInTheDocument()
  })

  it('lists every contact line', () => {
    render(
      <ShareCard
        name="Nora Whitfield"
        contacts={['nora@rivermark.com', '(303) 555-0142']}
      >
        <span />
      </ShareCard>,
    )
    expect(screen.getByText('nora@rivermark.com')).toBeVisible()
    expect(screen.getByText('(303) 555-0142')).toBeVisible()
  })

  it('takes its own wording', () => {
    render(
      <ShareCard name="Nora" eyebrow="Scan me" title="Point a camera here">
        <span />
      </ShareCard>,
    )
    expect(
      screen.getByRole('heading', { name: 'Point a camera here' }),
    ).toBeVisible()
    expect(screen.getByText('Scan me')).toBeVisible()
  })
})
