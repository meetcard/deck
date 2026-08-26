import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { Heading } from '../Heading/Heading'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Card, CardBody, CardFooter, CardHeader } from './Card'

const meta = {
  component: Card,
  tags: ['molecule'],
  subcomponents: { CardHeader, CardBody, CardFooter },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <Text>A card is the base surface for every MeetCard experience.</Text>
    </Card>
  ),
}

/**
 * The standard composition. Note that padding is set once on `Card` — the
 * section dividers bleed to the edge on their own.
 */
export const Composed: Story = {
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <CardHeader divided>
        <Heading level={3} size="sm">
          Ada Lovelace
        </Heading>
        <Badge tone="success" dot>
          Connected
        </Badge>
      </CardHeader>
      <CardBody>
        <Text size="sm" tone="muted">
          Head of Partnerships · MeetCard
        </Text>
      </CardBody>
      <CardFooter divided>
        <Button size="sm">Share card</Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const Surfaces: Story = {
  render: () => (
    <Stack direction="row" gap={16} wrap>
      {(['elevated', 'default', 'subtle', 'brand'] as const).map((surface) => (
        <Card key={surface} surface={surface} style={{ width: 160 }}>
          <Text size="sm">{surface}</Text>
        </Card>
      ))}
    </Stack>
  ),
}

export const Elevations: Story = {
  render: () => (
    <Stack direction="row" gap={24} wrap>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((elevation) => (
        <Card key={elevation} elevation={elevation} style={{ width: 120 }}>
          <Text size="sm">{elevation}</Text>
        </Card>
      ))}
    </Stack>
  ),
}

/**
 * `interactive` adds the tactile lift. It is visual only — the card still
 * needs a real focusable child, which is why the button below is present.
 */
export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 360 }}>
      <CardHeader>
        <Heading level={3} size="sm">
          Tap target
        </Heading>
      </CardHeader>
      <CardBody>
        <Text size="sm" tone="muted">
          Hover to see the lift; tab to see focus surface the whole card.
        </Text>
      </CardBody>
      <CardFooter>
        <Button size="sm" variant="secondary">
          Open
        </Button>
      </CardFooter>
    </Card>
  ),
}
