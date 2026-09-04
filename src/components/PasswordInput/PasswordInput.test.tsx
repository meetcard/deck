import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './PasswordInput'

/** `getByLabelText` finds the field whatever `type` it currently carries. */
const field = () => screen.getByLabelText('Password')

describe('PasswordInput', () => {
  it('associates the label with the control', () => {
    render(<PasswordInput label="Password" />)
    expect(field()).toBeVisible()
  })

  it('masks the value by default', () => {
    render(<PasswordInput label="Password" />)
    expect(field()).toHaveAttribute('type', 'password')
  })

  describe('reveal control', () => {
    it('unmasks the value and keeps it intact', async () => {
      render(<PasswordInput label="Password" />)

      await userEvent.type(field(), 'correct horse')
      await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

      expect(field()).toHaveAttribute('type', 'text')
      expect(field()).toHaveValue('correct horse')
    })

    it('names itself for the action it will perform next', async () => {
      render(<PasswordInput label="Password" />)

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }))

      expect(
        screen.getByRole('button', { name: 'Hide password' }),
      ).toBeVisible()
    })

    it('masks the value again', async () => {
      render(<PasswordInput label="Password" />)

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
      await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))

      expect(field()).toHaveAttribute('type', 'password')
    })

    // Whether the password is on screen is not otherwise perceivable without
    // sight, so the toggle has to say what it just did.
    it('announces the change in visibility', async () => {
      render(<PasswordInput label="Password" />)

      expect(screen.getByRole('status')).toBeEmptyDOMElement()

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }))
      expect(screen.getByRole('status')).toHaveTextContent('Password is visible')

      await userEvent.click(screen.getByRole('button', { name: 'Hide password' }))
      expect(screen.getByRole('status')).toHaveTextContent('Password is hidden')
    })

    it('can be withheld', () => {
      render(<PasswordInput label="Password" revealable={false} />)
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('purpose', () => {
    it('asks password managers to fill by default', () => {
      render(<PasswordInput label="Password" />)
      expect(field()).toHaveAttribute('autocomplete', 'current-password')
    })

    it('asks password managers to generate when the password is new', () => {
      render(<PasswordInput label="Password" purpose="new" />)
      expect(field()).toHaveAttribute('autocomplete', 'new-password')
    })

    it('yields to an explicit autoComplete', () => {
      render(<PasswordInput label="Password" autoComplete="off" />)
      expect(field()).toHaveAttribute('autocomplete', 'off')
    })
  })

  describe('error state', () => {
    it('marks the control invalid and describes it', () => {
      render(<PasswordInput label="Password" error="Password is incorrect" />)

      expect(field()).toHaveAttribute('aria-invalid', 'true')
      expect(field()).toHaveAccessibleDescription('Password is incorrect')
    })

    it('announces the message', () => {
      render(<PasswordInput label="Password" error="Password is incorrect" />)
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Password is incorrect',
      )
    })
  })
})
