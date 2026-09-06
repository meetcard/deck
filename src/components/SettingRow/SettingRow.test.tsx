import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../Button/Button'
import { SettingRow } from './SettingRow'

describe('SettingRow', () => {
  it('labels the switch with the row title', () => {
    render(<SettingRow title="New connection" checked={false} />)
    expect(screen.getByRole('switch', { name: 'New connection' })).toBeInTheDocument()
  })

  // The point of folding the label into the switch: the words are the hit
  // target, not just decoration beside it.
  it('toggles when the title is clicked', async () => {
    const onCheckedChange = vi.fn()
    render(
      <SettingRow
        title="New connection"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )

    await userEvent.click(screen.getByText('New connection'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('reports the current state to assistive tech', () => {
    render(<SettingRow title="Push" checked />)
    expect(screen.getByRole('switch', { name: 'Push' })).toBeChecked()
  })

  it('describes the switch with the row description', () => {
    render(
      <SettingRow
        title="New lead"
        description="When a connection is flagged as a potential lead."
        checked
      />,
    )
    expect(screen.getByRole('switch', { name: 'New lead' })).toHaveAccessibleDescription(
      'When a connection is flagged as a potential lead.',
    )
  })

  it('renders an arbitrary control when it is not a toggle', () => {
    render(
      <SettingRow
        title="Export my data"
        control={<Button variant="secondary">Export</Button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('does not toggle while disabled', async () => {
    const onCheckedChange = vi.fn()
    render(
      <SettingRow
        title="Push"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />,
    )

    await userEvent.click(screen.getByText('Push'))
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(screen.getByRole('switch', { name: 'Push' })).toBeDisabled()
  })

  it('renders follow-on detail below the row', () => {
    render(
      <SettingRow title="Follow-up reminders" checked>
        <p>Weekly</p>
      </SettingRow>,
    )
    expect(screen.getByText('Weekly')).toBeVisible()
  })
})
