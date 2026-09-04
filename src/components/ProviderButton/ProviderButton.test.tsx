import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProviderButton } from './ProviderButton'

describe('ProviderButton', () => {
  // The name has to say what the button does, not who made the logo:
  // "Google" alone leaves a screen reader user guessing.
  it('names the icon-only button for the action, not the vendor', () => {
    render(<ProviderButton provider="google" />)
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible()
  })

  it.each([
    ['microsoft', 'Continue with Microsoft'],
    ['linkedin', 'Continue with LinkedIn'],
    ['github', 'Continue with GitHub'],
  ] as const)('names the %s button', (provider, name) => {
    render(<ProviderButton provider={provider} />)
    expect(screen.getByRole('button', { name })).toBeVisible()
  })

  it('takes an explicit label for other contexts', () => {
    render(<ProviderButton provider="google" label="Connect Google" />)
    expect(screen.getByRole('button', { name: 'Connect Google' })).toBeVisible()
  })

  it('uses its visible text as the name when labelled', () => {
    render(<ProviderButton provider="google">Sign up with Google</ProviderButton>)
    expect(
      screen.getByRole('button', { name: 'Sign up with Google' }),
    ).toBeVisible()
  })

  it('does not submit the form it sits in', () => {
    render(<ProviderButton provider="google" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<ProviderButton provider="github" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<ProviderButton provider="github" onClick={onClick} disabled />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })
})
