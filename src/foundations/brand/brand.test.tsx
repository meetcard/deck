import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { deckWordmarkSvg } from './deckWordmark'
import { Mark } from './Mark'
import { Wordmark } from './Wordmark'

describe('Mark', () => {
  it('renders as an accessible image named MeetCard', () => {
    render(<Mark />)
    expect(screen.getByRole('img', { name: 'MeetCard' })).toBeVisible()
  })

  it('passes through props, e.g. for sizing in a nav bar', () => {
    render(<Mark aria-hidden="true" style={{ height: 24, width: 24 }} />)
    const svg = document.querySelector('svg')
    expect(svg).toHaveStyle({ height: '24px', width: '24px' })
  })
})

describe('Wordmark', () => {
  it('renders as an accessible image named MeetCard', () => {
    render(<Wordmark />)
    expect(screen.getByRole('img', { name: 'MeetCard' })).toBeVisible()
  })

  it('passes through props', () => {
    render(<Wordmark style={{ height: 32 }} />)
    expect(document.querySelector('svg')).toHaveStyle({ height: '32px' })
  })
})

describe('deckWordmarkSvg', () => {
  it('is a self-contained svg the manager theme can encode as a data URI', () => {
    expect(deckWordmarkSvg.trimStart()).toMatch(/^<svg\b/)
    expect(deckWordmarkSvg.trimEnd()).toMatch(/<\/svg>$/)
  })

  // The landing page recolours the wordmark's type for dark mode by matching
  // these two fills (see BrandLockup.astro). Nothing would throw if the asset
  // were re-exported with different values — the selectors would simply stop
  // matching and the type would go invisible on dark. Pin them here so that
  // change fails loudly instead.
  it.each([
    ['#212121', 'the "Deck" wordmark type'],
    ['#595959', 'the "DESIGN SYSTEM" kicker'],
  ])('still fills %s, which BrandLockup remaps in dark mode (%s)', (fill) => {
    expect(deckWordmarkSvg).toContain(`fill="${fill}"`)
  })
})
