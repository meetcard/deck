import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SideNav } from './SideNav'

const items = [
  { id: '/', label: 'Dashboard', icon: <svg />, href: '/' },
  { id: '/cards', label: 'My cards', icon: <svg />, href: '/cards' },
  {
    id: '/connections',
    label: 'Connections',
    icon: <svg />,
    href: '/connections',
    badge: 3,
  },
  { id: '/events', label: 'Events', icon: <svg />, href: '/events' },
]

const footerItems = [
  { id: '/settings', label: 'Settings', icon: <svg />, href: '/settings' },
]

describe('SideNav', () => {
  // Not "Primary": AppShell renders this alongside BottomNav, and two
  // navigation landmarks in one document may not share a name.
  it('renders a navigation landmark named Global', () => {
    render(<SideNav items={items} currentId="/" />)
    expect(screen.getByRole('navigation', { name: 'Global' })).toBeInTheDocument()
  })

  it('is a navigation landmark, not a complementary one', () => {
    render(<SideNav items={items} />)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })

  // The active destination must be announced, not just colored.
  it('marks the current destination with aria-current', () => {
    render(<SideNav items={items} currentId="/connections" />)
    expect(
      screen.getByRole('link', { name: /Connections/ }),
    ).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('spells out a badge count in the accessible name', () => {
    render(<SideNav items={items} />)
    expect(
      screen.getByRole('link', { name: 'Connections, 3 pending' }),
    ).toBeInTheDocument()
  })

  it('keeps destinations as links even when onSelect is supplied', async () => {
    const onSelect = vi.fn()
    render(<SideNav items={items} onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('link', { name: 'Events' }))

    expect(onSelect).toHaveBeenCalledWith('/events')
  })

  it('renders a destination without href as a button', async () => {
    const onSelect = vi.fn()
    render(
      <SideNav
        items={[{ id: '/capture', label: 'Capture', icon: <svg /> }]}
        onSelect={onSelect}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Capture' }))

    expect(onSelect).toHaveBeenCalledWith('/capture')
  })

  describe('footerItems', () => {
    // Pinned items share the rail's landmark rather than forming their own.
    // Splitting them out would add an unnamed landmark for a result CSS
    // already gives us, so this is asserted rather than left to convention.
    it('renders inside the same navigation landmark', () => {
      render(<SideNav items={items} footerItems={footerItems} />)

      const nav = screen.getByRole('navigation', { name: 'Global' })
      expect(
        within(nav).getByRole('link', { name: 'Settings' }),
      ).toBeInTheDocument()
      expect(screen.getAllByRole('navigation')).toHaveLength(1)
    })

    it('renders them after the main destinations', () => {
      render(<SideNav items={items} footerItems={footerItems} />)

      const names = screen.getAllByRole('link').map((el) => el.textContent)
      expect(names[names.length - 1]).toBe('Settings')
    })

    it('omits the footer list entirely when there are none', () => {
      render(<SideNav items={items} />)
      expect(screen.queryByRole('link', { name: 'Settings' })).toBeNull()
    })
  })
})
