import { describe, expect, it } from 'vitest'
import { colorVar, mediaQuery, spaceVar } from './tokens'

describe('spaceVar', () => {
  it('builds a CSS custom property reference for a space step', () => {
    expect(spaceVar(16)).toBe('var(--deck-space-16)')
  })
})

describe('mediaQuery', () => {
  it('builds a min-width media query for a breakpoint', () => {
    expect(mediaQuery('md')).toBe('(min-width: 768px)')
  })

  it('resolves each breakpoint to its own width', () => {
    expect(mediaQuery('sm')).toBe('(min-width: 640px)')
    expect(mediaQuery('xl')).toBe('(min-width: 1280px)')
  })
})

describe('colorVar', () => {
  it('builds a CSS custom property reference for a semantic color', () => {
    expect(colorVar('action', 'primary')).toBe('var(--deck-color-action-primary)')
  })

  it('works across color groups', () => {
    expect(colorVar('text', 'muted')).toBe('var(--deck-color-text-muted)')
    expect(colorVar('status', 'error-border')).toBe(
      'var(--deck-color-status-error-border)',
    )
  })
})
