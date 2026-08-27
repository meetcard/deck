import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Stack } from '../Stack/Stack'
import { Tag } from './Tag'

const meta = {
  component: Tag,
  title: 'Build/Atoms/Tag',
  tags: ['atom'],
  args: { children: 'follow-up' },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

/** Read-only: a label on a connection. */
export const Default: Story = {}

export const Removable: Story = {
  args: { onRemove: fn() },
  play: async ({ canvas, userEvent, args }) => {
    // The tag text is folded into the control's name, so a screen reader
    // hears which tag is being removed.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove tag: follow-up' }),
    )
    await expect(args.onRemove).toHaveBeenCalledOnce()
  },
}

/** As a filter, the tag becomes a toggle button exposing `aria-pressed`. */
export const Filter: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>(['SaaSConf'])
    const toggle = (tag: string) =>
      setSelected((current) =>
        current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      )

    return (
      <Stack direction="row" gap={8} wrap>
        {['SaaSConf', 'follow-up', 'investor', 'warm'].map((tag) => (
          <Tag
            {...args}
            key={tag}
            onToggle={() => toggle(tag)}
            selected={selected.includes(tag)}
          >
            {tag}
          </Tag>
        ))}
      </Stack>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const tag = canvas.getByRole('button', { name: 'investor' })
    await expect(tag).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(tag)
    await expect(tag).toHaveAttribute('aria-pressed', 'true')
  },
}

/** A connection's tag list, as it appears on a contact record. */
export const TagList: Story = {
  render: function Render() {
    const [tags, setTags] = useState(['SaaSConf', 'follow-up', 'investor'])
    return (
      <Stack direction="row" gap={8} wrap>
        {tags.map((tag) => (
          <Tag
            key={tag}
            onRemove={() => setTags((t) => t.filter((x) => x !== tag))}
          >
            {tag}
          </Tag>
        ))}
      </Stack>
    )
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack direction="row" gap={8} align="center">
      <Tag {...args} size="sm">
        small
      </Tag>
      <Tag {...args} size="md">
        medium
      </Tag>
    </Stack>
  ),
}
