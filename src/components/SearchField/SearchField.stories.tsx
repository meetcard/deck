import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { PersonCard } from '../PersonCard/PersonCard'
import { Stack } from '../Stack/Stack'
import { EmptyState } from '../EmptyState/EmptyState'
import { SearchField } from './SearchField'

const people = [
  { name: 'Ada Lovelace', title: 'Head of Partnerships', company: 'MeetCard' },
  { name: 'Grace Hopper', title: 'Principal Engineer', company: 'MeetCard' },
  { name: 'Katherine Johnson', title: 'Mathematician', company: 'NASA' },
]

const meta = {
  component: SearchField,
  title: 'Build/Molecules/SearchField',
  tags: ['molecule'],
  args: { label: 'Search connections', placeholder: 'Search connections' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <SearchField {...args} />
    </div>
  ),
} satisfies Meta<typeof SearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    // type="search" gives mobile keyboards a Search key.
    await expect(canvas.getByLabelText('Search connections')).toHaveAttribute(
      'type',
      'search',
    )
  },
}

export const WithVisibleLabel: Story = {
  args: { showLabel: true },
}

/** Search is the primary interaction in a contact list. */
export const FilteringRolodex: Story = {
  render: function Render(args) {
    const [query, setQuery] = useState('')
    const results = useMemo(
      () =>
        people.filter((p) =>
          `${p.name} ${p.company}`.toLowerCase().includes(query.toLowerCase()),
        ),
      [query],
    )

    return (
      <Stack gap={16} style={{ maxWidth: 420 }}>
        <SearchField
          {...args}
          value={query}
          resultCount={results.length}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />

        {results.length > 0 ? (
          <Stack as="ul" gap={8}>
            {results.map((person) => (
              <li key={person.name}>
                <PersonCard {...person} />
              </li>
            ))}
          </Stack>
        ) : (
          <EmptyState
            size="sm"
            title="No matches"
            description={`Nothing matched "${query}".`}
          />
        )}
      </Stack>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText('Search connections')
    await userEvent.type(input, 'nasa')

    await expect(
      await canvas.findByRole('heading', { name: 'Katherine Johnson' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('heading', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument()

    // Clearing restores the full list and returns focus to the input.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    await expect(input).toHaveFocus()
    await expect(
      await canvas.findByRole('heading', { name: 'Ada Lovelace' }),
    ).toBeVisible()
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={12} style={{ maxWidth: 360 }}>
      <SearchField {...args} size="sm" label="Small" />
      <SearchField {...args} size="md" label="Medium" />
      <SearchField {...args} size="lg" label="Large" />
    </Stack>
  ),
}
