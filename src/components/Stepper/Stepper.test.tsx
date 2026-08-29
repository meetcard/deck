import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Stepper } from './Stepper'

const steps = [
  { id: 'purpose', label: 'Purpose' },
  { id: 'availability', label: 'Time' },
  { id: 'details', label: 'Details' },
  { id: 'booked', label: 'Confirmed' },
]

/** The same flow, with its last step marked complete-on-arrival. */
const terminalSteps = steps.map((step) =>
  step.id === 'booked' ? { ...step, terminal: true } : step,
)

describe('Stepper', () => {
  it('renders a labelled navigation landmark with an ordered list', () => {
    render(<Stepper steps={steps} currentStepId="availability" />)

    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('marks the current step with aria-current', () => {
    render(<Stepper steps={steps} currentStepId="availability" />)

    const current = screen.getByText('Time').closest('li')
    expect(current).toHaveAttribute('aria-current', 'step')
  })

  // State must not rest on the marker's color alone.
  it('spells out each step state for assistive tech', () => {
    render(<Stepper steps={steps} currentStepId="availability" />)

    expect(screen.getByText('(completed)')).toBeInTheDocument()
    expect(screen.getByText('(current step)')).toBeInTheDocument()
    expect(screen.getAllByText('(not yet reached)')).toHaveLength(2)
  })

  describe('a terminal step', () => {
    // The end of a flow asks for nothing, so a number it will never move past
    // is the wrong thing to show.
    it('draws a check rather than its step number while current', () => {
      const { container } = render(
        <Stepper steps={terminalSteps} currentStepId="booked" />,
      )

      const marker = container.querySelector(
        '.deck-stepper__step--terminal .deck-stepper__marker',
      )
      expect(marker?.querySelector('svg')).toBeInTheDocument()
      expect(marker).not.toHaveTextContent('4')
    })

    it('reports itself as completed, not merely current', () => {
      render(<Stepper steps={terminalSteps} currentStepId="booked" />)

      const booked = screen.getByText('Confirmed').closest('li')
      expect(booked).toHaveTextContent('(completed)')
    })

    // It is still where the flow is, so it must keep announcing its position.
    it('keeps aria-current so its place in the flow is still announced', () => {
      render(<Stepper steps={terminalSteps} currentStepId="booked" />)

      const booked = screen.getByText('Confirmed').closest('li')
      expect(booked).toHaveAttribute('aria-current', 'step')
    })

    it('draws its number normally before it is reached', () => {
      const { container } = render(
        <Stepper steps={terminalSteps} currentStepId="purpose" />,
      )

      expect(
        container.querySelector('.deck-stepper__step--terminal'),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Confirmed').closest('li')).toHaveTextContent('4')
    })
  })

  describe('navigation', () => {
    it('lets a completed step be revisited', async () => {
      const onSelect = vi.fn()
      render(
        <Stepper steps={steps} currentStepId="details" onSelect={onSelect} />,
      )

      await userEvent.click(screen.getByRole('button', { name: /Purpose/ }))

      expect(onSelect).toHaveBeenCalledWith('purpose')
    })

    // You cannot skip ahead to a step you have not reached.
    it('leaves upcoming steps inert', () => {
      render(
        <Stepper steps={steps} currentStepId="purpose" onSelect={vi.fn()} />,
      )

      expect(
        screen.queryByRole('button', { name: /Confirmed/ }),
      ).not.toBeInTheDocument()
    })

    it('does not make the current step actionable', () => {
      render(
        <Stepper steps={steps} currentStepId="details" onSelect={vi.fn()} />,
      )

      expect(
        screen.queryByRole('button', { name: /Details/ }),
      ).not.toBeInTheDocument()
    })

    it('leaves a terminal step inert even though it draws as complete', () => {
      render(
        <Stepper
          steps={terminalSteps}
          currentStepId="booked"
          onSelect={vi.fn()}
        />,
      )

      // There is nowhere to navigate to from the end, so the marker must not
      // become a control that returns to the step you are already on.
      expect(
        screen.queryByRole('button', { name: /Confirmed/ }),
      ).not.toBeInTheDocument()
    })

    it('renders completed steps as links when href is given', () => {
      render(
        <Stepper
          currentStepId="details"
          steps={steps.map((s) => ({ ...s, href: `/ben/book/${s.id}` }))}
        />,
      )

      expect(screen.getByRole('link', { name: /Purpose/ })).toHaveAttribute(
        'href',
        '/ben/book/purpose',
      )
    })
  })
})
