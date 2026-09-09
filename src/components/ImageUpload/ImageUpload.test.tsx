import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ImageUpload } from './ImageUpload'

const file = () => new File(['x'], 'headshot.png', { type: 'image/png' })

describe('ImageUpload', () => {
  // The trigger is a real file input driven by its label, not a button that
  // clicks a hidden one — that is what keeps it keyboard-operable.
  it('exposes a file input named by its trigger', () => {
    render(<ImageUpload label="Profile photo" />)

    const input = screen.getByLabelText('Upload')
    expect(input).toHaveAttribute('type', 'file')
  })

  it('calls back with the chosen file', async () => {
    const onFileSelect = vi.fn()
    render(<ImageUpload label="Profile photo" onFileSelect={onFileSelect} />)

    await userEvent.upload(screen.getByLabelText('Upload'), file())
    expect(onFileSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'headshot.png' }),
    )
  })

  // A file picker gives no confirmation of its own.
  it('names the chosen file back to the reader', async () => {
    render(<ImageUpload label="Profile photo" />)

    await userEvent.upload(screen.getByLabelText('Upload'), file())
    expect(await screen.findByText('headshot.png')).toBeVisible()
  })

  it('says Replace once there is an image', () => {
    render(<ImageUpload label="Profile photo" src="/photo.png" />)
    expect(screen.getByLabelText('Replace')).toBeInTheDocument()
  })

  it('offers no remove control until there is something to remove', () => {
    const onRemove = vi.fn()
    render(<ImageUpload label="Profile photo" onRemove={onRemove} />)
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('removes the image', async () => {
    const onRemove = vi.fn()
    render(<ImageUpload label="Profile photo" src="/photo.png" onRemove={onRemove} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(onRemove).toHaveBeenCalled()
  })

  // Without clearing the input, re-picking the same file fires no change
  // event and the image never comes back.
  it('clears the input on remove so the same file can be picked again', async () => {
    const onFileSelect = vi.fn()
    render(
      <ImageUpload
        label="Profile photo"
        src="/photo.png"
        onRemove={() => {}}
        onFileSelect={onFileSelect}
      />,
    )

    const input = screen.getByLabelText<HTMLInputElement>('Replace')
    await userEvent.upload(input, file())
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    expect(input.value).toBe('')
  })

  // The field's own label already says what the image is.
  it('leaves the preview out of the accessibility tree', () => {
    render(<ImageUpload label="Profile photo" src="/photo.png" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('describes the input with its constraints', () => {
    render(
      <ImageUpload
        label="Profile photo"
        description="Square, at least 400×400px."
      />,
    )
    expect(screen.getByLabelText('Upload')).toHaveAccessibleDescription(
      'Square, at least 400×400px.',
    )
  })

  it('disables the input', () => {
    render(<ImageUpload label="Profile photo" disabled />)
    expect(screen.getByLabelText('Upload')).toBeDisabled()
  })
})
