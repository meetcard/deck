import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AccountSheet } from './AccountSheet'
import type { AccountCard } from './AccountSheet'

const cards: AccountCard[] = [
  {
    id: 'personal',
    label: 'Personal card',
    link: 'meetcard.io/ben',
    href: '/cards/ben',
  },
  {
    id: 'business',
    label: 'Business card',
    link: 'meetcard.io/ben@meetcard',
    href: '/cards/ben@meetcard',
    isDefault: true,
  },
]

/** The same cards as a prototype without routing passes them. */
const unrouted: AccountCard[] = cards.map(({ href: _href, ...card }) => card)

const setup = (props: Partial<Parameters<typeof AccountSheet>[0]> = {}) =>
  render(
    <AccountSheet
      open
      onClose={vi.fn()}
      name="Ben Ackles"
      handle="/ben"
      cards={cards}
      {...props}
    />,
  )

describe('AccountSheet', () => {
  // Named for the surface, not the person — the person is read out as content
  // straight after, and a dialog named after them says it twice.
  it('is named for what it is', () => {
    setup()
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Account')
  })

  it('shows the person and their handle', () => {
    setup()
    expect(screen.getByText('Ben Ackles')).toBeVisible()
    expect(screen.getByText('/ben')).toBeVisible()
  })

  // The links are what tell two cards apart, so they are on the row rather
  // than a detail you have to open the card to see.
  it('prints each card with its public link', () => {
    setup()
    expect(screen.getByText('meetcard.io/ben')).toBeVisible()
    expect(screen.getByText('meetcard.io/ben@meetcard')).toBeVisible()
  })

  it('marks the default card', () => {
    setup()
    const business = screen.getByRole('link', { name: /Business card/ })
    expect(business).toHaveTextContent('Default')

    const personal = screen.getByRole('link', { name: /Personal card/ })
    expect(personal).not.toHaveTextContent('Default')
  })

  it('routes each card to its own page', () => {
    setup()
    expect(screen.getByRole('link', { name: /Personal card/ })).toHaveAttribute(
      'href',
      '/cards/ben',
    )
  })

  it('routes Settings where it is told to', () => {
    setup({ settingsHref: '/settings/profile' })
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings/profile',
    )
  })

  // Settings follows the same rule as every other row rather than inventing a
  // default route. A component that ships an `href` nobody has routed yet is
  // a component that ships links that 404.
  it('leaves Settings a button when it has nowhere to go', () => {
    setup()

    expect(screen.getByRole('button', { name: 'Settings' })).toBeVisible()
    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument()
  })

  it('reports a Settings press when it is unrouted', async () => {
    const onSelectSettings = vi.fn()
    setup({ onSelectSettings })

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))

    expect(onSelectSettings).toHaveBeenCalled()
  })

  // The whole surface, in the shape a router-less prototype renders it.
  it('emits no links at all when nothing is routed', () => {
    setup({ cards: unrouted })
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('reports which card was chosen', async () => {
    const onSelectCard = vi.fn()
    setup({ onSelectCard })

    await userEvent.click(screen.getByRole('link', { name: /Personal card/ }))

    expect(onSelectCard).toHaveBeenCalledWith('personal')
  })

  // Without an href there is no address, so the row must not claim to be one.
  it('renders a button for a card with no route', () => {
    setup({ cards: [{ id: 'personal', label: 'Personal card' }] })

    expect(
      screen.getByRole('button', { name: /Personal card/ }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Personal card/ }),
    ).not.toBeInTheDocument()
  })

  it('closes from the close control', async () => {
    const onClose = vi.fn()
    setup({ onClose })

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('drops the card section when there are no cards', () => {
    setup({ cards: [] })

    expect(screen.queryByText('My cards')).not.toBeInTheDocument()
    // Settings survives — it is the one row that is always reachable.
    expect(screen.getByRole('button', { name: 'Settings' })).toBeVisible()
  })

  it('appends extra rows after Settings', () => {
    setup({
      children: (
        <li>
          <button type="button">Sign out</button>
        </li>
      ),
    })

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })
})
