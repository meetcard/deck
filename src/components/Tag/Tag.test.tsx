import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders as plain text when read-only', () => {
    render(<Tag>follow-up</Tag>)

    expect(screen.getByText('follow-up')).toBeVisible()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  describe('removable', () => {
    it('names the remove control with the tag text', () => {
      render(<Tag onRemove={vi.fn()}>follow-up</Tag>)
      expect(
        screen.getByRole('button', { name: 'Remove tag: follow-up' }),
      ).toBeVisible()
    })

    it('calls onRemove', async () => {
      const onRemove = vi.fn()
      render(<Tag onRemove={onRemove}>follow-up</Tag>)

      await userEvent.click(screen.getByRole('button'))

      expect(onRemove).toHaveBeenCalledOnce()
    })
  })

  describe('as a filter', () => {
    // Selection must be announced; color alone is not sufficient.
    it('exposes pressed state', () => {
      render(
        <Tag onToggle={vi.fn()} selected>
          SaaSConf
        </Tag>,
      )

      expect(screen.getByRole('button', { name: 'SaaSConf' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('reports unpressed when not selected', () => {
      render(<Tag onToggle={vi.fn()}>SaaSConf</Tag>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    })

    it('toggles on click and by keyboard', async () => {
      const onToggle = vi.fn()
      render(<Tag onToggle={onToggle}>SaaSConf</Tag>)

      const tag = screen.getByRole('button')

      await userEvent.click(tag)
      // The click leaves focus on the tag, so Enter activates it again.
      expect(tag).toHaveFocus()
      await userEvent.keyboard('{Enter}')

      expect(onToggle).toHaveBeenCalledTimes(2)
    })
  })
})
