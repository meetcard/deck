import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { Avatar, type AvatarSize } from '../Avatar/Avatar'
import './AvatarGroup.css'

export interface AvatarGroupPerson {
  name: string
  src?: string
}

export interface AvatarGroupProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  people: AvatarGroupPerson[]
  /**
   * How many faces to show before the rest collapse into a "+N". Default 5 —
   * past that a stack stops reading as people and starts reading as texture.
   */
  max?: number
  size?: AvatarSize
  /** Accessible name for the group, e.g. "Exchanged cards at RevOps Summit". */
  label: string
}

/**
 * A handful of people as overlapping faces — who was there, in the space a
 * sentence naming two of them would take.
 *
 * The overlap is the point: a stack reads as "a group" at a glance where a
 * row of separate avatars reads as a list to be counted. Each face keeps a
 * ring in the surface behind it so the discs stay distinct where they cross;
 * on a surface that isn't the page — a cover photo, a tinted card — set
 * `--deck-avatar-group-ring` to whatever is actually behind them.
 *
 * Every face is announced by name rather than left as decoration with a
 * `title` attribute nobody hears. Faces past `max` become a "+N" that says
 * how many were left out, so the count is never only in the geometry.
 *
 * @example
 * <AvatarGroup label="Cards exchanged" max={4} people={[{ name: 'Hannah Davis' }]} />
 */
export const AvatarGroup = forwardRef<HTMLUListElement, AvatarGroupProps>(
  function AvatarGroup(
    { people, max = 5, size = 'sm', label, className, ...props },
    ref,
  ) {
    const shown = people.slice(0, max)
    const hidden = people.length - shown.length

    return (
      <ul
        ref={ref}
        className={cx(
          'deck-avatar-group',
          `deck-avatar-group--${size}`,
          className,
        )}
        aria-label={label}
        {...props}
      >
        {shown.map((person, index) => (
          <li
            key={person.name}
            className="deck-avatar-group__item"
            /* Earlier faces sit on top of later ones, so the stack reads
               left-to-right the way the names do. Without this the last
               face would overlap the first and the order would invert. */
            style={{ zIndex: shown.length - index } as CSSProperties}
          >
            <Avatar name={person.name} src={person.src} size={size} />
          </li>
        ))}

        {hidden > 0 ? (
          /* Text beside the stack rather than one more disc in it. A disc
             would have to match `Avatar`'s size scale, which lives in
             `Avatar`'s own stylesheet — and a second copy of that scale here
             is a pair of numbers that drift. It is also the truer shape: the
             others are faces, and this is a count of the ones you can't
             see. */
          <li className="deck-avatar-group__more">
            <span aria-hidden="true">+{hidden}</span>
            <span className="deck-visually-hidden">and {hidden} more</span>
          </li>
        ) : null}
      </ul>
    )
  },
)
