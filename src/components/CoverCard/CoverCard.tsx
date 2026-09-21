import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import {
  useCardOrientation,
  type CardOrientation,
} from '../../lib/cardOrientation'
import { cx } from '../../lib/cx'
import './CoverCard.css'

export interface CoverCardProps extends HTMLAttributes<HTMLElement> {
  /**
   * The photo behind the card. Decorative — it says which card this is at a
   * glance, and everything it needs to say in words is said in the content.
   */
  coverSrc?: string
  /**
   * Blur the photo. For a surface whose job is to be *read* — a header with
   * a long name over it — where a sharp picture competes with the words.
   * Default off: a card is looked at more than it is read.
   */
  blurCover?: boolean
  /**
   * Where the scrim is heaviest, which is wherever the words are. `bottom`
   * by default — a header reads from the foot up. `edges` darkens both ends
   * for a card with something at the top *and* a strip along the bottom.
   */
  scrim?: 'bottom' | 'top' | 'edges'
  /** Which way up. Default `responsive`. */
  orientation?: CardOrientation
  /** Element to render. `article` by default. */
  as?: 'article' | 'div' | 'section' | 'header'
  children: ReactNode
}

/**
 * A card-shaped box with a photograph behind it.
 *
 * Two things every card with a cover needs, in one place. The first is the
 * shape: the same fixed 1.75:1 box lying down and 1:1.75 stood up that every
 * card in Deck holds, turned by `useCardOrientation`.
 *
 * The second is what a photograph does to the colours on top of it. The
 * scrim is dark in both light and dark mode — a photograph is not a palette
 * — so everything inside reads against a fixed on-color rather than the
 * page's. That is the `--deck-color-cover-*` pair, and this component
 * re-points the solid-surface contract at it, which is what makes `Text`,
 * `Heading`, `Badge` and `Button` come out right in here without any of them
 * knowing they are on a photo.
 *
 * A card with no cover is the brand under the same scrim — quieter, not
 * broken.
 *
 * @example
 * <CoverCard coverSrc={cover}>
 *   <Heading level={2}>RevOps Summit</Heading>
 * </CoverCard>
 */
export const CoverCard = forwardRef<HTMLElement, CoverCardProps>(
  function CoverCard(
    {
      coverSrc,
      blurCover = false,
      scrim = 'bottom',
      orientation: preferredOrientation,
      as: Tag = 'article',
      className,
      children,
      ...props
    },
    ref,
  ) {
    const orientation = useCardOrientation(preferredOrientation)

    return (
      <Tag
        ref={ref as never}
        className={cx('deck-cover-card', className)}
        data-card-orientation={orientation}
        {...props}
      >
        <div className="deck-cover-card__backdrop" aria-hidden="true">
          {coverSrc ? (
            <img
              className={cx(
                'deck-cover-card__image',
                blurCover && 'deck-cover-card__image--blurred',
              )}
              src={coverSrc}
              alt=""
            />
          ) : null}
          <span
            className={cx(
              'deck-cover-card__scrim',
              `deck-cover-card__scrim--${scrim}`,
            )}
          />
        </div>

        {/* `deck-solid-surface` over a scrim of this component's own: the
            class re-points every colour token a descendant reads, and the
            content layer re-points the on-color it reads them from. */}
        <div className="deck-cover-card__content deck-solid-surface">
          {children}
        </div>
      </Tag>
    )
  },
)
