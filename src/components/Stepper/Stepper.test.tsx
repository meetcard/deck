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
