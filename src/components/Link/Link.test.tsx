import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Link } from './Link'

describe('Link', () => {
  it('renders an anchor with the given href', () => {
    render(<Link href="/deck">Back to your deck</Link>)
    expect(screen.getByRole('link', { name: 'Back to your deck' })).toHaveAttribute(
      'href',
      '/deck',
    )
  })

  describe('external', () => {
    // Opening a new tab without saying so is a WCAG 3.2.5 problem, and
    // `target="_blank"` without `rel` is a security one.
    it('sets a safe rel and target', () => {
      render(
        <Link href="https://example.com" external>
          meetcard.com
        </Link>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    // Asserted as a pattern because jsdom's accessible-name implementation
    // trims per-node whitespace, so the separator between the label and the
    // hidden note is engine-dependent. The exact string is pinned in
    // Link.stories.tsx, which runs in real Chromium.
    it('announces that it opens a new tab', () => {
      render(
        <Link href="https://example.com" external>
          meetcard.com
        </Link>,
      )

      expect(screen.getByRole('link')).toHaveAccessibleName(
        /meetcard\.com\s*\(opens in a new tab\)/i,
      )
    })

    it('does not override an explicit rel or target', () => {
      render(
        <Link href="https://example.com" external rel="me" target="_self">
          meetcard.com
        </Link>,
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('rel', 'me')
      expect(link).toHaveAttribute('target', '_self')
    })
  })

  it('adds no external affordances by default', () => {
    render(<Link href="/deck">Back to your deck</Link>)

    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('target')
    expect(link).toHaveAccessibleName('Back to your deck')
  })
})
