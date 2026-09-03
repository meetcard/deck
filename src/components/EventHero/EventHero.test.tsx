import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EventHero, EventHeroPanel } from './EventHero'

const share = { value: 'meetcard.io/events/revops' }

describe('EventHero', () => {
  it('renders the name at the requested heading level', () => {
    render(<EventHero name="RevOps Summit" level={1} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
    ).toBeInTheDocument()
  })

  it('links the name when given an href', () => {
    render(<EventHero name="RevOps Summit" href="/events/revops" />)
    expect(screen.getByRole('link', { name: 'RevOps Summit' })).toHaveAttribute(
      'href',
      '/events/revops',
    )
  })

  it('promotes the eyebrow to a heading when asked', () => {
    render(<EventHero name="RevOps Summit" eyebrow="Events" eyebrowAs="h1" />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Events' }),
    ).toBeInTheDocument()
  })

  it('leaves the cover out of the accessibility tree', () => {
    render(<EventHero name="RevOps Summit" coverSrc="/cover.jpg" />)
    // The picture says nothing the name and date do not; describing it would
    // only put "stock photo of a stage" between a screen reader and the event.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  describe('sharing', () => {
    it('shows the code in place of the details', () => {
      render(
        <EventHero name="RevOps Summit" share={share} defaultView="share">
          <p>500 E Cesar Chavez St</p>
        </EventHero>,
      )

      expect(screen.getByLabelText('Share link')).toHaveValue(share.value)
      expect(screen.queryByText('500 E Cesar Chavez St')).not.toBeInTheDocument()
    })

    // The event's name is the hero's heading whichever face is showing —
    // an event page whose `h1` disappears while you share it has no title.
    it('keeps naming the event', () => {
      render(
        <EventHero
          name="RevOps Summit"
          level={1}
          share={share}
          defaultView="share"
        />,
      )
      expect(
        screen.getByRole('heading', { level: 1, name: 'RevOps Summit' }),
      ).toBeInTheDocument()
    })

    // Someone who cannot scan still needs the destination.
    it('carries the link in the code’s accessible name', () => {
      render(<EventHero name="RevOps Summit" share={share} defaultView="share" />)
      expect(
        screen.getByRole('img', { name: `QR code for ${share.value}` }),
      ).toBeInTheDocument()
    })

    it('turns back from its own corner', async () => {
      render(
        <EventHero name="RevOps Summit" share={share} defaultView="share">
          <p>500 E Cesar Chavez St</p>
        </EventHero>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Close share' }))

      expect(screen.getByText('500 E Cesar Chavez St')).toBeInTheDocument()
      expect(screen.queryByLabelText('Share link')).not.toBeInTheDocument()
    })

    it('lets the caller drive the face instead', async () => {
      const onViewChange = vi.fn()
      render(
        <EventHero
          name="RevOps Summit"
          share={share}
          view="share"
          onViewChange={onViewChange}
        >
          <p>500 E Cesar Chavez St</p>
        </EventHero>,
      )

      await userEvent.click(screen.getByRole('button', { name: 'Close share' }))

      expect(onViewChange).toHaveBeenCalledWith('detail')
      // Controlled: the hero waits to be told, rather than turning itself.
      expect(screen.getByLabelText('Share link')).toBeInTheDocument()
    })

    it('omits each action unless it is handled', () => {
      const { rerender } = render(
        <EventHero name="RevOps Summit" share={share} defaultView="share" />,
      )
      expect(screen.queryByRole('button', { name: 'Download QR' })).toBeNull()
      expect(
        screen.queryByRole('button', { name: 'Share on LinkedIn' }),
      ).toBeNull()

      rerender(
        <EventHero
          name="RevOps Summit"
          share={{ ...share, onDownloadQr: () => {} }}
          defaultView="share"
        />,
      )
      expect(
        screen.getByRole('button', { name: 'Download QR' }),
      ).toBeInTheDocument()
    })

    // Without a link there is nothing to turn to, so the hero stays put
    // rather than showing an empty plate.
    it('ignores the share face with nothing to share', () => {
      render(
        <EventHero name="RevOps Summit" defaultView="share">
          <p>500 E Cesar Chavez St</p>
        </EventHero>,
      )
      expect(screen.getByText('500 E Cesar Chavez St')).toBeInTheDocument()
    })
  })
})

describe('EventHeroPanel', () => {
  it('is a link when given an href, and plain otherwise', () => {
    const { rerender } = render(<EventHeroPanel title="Boulder Climate" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()

    rerender(<EventHeroPanel title="Boulder Climate" href="/events/climate" />)
    expect(screen.getByRole('link', { name: /Boulder Climate/ })).toHaveAttribute(
      'href',
      '/events/climate',
    )
  })
})
