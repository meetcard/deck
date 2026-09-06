import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Card } from '../Card/Card'
import { Stack } from '../Stack/Stack'
import { ImageUpload } from './ImageUpload'

const PHOTO =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=256&h=256&fit=crop'

const meta = {
  component: ImageUpload,
  title: 'Build/Molecules/ImageUpload',
  tags: ['molecule'],
  args: {
    label: 'Profile photo',
    description: 'Square, at least 400×400px. JPG or PNG.',
    shape: 'circle',
  },
  render: (args) => (
    <Card style={{ maxWidth: 480 }}>
      <ImageUpload {...args} />
    </Card>
  ),
} satisfies Meta<typeof ImageUpload>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing uploaded yet. The constraints are stated before the picker opens. */
export const Empty: Story = {
  play: async ({ canvas }) => {
    // A real file input, reachable by keyboard and announced as one.
    const input = canvas.getByLabelText('Upload')
    await expect(input).toHaveAttribute('type', 'file')
  },
}

export const WithImage: Story = {
  args: { src: PHOTO, onRemove: () => {} },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Replace')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeVisible()
  },
}

/**
 * The three crops, side by side. The preview wears the shape the image will
 * actually be used at — a person's photo, a company mark, a wide banner.
 */
export const Shapes: Story = {
  render: () => (
    <Stack gap={24} style={{ maxWidth: 480 }}>
      <ImageUpload
        label="Profile photo"
        shape="circle"
        src={PHOTO}
        description="Square, at least 400×400px."
      />
      <ImageUpload
        label="Logo"
        shape="square"
        description="Full-colour mark for light backgrounds. Square PNG or SVG."
      />
      <ImageUpload
        label="Cover image"
        shape="cover"
        description="4:3 image (1600×1200 recommended)."
      />
    </Stack>
  ),
}

/** Choosing a file names it back, since a picker confirms nothing itself. */
export const ReportsTheChosenFile: Story = {
  render: function Render(args) {
    const [name, setName] = useState<string | null>(null)
    return (
      <Card style={{ maxWidth: 480 }}>
        <ImageUpload {...args} onFileSelect={(file) => setName(file?.name ?? null)} />
        <p style={{ marginTop: 12, fontSize: 12 }}>Caller received: {name ?? '—'}</p>
      </Card>
    )
  },
}

export const Disabled: Story = {
  args: { src: PHOTO, disabled: true },
}
