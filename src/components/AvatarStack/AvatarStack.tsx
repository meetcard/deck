import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Avatar } from '../Avatar/Avatar'
import './AvatarStack.css'

export interface AvatarStackPerson {
  /** Both the accessible name and the source of the initials fallback. */
  name: string
  /** Photo or logo. Falls back to initials, as `Avatar` does. */
  src?: string
}

/**
 * Deliberately short of `Avatar`'s own scale. A stack overlaps its faces, and
 * past `md` the overlap starts hiding whole initials rather than an edge —
 * at which point what you want is a list, not a stack.
 */
export type AvatarStackSize = 'xs' | 'sm' | 'md'

export interface AvatarStackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  people: AvatarStackPerson[]
  /** How many faces to show before the rest become "+N". Defaults to 5. */
  max?: number
  size?: AvatarStackSize
  /** Sits after the stack — "5 cards exchanged". */
  caption?: ReactNode
  /** Names the group of faces. Defaults to "Attendees". */
  label?: string
}

/**
 * A handful of people as overlapping faces — who was in the room, at a glance.
 *
 * A real list under the hood, so the names are read out one by one rather than
 * being five unlabelled circles: overlapping is a way of *drawing* a group,
 * not a reason to stop naming its members. The overflow chip says "+2 more"
 * to assistive tech and "+2" on screen.
 *
 * The ring that separates each face from the one behind it is painted in
 * `--deck-avatar-stack-ring`, which defaults to the elevated surface. Set it
 * when the stack sits on anything else, or the rings cut a pale halo out of
 * whatever is actually behind them.
 *
 * @example
 * <AvatarStack
 *   people={[{ name: 'Hannah Davis' }, { name: 'Marcus Lee' }]}
 *   caption="5 cards exchanged"
 * />
 */
export function AvatarStack({
  people,
  max = 5,
  size = 'sm',
  caption,
  label = 'Attendees',
  className,
  ...props
}: AvatarStackProps) {
  const shown = people.slice(0, max)
  const overflow = people.length - shown.length

  return (
    <div className={cx('deck-avatar-stack', className)} {...props}>
      <ul
        className={cx(
          'deck-avatar-stack__faces',
          `deck-avatar-stack__faces--${size}`,
        )}
        aria-label={label}
      >
        {shown.map((person, index) => (
          <li
            key={`${person.name}-${index}`}
            className="deck-avatar-stack__face"
            /*
             * The first face paints over the second, the second over the
             * third. Source order alone would give the reverse, and the lead
             * face — the host, the person you actually met — is the one that
             * should be whole. A computed depth rather than a design value,
             * which is why it is an inline custom property and not a token.
             */
            style={
              { '--deck-avatar-stack-depth': shown.length - index } as CSSProperties
            }
          >
            <Avatar name={person.name} src={person.src} size={size} />
          </li>
        ))}

        {overflow > 0 ? (
          <li
            className="deck-avatar-stack__face"
            style={{ '--deck-avatar-stack-depth': 0 } as CSSProperties}
          >
            <span className="deck-avatar-stack__more">
              <span aria-hidden="true">+{overflow}</span>
              <span className="deck-visually-hidden">{overflow} more</span>
            </span>
          </li>
        ) : null}
      </ul>

      {caption ? (
        <p className="deck-avatar-stack__caption">{caption}</p>
      ) : null}
    </div>
  )
}
