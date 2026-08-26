import { Card } from '../components/Card/Card'
import { Heading } from '../components/Heading/Heading'
import { Text } from '../components/Text/Text'

export interface PagePlaceholderProps {
  /** The page's name, e.g. "Dashboard". */
  title: string
  /** One line describing what this page will eventually do. */
  description: string
}

/**
 * Stand-in for a page that hasn't been designed yet. Scaffolds the sidebar
 * entry and the file a real composition will replace, so navigation and
 * routing can be wired up before the design is finished.
 */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100%', padding: 32 }}>
      <Card
        as="section"
        surface="subtle"
        elevation="none"
        style={{
          margin: 'auto',
          maxWidth: 480,
          textAlign: 'center',
          padding: '48px 32px',
        }}
      >
        <Heading level={2} size="lg" style={{ marginBottom: 8 }}>
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </Card>
    </div>
  )
}
