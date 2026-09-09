import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { ColorField } from './ColorField'

const meta = {
  component: ColorField,
  title: 'Build/Molecules/ColorField',
  tags: ['molecule'],
  args: {
    label: 'Primary color',
    colorName: 'Signal Green',
    value: '#2E6E5B',
  },
  render: function Wired(args) {
    const [value, setValue] = useState(args.value)
    return (
      <div style={{ maxWidth: 320 }}>
        <ColorField {...args} value={value} onValueChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof ColorField>

export default meta
type Story = StoryObj<typeof meta>

/** A brand colour: pick it, or paste the hex out of the guidelines. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /Primary color/ }),
    ).toHaveValue('#2E6E5B')
    // The picker is its own control with its own name — two inputs cannot
    // share one label.
    await expect(canvas.getByLabelText('Primary color swatch')).toBeVisible()
  },
}

/** Typed rather than picked, which is how a brand colour usually arrives. */
export const TypingAHex: Story = {
  play: async ({ canvas, userEvent }) => {
    const hex = canvas.getByRole('textbox', { name: /Primary color/ })
    await userEvent.clear(hex)
    await userEvent.type(hex, '#C66A4A')
    await expect(hex).toHaveValue('#C66A4A')
    await expect(canvas.getByLabelText('Primary color swatch')).toHaveValue(
      '#c66a4a',
    )
  },
}

/** Without a brand name — just the field, for a one-off colour. */
export const WithoutAColorName: Story = {
  args: { colorName: undefined, label: 'Highlight' },
}

/** The pair a company's brand actually comes in. */
export const APairOfBrandColors: Story = {
  render: function Pair() {
    const [primary, setPrimary] = useState('#2E6E5B')
    const [accent, setAccent] = useState('#C66A4A')
    return (
      <Stack gap={16} style={{ maxWidth: 320 }}>
        <ColorField
          label="Primary color"
          colorName="Signal Green"
          value={primary}
          onValueChange={setPrimary}
        />
        <ColorField
          label="Accent color"
          colorName="Warm Clay"
          value={accent}
          onValueChange={setAccent}
        />
      </Stack>
    )
  },
}
