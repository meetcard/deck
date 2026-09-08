import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { mediaQuery } from '../../foundations/tokens'
import { cx } from '../../lib/cx'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Avatar } from '../Avatar/Avatar'
import './CardIndex.css'

export interface CardIndexItem {
  /** Stable key, and the value reported when this card is picked. */
  id: string
  name: string
  /** One quiet line under the name — "Operating Partner at Halden Group". */
  detail?: string
  avatarSrc?: string
  /**
   * A pill beside the name — which of your selves this card is, say. Rows
   * only: a 4.5rem cell in the strip has no room for one.
   */
  badge?: ReactNode
  /**
   * One control for this row, rendered *beside* the row rather than inside
   * it — an edit button, typically. Kept a sibling of the selecting button
   * because a button inside a button is not a thing a browser will render,
   * and a row that both selects and edits needs two of them.
   *
   * Rows only, for the same reason as `badge`.
   */
  action?: ReactNode
}

/**
 * How the index is laid out.
 *
 * `rows` is a list down the page: face, name, and what they do. `strip` is a
 * run of faces scrolled sideways, for when the index is a way back to a card
 * rather than something to read.
 *
 * `responsive` — the default — is the strip below `lg` and rows above it.
 */
export type CardIndexLayout = 'rows' | 'strip' | 'responsive'

export interface CardIndexProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'onChange'> {
  items: CardIndexItem[]
  /** Which card is on top of the pile, by `id`. */
  value?: string
  /** Fires with the `id` of the card that should come to the top. */
  onValueChange?: (id: string) => void
  /** Accessible name for the list, e.g. "Everyone from Founders Dinner". */
  label?: string
  layout?: CardIndexLayout
  /**
   * What the current row is marked with, in words. Default "Showing" — the
   * card that is on the pile right now.
   */
  currentLabel?: string
}

/**
 * The index to a `CardPile` — everyone in it, and a way to bring any one of
 * them to the top.
 *
 * A pile hands you one card at a time, which is what makes it a pile and not
 * a directory; the cost is that finding a particular person means flipping
 * past everyone in front of them. This is the contents page: it says who is
 * in the pile without opening it, and it takes you straight to one.
 *
 * The card already on top stays in the list, marked `aria-current`, rather
 * than being filtered out of it. Two reasons, and both are about the list
 * holding still: a list of "the others" reshuffles every time you advance,
 * so the row you were about to click moves out from under you; and with the
 * current card in place the list is also a position indicator — where you
 * are in the pile, not just what else is in it.
 *
 * @example
 * <CardIndex
 *   label="Everyone from Founders Dinner"
 *   value={cards[index].slug}
 *   onValueChange={(id) => setIndex(cards.findIndex((c) => c.slug === id))}
 *   items={cards.map((c) => ({ id: c.slug, name: c.name, detail: c.title }))}
 * />
 */
export const CardIndex = forwardRef<HTMLUListElement, CardIndexProps>(
  function CardIndex(
    {
      items,
      value,
      onValueChange,
      label = 'Cards in this pile',
      layout = 'responsive',
      currentLabel = 'Showing',
      className,
      ...props
    },
    ref,
  ) {
    /*
     * Resolved here rather than by a media query, because the two layouts do
     * not only differ in CSS: a face in a strip is a bigger object than a face
     * on a row, and `Avatar`'s size is a prop. `CardPile` resolves its own
     * `responsive` orientation the same way, and for the same reason.
     *
     * Anything that cannot answer — jsdom, a server render — gets the strip,
     * which is the layout that survives any width.
     */
    const isWide = useMediaQuery(mediaQuery('lg'))
    const resolved =
      layout === 'responsive' ? (isWide ? 'rows' : 'strip') : layout

    return (
      <ul
        ref={ref}
        className={cx('deck-card-index', `deck-card-index--${resolved}`, className)}
        aria-label={label}
        /* Resolved — never `responsive` — so anything reading it downstream
           has one question to ask rather than two. */
        data-layout={resolved}
        {...props}
      >
        {items.map((item) => {
          const isCurrent = item.id === value

          const rows = resolved === 'rows'

          return (
            <li
              key={item.id}
              className={cx(
                'deck-card-index__item',
                isCurrent && 'deck-card-index__item--current',
              )}
            >
              {/*
                A button, not a link. Picking someone here does not go
                anywhere — it deals their card to the top of the pile already
                on the page, and a link that changes something in place is a
                link that lies about what Enter will do.
              */}
              <button
                type="button"
                className="deck-card-index__button"
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => onValueChange?.(item.id)}
              >
                {/* Decorative: the name is text on the row beside it, so an
                    announced avatar would say it twice. */}
                <Avatar
                  name={item.name}
                  src={item.avatarSrc}
                  size={rows ? 'md' : 'lg'}
                  decorative
                />
                <span className="deck-card-index__text">
                  <span className="deck-card-index__heading">
                    <span className="deck-card-index__name">{item.name}</span>
                    {rows && item.badge ? item.badge : null}
                  </span>
                  {/* A strip is faces and first names; there is no room for a
                      job title under a 4.5rem cell, and hiding one in CSS
                      would leave it in the markup pretending otherwise. */}
                  {rows && item.detail ? (
                    <span className="deck-card-index__detail">{item.detail}</span>
                  ) : null}
                </span>

                {/* Which one is showing, in a word as well as in a tint —
                    the state is not left to colour alone. `aria-hidden`
                    because `aria-current` on this button already says it,
                    and hearing both is hearing it twice.

                    Rows only. A strip has no room for the word, and there
                    the current card is also the one on the pile directly
                    above it, so the tint is not carrying the fact by
                    itself either. */}
                {rows && isCurrent ? (
                  <span className="deck-card-index__current" aria-hidden="true">
                    {currentLabel}
                  </span>
                ) : null}
              </button>

              {rows && item.action ? (
                <span className="deck-card-index__action">{item.action}</span>
              ) : null}
            </li>
          )
        })}
      </ul>
    )
  },
)
