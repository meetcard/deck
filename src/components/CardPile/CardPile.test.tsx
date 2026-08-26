import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MeetCard } from '../MeetCard/MeetCard'
import { CardPile } from './CardPile'

// Pointer-drag (swipe) behaviour is exercised in CardPile.stories.tsx, which
// runs in real Chromium — jsdom's PointerEvent support is incomplete, and
// the two engines disagreeing here isn't worth chasing (see CONTRIBUTING).

describe('CardPile', () => {
  it('renders a labelled group', () => {
    render(
      <CardPile label="Ada's cards">
        <MeetCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(screen.getByRole('group', { name: "Ada's cards" })).toBeInTheDocument()
  })

  it('falls back to a default label', () => {
    render(
      <CardPile>
        <MeetCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(screen.getByRole('group', { name: 'Card pile' })).toBeInTheDocument()
  })

  describe('accessibility of layered cards', () => {
    it('exposes only the front card to assistive tech', () => {
      render(
        <CardPile>
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
          <MeetCard name="Katherine Johnson" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
        </CardPile>,
      )

      screen.getByRole('button', { name: 'Next card' }).focus()
      await userEvent.keyboard('{ArrowRight}')

      expect(
        await screen.findByRole('heading', { name: 'Grace Hopper' }),
      ).toBeVisible()
    })

    it('hides the controls for a single card', () => {
      render(
        <CardPile>
          <MeetCard name="Ada Lovelace" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
          <MeetCard name="Katherine Johnson" />
          <MeetCard name="Margaret Hamilton" />
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
          <MeetCard name="Ada Lovelace" />
          <MeetCard name="Grace Hopper" />
        </CardPile>,
      )

      expect(document.querySelector('.deck-card-pile__badge')).toBeNull()
    })
  })

  it('announces the current position for screen readers', async () => {
    render(
      <CardPile>
        <MeetCard name="Ada Lovelace" />
        <MeetCard name="Grace Hopper" />
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
        <MeetCard name="Ada Lovelace" />
      </CardPile>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
