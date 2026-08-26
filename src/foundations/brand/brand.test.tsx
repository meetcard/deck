import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
