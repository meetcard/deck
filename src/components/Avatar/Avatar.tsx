import { forwardRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { getInitials } from './getInitials'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type AvatarShape = 'circle' | 'rounded'

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Person or company name. Required — it is both the accessible name and
   * the source of the initials fallback.
   */
  name: string
  /** Optional photo or logo. Falls back to initials if it fails to load. */
  src?: string
  size?: AvatarSize
  /** `rounded` suits company logos; `circle` suits people. */
  shape?: AvatarShape
  /**
   * Hide from assistive tech. Use when the name is already announced by
   * adjacent text, so screen readers don't hear it twice.
   */
  decorative?: boolean
}

/**
 * A person or company image with a resilient initials fallback.
 *
 * @example
 * <Avatar name="Ada Lovelace" src={photo} />
 * <Avatar name="MeetCard" shape="rounded" size="lg" />
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    src,
    size = 'md',
    shape = 'circle',
    decorative = false,
    className,
    ...props
  },
  ref,
) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <span
      ref={ref}
      className={cx(
        'deck-avatar',
        `deck-avatar--${size}`,
        `deck-avatar--${shape}`,
        className,
      )}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      {...props}
    >
      {showImage ? (
        <img
          className="deck-avatar__image"
          src={src}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="deck-avatar__initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </span>
  )
})
