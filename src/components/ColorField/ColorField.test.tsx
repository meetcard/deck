import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ColorField } from './ColorField'

function Wired({ initial = '#2E6E5B' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <ColorField
      label="Primary color"
      colorName="Signal Green"
      value={value}
      onValueChange={setValue}
    />
  )
}

describe('ColorField', () => {
  it('labels the hex field and the swatch as different controls', () => {
    render(<Wired />)
    expect(
      screen.getByRole('textbox', { name: /Primary color/ }),
    ).toHaveValue('#2E6E5B')
    expect(screen.getByLabelText('Primary color swatch')).toHaveValue('#2e6e5b')
  })

  it('shows the brand name for the colour beside the label', () => {
    render(<Wired />)
    expect(screen.getByText(/Signal Green/)).toBeVisible()
  })

  it('reports what is typed', async () => {
    const onValueChange = vi.fn()
    render(
      <ColorField label="Accent color" value="#C66A4A" onValueChange={onValueChange} />,
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Accent color' }), '0')
    expect(onValueChange).toHaveBeenCalledWith('#C66A4A0')
  })

  // A half-typed hex would snap the picker to black between keystrokes.
  it('holds the swatch until the hex is complete', () => {
    render(
      <ColorField label="Primary color" value="#2E6" onValueChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Primary color swatch')).toHaveValue('#000000')
  })

  it('follows the swatch when the picker changes it', async () => {
    render(<Wired />)

    const swatch = screen.getByLabelText<HTMLInputElement>('Primary color swatch')
    await userEvent.clear(screen.getByRole('textbox', { name: /Primary color/ }))
    expect(swatch).toBeInTheDocument()
  })
})
