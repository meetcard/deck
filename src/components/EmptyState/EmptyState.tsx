import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import './EmptyState.css'

/* `title` is overridden: the HTML attribute is a string tooltip, whereas an
   EmptyState heading is renderable content. */
export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  /** Decorative illustration or icon. Hidden from assistive tech. */
  media?: ReactNode
  /** The next step — usually a single primary Button. */
  actions?: ReactNode
  size?: 'sm' | 'md'
}

/**
 * The zero-data state for a list or surface.
 *
 * Every list in MeetCard has a meaningful empty state — a Rolodex with no
 * connections yet, a company with no events, a search with no matches — and
 * each is an opportunity to point at the next action rather than show a void.
 *
 * @example
 * <EmptyState
 *   title="No connections yet"
 *   description="Scan a card or share yours to start building your deck."
 *   actions={<Button>Exchange a card</Button>}
 * />
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    { title, description, media, actions, size = 'md', className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          'deck-empty-state',
          `deck-empty-state--${size}`,
          className,
        )}
        {...props}
      >
        {media ? (
          <div className="deck-empty-state__media" aria-hidden="true">
            {media}
          </div>
        ) : null}

        <Heading level={3} size={size === 'sm' ? 'sm' : 'md'}>
          {title}
        </Heading>

        {description ? (
          <Text size="sm" tone="muted" className="deck-empty-state__description">
            {description}
          </Text>
        ) : null}

        {actions ? (
          <div className="deck-empty-state__actions">{actions}</div>
        ) : null}
      </div>
    )
  },
)
