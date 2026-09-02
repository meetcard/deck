import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PersonCard } from './PersonCard'

describe('PersonCard', () => {
  it('renders the name as a heading inside an article', () => {
    render(<PersonCard name="Ben Ackles" />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ben Ackles' })).toBeVisible()
  })

  it('defaults the eyebrow to "Meet"', () => {
    render(<PersonCard name="Ben Ackles" />)
    expect(screen.getByText('Meet')).toBeVisible()
  })

  it('accepts a custom eyebrow', () => {
    render(<PersonCard name="Ben Ackles" eyebrow="Founder" />)
    expect(screen.getByText('Founder')).toBeVisible()
    expect(screen.queryByText('Meet')).not.toBeInTheDocument()
  })

  it('does not announce the avatar separately from the name', () => {
    render(<PersonCard name="Ben Ackles" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  describe('detail line', () => {
    it('reads as a sentence, not as three fields', () => {
      render(
        <PersonCard
          name="Ben Ackles"
          title="Builder"
          company="MeetCard"
          location="Boulder, Colorado"
        />,
      )

      expect(
        document.querySelector('.deck-person-card__detail'),
      ).toHaveTextContent('Builder at MeetCard in Boulder, Colorado')
    })

    it('drops the connectives it has nothing to connect', () => {
      render(<PersonCard name="Ben Ackles" location="Boulder, Colorado" />)

      expect(
        document.querySelector('.deck-person-card__detail'),
      ).toHaveTextContent('Boulder, Colorado')
      expect(screen.queryByText(/\bin\b/)).not.toBeInTheDocument()
    })

    it('renders company as a link when companyHref is given', () => {
      render(
        <PersonCard name="Ben Ackles" company="MeetCard" companyHref="/c/meetcard" />,
      )

      expect(screen.getByRole('link', { name: 'MeetCard' })).toHaveAttribute(
        'href',
        '/c/meetcard',
      )
    })

    it('renders company as plain text without companyHref', () => {
      render(<PersonCard name="Ben Ackles" company="MeetCard" />)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.getByText('MeetCard')).toBeVisible()
    })

    it('omits the line entirely when no detail is given', () => {
      render(<PersonCard name="Ben Ackles" />)
      expect(document.querySelector('.deck-person-card__detail')).toBeNull()
    })
  })

  describe('tagline and private note', () => {
    it('renders the tagline', () => {
      render(<PersonCard name="Ben Ackles" tagline="What a lovable guy" />)
      expect(screen.getByText('What a lovable guy')).toBeVisible()
    })

    it('renders the private note with a default label and calls onClick', async () => {
      const onClick = vi.fn()
      render(<PersonCard name="Ben Ackles" privateNote={{ onClick }} />)

      const note = screen.getByRole('button', { name: /Your private note/ })
      expect(note).toBeVisible()

      await userEvent.click(note)
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('accepts a custom private note label', () => {
      render(<PersonCard name="Ben Ackles" privateNote={{ label: 'Follow up next week' }} />)
      expect(
        screen.getByRole('button', { name: 'Follow up next week' }),
      ).toBeVisible()
    })

    it('shows an unread indicator only when hasContent is true', () => {
      const { rerender } = render(
        <PersonCard name="Ben Ackles" privateNote={{ hasContent: false }} />,
      )
      expect(document.querySelector('.deck-person-card__note-dot')).toBeNull()

      rerender(<PersonCard name="Ben Ackles" privateNote={{ hasContent: true }} />)
      expect(
        document.querySelector('.deck-person-card__note-dot'),
      ).not.toBeNull()
    })

    it('omits the meta row entirely without a tagline or private note', () => {
      render(<PersonCard name="Ben Ackles" />)
      expect(document.querySelector('.deck-person-card__meta-row')).toBeNull()
    })
  })

  it('renders contact actions and a footer as passed-through slots', () => {
    render(
      <PersonCard
        name="Ben Ackles"
        contactActions={<button type="button">Email</button>}
        footer={<button type="button">Book with me</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Email' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Book with me' })).toBeVisible()
  })

  describe('the card as a branded object', () => {
    it('puts the theme on the shell as custom properties', () => {
      const { container } = render(
        <PersonCard
          name="Ben Ackles"
          theme={{ primary: '#2E6E5B', accent: '#C66A4A' }}
        />,
      )

      const shell = container.firstElementChild as HTMLElement
      expect(shell.style.getPropertyValue('--deck-card-brand')).toBe('#2E6E5B')
      expect(shell.style.getPropertyValue('--deck-card-accent')).toBe('#C66A4A')
    })

    it('falls back to the primary when no accent is given', () => {
      const { container } = render(
        <PersonCard name="Ben Ackles" theme={{ primary: '#2E6E5B' }} />,
      )

      const shell = container.firstElementChild as HTMLElement
      expect(shell.style.getPropertyValue('--deck-card-accent')).toBe('#2E6E5B')
    })

    it('renders the kind as a chip', () => {
      render(<PersonCard name="Ben Ackles" kind="Business" />)
      expect(screen.getByText('Business')).toBeVisible()
    })

    it('names the edit control and calls it', async () => {
      const onEdit = vi.fn()
      const user = userEvent.setup()
      render(<PersonCard name="Ben Ackles" onEdit={onEdit} />)

      await user.click(screen.getByRole('button', { name: 'Edit card' }))
      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('has no edit control unless one is asked for', () => {
      render(<PersonCard name="Ben Ackles" />)
      expect(screen.queryByRole('button', { name: 'Edit card' })).toBeNull()
    })

    // The photograph is on the card at a size you can see. Announcing the
    // blurred copy behind it would say the same thing twice, and say it worse.
    it('builds the ground from the portrait, decoratively', () => {
      render(<PersonCard name="Ben Ackles" avatarSrc="/ben.jpg" />)

      const ground = document.querySelector('.deck-person-card__ground-photo')
      expect(ground).toHaveAttribute('src', '/ben.jpg')
      expect(ground).toHaveAttribute('alt', '')
    })

    it('takes no ground at all when asked for none', () => {
      render(<PersonCard name="Ben Ackles" avatarSrc="/ben.jpg" backdropSrc={null} />)
      expect(
        document.querySelector('.deck-person-card__ground-photo'),
      ).toBeNull()
    })
  })

  it('forwards a ref to the card element', () => {
    const ref = { current: null as HTMLElement | null }
    render(<PersonCard ref={ref} name="Ben Ackles" />)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  describe('with a back', () => {
    const back = <p>Note surface</p>

    // The shell is always there — it is the container the card's own metrics
    // are a percentage of — but it only becomes a flip when there is a second
    // face to turn to.
    it('does not make the shell a flip when there is no back', () => {
      const { container } = render(<PersonCard name="Ada Lovelace" />)
      expect(container.firstElementChild).toHaveClass('deck-person-card-shell')
      expect(container.querySelector('.deck-person-card-flip')).toBeNull()
    })

    // Asserted through inert/aria-hidden rather than `toBeVisible`: the
    // hiding is done by `backface-visibility`, and jsdom applies no CSS. The
    // attributes are the part that carries meaning to assistive tech anyway.
    it('shows the face and hides the back to begin with', () => {
      render(
        <PersonCard
          name="Ada Lovelace"
          privateNote={{ hasContent: false }}
          back={back}
        />,
      )
      expect(screen.getByRole('article')).toBeInTheDocument()

      const backFace = screen.getByText('Note surface').closest('div')
      expect(backFace).toHaveAttribute('aria-hidden', 'true')
    })

    it('turns over when the private note is opened', async () => {
      render(
        <PersonCard
          name="Ada Lovelace"
          privateNote={{ hasContent: false }}
          back={back}
        />,
      )

      const control = screen.getByRole('button', { name: /Your private note/ })
      expect(control).toHaveAttribute('aria-expanded', 'false')

      await userEvent.click(control)

      expect(control).toHaveAttribute('aria-expanded', 'true')
    })

    it('reports the turn when controlled', async () => {
      const onFlippedChange = vi.fn()
      render(
        <PersonCard
          name="Ada Lovelace"
          privateNote={{ hasContent: false }}
          back={back}
          flipped={false}
          onFlippedChange={onFlippedChange}
        />,
      )

      await userEvent.click(
        screen.getByRole('button', { name: /Your private note/ }),
      )

      expect(onFlippedChange).toHaveBeenCalledWith(true)
    })

    // Backface-visibility only stops the hidden side being painted; without
    // inert it would still take focus and be read out.
    it('keeps the hidden side out of reach', () => {
      const { rerender } = render(
        <PersonCard name="Ada Lovelace" back={<button>On the back</button>} />,
      )

      // Not merely unpainted — unreachable. Testing Library omits inert
      // subtrees from the accessibility tree, so failing to find it is the
      // assertion. `backface-visibility` alone would still leave it focusable.
      expect(screen.queryByRole('button', { name: 'On the back' })).toBeNull()
      expect(screen.getByRole('article')).toBeInTheDocument()

      rerender(
        <PersonCard
          name="Ada Lovelace"
          back={<button>On the back</button>}
          flipped
        />,
      )

      // …and the two swap cleanly, rather than both being live at once.
      expect(
        screen.getByRole('button', { name: 'On the back' }),
      ).toBeInTheDocument()
      expect(screen.queryByRole('article')).toBeNull()
    })
  })
})
