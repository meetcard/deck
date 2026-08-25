import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Radio, RadioGroup } from './Radio'

function ControlledGroup({ onChange }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState('link')
  return (
    <RadioGroup
      label="Card visibility"
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    >
      <Radio value="link" label="Anyone with the link" />
      <Radio value="private" label="Only me" />
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  // The fieldset/legend pairing is what tells assistive tech these options
  // belong to one question.
  it('exposes the options as a named group', () => {
    render(<ControlledGroup />)
    expect(
      screen.getByRole('group', { name: 'Card visibility' }),
    ).toBeInTheDocument()
  })

  it('gives every option the same name so only one can be selected', () => {
    render(<ControlledGroup />)

    const [first, second] = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(first.name).toBe(second.name)
    expect(first.name).not.toBe('')
  })

  it('moves selection when another option is chosen', async () => {
    const onChange = vi.fn()
    render(<ControlledGroup onChange={onChange} />)

    await userEvent.click(screen.getByRole('radio', { name: 'Only me' }))

    expect(screen.getByRole('radio', { name: 'Only me' })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: 'Anyone with the link' }),
    ).not.toBeChecked()
    expect(onChange).toHaveBeenCalledWith('private')
  })

  it('supports arrow-key navigation between options', async () => {
    render(<ControlledGroup />)

    await userEvent.tab()
    expect(screen.getByRole('radio', { name: 'Anyone with the link' })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')

    expect(screen.getByRole('radio', { name: 'Only me' })).toBeChecked()
  })

  it('disables every option when the group is disabled', () => {
    render(
      <RadioGroup label="Card visibility" disabled value="link">
        <Radio value="link" label="Anyone with the link" />
        <Radio value="private" label="Only me" />
      </RadioGroup>,
    )

    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled()
    }
  })

  it('announces a group-level error', () => {
    render(
      <RadioGroup label="Card visibility" error="Choose who can see your card">
        <Radio value="link" label="Anyone with the link" />
      </RadioGroup>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Choose who can see your card',
    )
  })
})
