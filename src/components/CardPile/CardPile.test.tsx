import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PersonCard } from '../PersonCard/PersonCard'
import { CardPile } from './CardPile'

// Pointer-drag (swipe) behaviour is exercised in CardPile.stories.tsx, which
// runs in real Chromium — jsdom's PointerEvent support is incomplete, and
// the two engines disagreeing here isn't worth chasing (see CONTRIBUTING).

describe('CardPile', () => {
  it('renders a labelled group', () => {
    render(
      <CardPile label="Ada's cards">
        <PersonCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(screen.getByRole('group', { name: "Ada's cards" })).toBeInTheDocument()
  })

  it('falls back to a default label', () => {
    render(
      <CardPile>
        <PersonCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(screen.getByRole('group', { name: 'Card pile' })).toBeInTheDocument()
  })

  describe('accessibility of layered cards', () => {
    it('exposes only the front card to assistive tech', () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
          <PersonCard name="Katherine Johnson" />
        </CardPile>,
      )

      expect(
        screen.getByRole('heading', { name: 'Ada Lovelace' }),
      ).toBeVisible()
      expect(
        screen.queryByRole('heading', { name: 'Grace Hopper' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('heading', { name: 'Katherine Johnson' }),
      ).not.toBeInTheDocument()
    })

    it('marks back layers inert, not just aria-hidden', () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      const backLayer = screen
        .getByText('Grace Hopper')
        .closest('.deck-card-pile__layer')

      expect(backLayer).toHaveAttribute('aria-hidden', 'true')
      expect(backLayer).toHaveAttribute('inert')
    })
  })

  describe('navigation controls', () => {
    it('advances with the Next button', async () => {
      const onActiveIndexChange = vi.fn()
      render(
        <CardPile onActiveIndexChange={onActiveIndexChange}>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
      expect(onActiveIndexChange).toHaveBeenCalledWith(1)
    })

    it('goes back with the Previous button, wrapping to the last card', async () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      await userEvent.click(
        screen.getByRole('button', { name: 'Previous card' }),
      )

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
    })

    // Arrow keys are the keyboard equivalent of a swipe — they must work
    // from anywhere focus lands inside the pile, not just on the buttons.
    it('advances on ArrowRight from within the pile', async () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      screen.getByRole('button', { name: 'Next card' }).focus()
      await userEvent.keyboard('{ArrowRight}')

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
    })

    it('goes back on ArrowLeft, wrapping to the last card', async () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      screen.getByRole('button', { name: 'Previous card' }).focus()
      await userEvent.keyboard('{ArrowLeft}')

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
    })

    // The Next/Previous buttons disable themselves while animating, which
    // already blocks a second click at the DOM level. Keyboard input has no
    // such guard at the DOM level, so a second ArrowRight arriving before the
    // first advance commits is what actually exercises advance()'s own
    // isAnimating check.
    it('ignores a second advance while one is still animating', async () => {
      const onActiveIndexChange = vi.fn()
      render(
        <CardPile onActiveIndexChange={onActiveIndexChange}>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
          <PersonCard name="Katherine Johnson" />
        </CardPile>,
      )

      screen.getByRole('button', { name: 'Next card' }).focus()
      await userEvent.keyboard('{ArrowRight}{ArrowRight}')

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
      expect(onActiveIndexChange).toHaveBeenCalledOnce()
    })

    // Prev/Next buttons are hidden for a single card, but the keyboard
    // handler exists regardless — it must no-op rather than error with
    // nothing to advance to. Focus lands on the card's own action button,
    // since the group container itself isn't tabbable.
    it('ignores ArrowRight on a single-card pile', async () => {
      const onActiveIndexChange = vi.fn()
      render(
        <CardPile onActiveIndexChange={onActiveIndexChange}>
          <PersonCard
            name="Ada Lovelace"
            footer={<button type="button">Share</button>}
          />
        </CardPile>,
      )

      screen.getByRole('button', { name: 'Share' }).focus()
      await userEvent.keyboard('{ArrowRight}')

      expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeVisible()
      expect(onActiveIndexChange).not.toHaveBeenCalled()
    })

    it('hides the controls for a single card', () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
        </CardPile>,
      )

      expect(
        screen.queryByRole('button', { name: 'Next card' }),
      ).not.toBeInTheDocument()
    })
  })

  describe('overflow', () => {
    it('caps rendered depth at maxVisible and badges the remainder', () => {
      render(
        <CardPile maxVisible={2}>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
          <PersonCard name="Katherine Johnson" />
          <PersonCard name="Margaret Hamilton" />
        </CardPile>,
      )

      expect(
        document.querySelectorAll('.deck-card-pile__layer'),
      ).toHaveLength(2)
      expect(screen.getByText('+2')).toBeVisible()
    })

    it('shows no badge when every card fits', () => {
      render(
        <CardPile maxVisible={3}>
          <PersonCard name="Ada Lovelace" />
          <PersonCard name="Grace Hopper" />
        </CardPile>,
      )

      expect(document.querySelector('.deck-card-pile__badge')).toBeNull()
    })
  })

  /*
   * The pile publishes its orientation as `data-card-orientation`, which is
   * what `PersonCard` lays itself out against — so the attribute is the
   * contract, not an implementation detail. The layout it produces is
   * measured in CardPile.stories.tsx, which runs in real Chromium; jsdom has
   * no layout and its `matchMedia` does not evaluate queries.
   */
  describe('orientation', () => {
    const pile = () => screen.getByRole('group')

    it('publishes a resolved orientation, never "responsive"', () => {
      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
        </CardPile>,
      )
      expect(pile()).toHaveAttribute('data-card-orientation', 'landscape')
    })

    it('honours a pinned orientation', () => {
      render(
        <CardPile orientation="portrait">
          <PersonCard name="Ada Lovelace" />
        </CardPile>,
      )
      expect(pile()).toHaveAttribute('data-card-orientation', 'portrait')
    })

    it('follows the viewport when responsive', () => {
      const listeners = new Set<() => void>()
      let narrow = true

      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          // Only the "narrower than sm" query varies; everything else
          // (prefers-reduced-motion) stays false.
          get matches() {
            return query.includes('min-width') ? narrow : false
          },
          addEventListener: (_: string, fn: () => void) => listeners.add(fn),
          removeEventListener: (_: string, fn: () => void) =>
            listeners.delete(fn),
        })),
      )

      render(
        <CardPile>
          <PersonCard name="Ada Lovelace" />
        </CardPile>,
      )
      expect(pile()).toHaveAttribute('data-card-orientation', 'portrait')

      // Widening the window turns the pile back on its side, without a
      // remount — the same pile, in a different room.
      act(() => {
        narrow = false
        listeners.forEach((fn) => fn())
      })
      expect(pile()).toHaveAttribute('data-card-orientation', 'landscape')

      vi.unstubAllGlobals()
    })
  })

  it('announces the current position for screen readers', async () => {
    render(
      <CardPile>
        <PersonCard name="Ada Lovelace" />
        <PersonCard name="Grace Hopper" />
      </CardPile>,
    )

    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

    expect(await screen.findByText('Card 2 of 2')).toBeInTheDocument()
  })

  it('forwards a ref to the container', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(
      <CardPile ref={ref}>
        <PersonCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  // No product path renders an empty pile today, but the render must still
  // degrade safely rather than throw if `children` ever resolves to nothing.
  it('renders without crashing when there are no children', () => {
    render(<CardPile>{null}</CardPile>)

    expect(screen.getByRole('group', { name: 'Card pile' })).toBeInTheDocument()
    expect(document.querySelector('.deck-card-pile__layer')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Next card' }),
    ).not.toBeInTheDocument()
  })

  describe('controlled position', () => {
    const three = ['Ada', 'Grace', 'Katherine'].map((name) => (
      <PersonCard key={name} name={name} />
    ))

    it('shows the index it is given', () => {
      render(
        <CardPile activeIndex={1} label="Cards">
          {three}
        </CardPile>,
      )
      // The front card is the only one not hidden from assistive tech.
      expect(screen.getByRole('heading', { name: 'Grace' })).toBeVisible()
    })

    // The point of the contract: a controlled pile asks rather than moves,
    // so a caller that ignores the request sees nothing change.
    it('does not move itself', async () => {
      const onActiveIndexChange = vi.fn()
      render(
        <CardPile
          activeIndex={0}
          onActiveIndexChange={onActiveIndexChange}
          label="Cards"
        >
          {three}
        </CardPile>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

      // The fly-out is on a timer, so wait for the request before checking
      // that nothing followed it.
      await waitFor(() =>
        expect(onActiveIndexChange).toHaveBeenCalledWith(1),
      )
      expect(screen.getByRole('heading', { name: 'Ada' })).toBeVisible()
    })

    it('follows the prop when it changes', () => {
      const { rerender } = render(
        <CardPile activeIndex={0} label="Cards">
          {three}
        </CardPile>,
      )
      expect(screen.getByRole('heading', { name: 'Ada' })).toBeVisible()

      rerender(
        <CardPile activeIndex={2} label="Cards">
          {three}
        </CardPile>,
      )
      expect(screen.getByRole('heading', { name: 'Katherine' })).toBeVisible()
    })

    // The pile loops, so a caller can hand over a raw counter without
    // having to know that.
    it('wraps an out-of-range index', () => {
      render(
        <CardPile activeIndex={4} label="Cards">
          {three}
        </CardPile>,
      )
      expect(screen.getByRole('heading', { name: 'Grace' })).toBeVisible()
    })

    it('still keeps its own position when uncontrolled', async () => {
      render(<CardPile label="Cards">{three}</CardPile>)

      await userEvent.click(screen.getByRole('button', { name: 'Next card' }))

      expect(
        await screen.findByRole('heading', { name: 'Grace' }),
      ).toBeVisible()
    })
  })
})
