import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SettingsNav } from './SettingsNav'

const groups = [
  {
    label: 'User',
    items: [
      { id: '/settings/profile', label: 'Profile', icon: <svg />, href: '/settings/profile' },
      { id: '/settings/account', label: 'Account', icon: <svg />, href: '/settings/account' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: '/settings/billing', label: 'Billing', icon: <svg />, href: '/settings/billing' },
    ],
  },
]

describe('SettingsNav', () => {
  it('renders a labelled navigation landmark', () => {
    render(<SettingsNav groups={groups} currentId="/settings/profile" />)
    expect(
      screen.getByRole('navigation', { name: 'Settings' }),
    ).toBeInTheDocument()
  })

  it('heads each group', () => {
    render(<SettingsNav groups={groups} />)
    expect(screen.getByRole('heading', { name: 'User' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Admin' })).toBeInTheDocument()
  })

  // The active section must be announced, not just filled in.
  it('marks the current section with aria-current', () => {
    render(<SettingsNav groups={groups} currentId="/settings/account" />)
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Profile' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('reports the section chosen from the list', async () => {
    const onSelect = vi.fn()
    render(<SettingsNav groups={groups} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('link', { name: 'Billing' }))

    expect(onSelect).toHaveBeenCalledWith('/settings/billing')
  })

  describe('the narrow-screen control', () => {
    // jsdom applies no CSS, so both controls are present here. That is what
    // lets these assertions reach the select at all — which of the two is
    // *shown* is a layout question, tested in the browser.
    it('is a labelled select', () => {
      render(<SettingsNav groups={groups} currentId="/settings/profile" />)
      expect(screen.getByLabelText('Select settings option')).toHaveValue(
        '/settings/profile',
      )
    })

    it('keeps the groups as optgroups', () => {
      render(<SettingsNav groups={groups} />)
      const select = screen.getByLabelText('Select settings option')
      const optgroups = within(select).getAllByRole('group')
      expect(optgroups.map((g) => g.getAttribute('label'))).toEqual([
        'User',
        'Admin',
      ])
    })

    it('reports the section chosen from it', async () => {
      const onSelect = vi.fn()
      render(<SettingsNav groups={groups} onSelect={onSelect} currentId="/settings/profile" />)

      await userEvent.selectOptions(
        screen.getByLabelText('Select settings option'),
        '/settings/billing',
      )

      expect(onSelect).toHaveBeenCalledWith('/settings/billing')
    })
  })
})
