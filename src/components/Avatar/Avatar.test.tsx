import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('uses the first and last name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
  })

  it('uses a single letter for a one-word name', () => {
    expect(getInitials('MeetCard')).toBe('M')
  })

  it('ignores middle names and extra whitespace', () => {
    expect(getInitials('  Ada  Byron   Lovelace ')).toBe('AL')
  })

  it('returns an empty string for an empty name', () => {
    expect(getInitials('   ')).toBe('')
  })
})

describe('Avatar', () => {
  it('exposes the name as the accessible name', () => {
    render(<Avatar name="Ada Lovelace" />)
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeVisible()
  })

  it('renders the image when a src is supplied', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />)
    expect(screen.getByRole('img').querySelector('img')).toHaveAttribute(
      'src',
      '/ada.png',
    )
  })

  // A broken avatar should degrade to initials, never a broken-image icon.
  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="Ada Lovelace" src="/missing.png" />)

    const img = screen.getByRole('img').querySelector('img')
    expect(img).not.toBeNull()
    fireEvent.error(img as HTMLImageElement)

    expect(screen.getByText('AL')).toBeVisible()
    expect(screen.getByRole('img').querySelector('img')).toBeNull()
  })

  it('is hidden from assistive tech when decorative', () => {
    render(<Avatar name="Ada Lovelace" decorative />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
