import {
  Children,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  HTMLAttributes,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import { mediaQuery } from '../../foundations/tokens'
import { cx } from '../../lib/cx'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Badge } from '../Badge/Badge'
import { IconButton } from '../IconButton/IconButton'
import './CardPile.css'

/**
 * Which way up the cards are piled.
 *
 * `responsive` — the default — is portrait on a phone and landscape from the
 * `sm` breakpoint up. A landscape card wide enough to read leaves a phone
 * screen mostly empty, and shrinking it to fit makes the type too small; on a
 * desktop the reverse is true. Same object either way, turned 90 degrees.
 */
export type CardPileOrientation = 'landscape' | 'portrait' | 'responsive'

export interface CardPileProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** `PersonCard` elements, front-to-back — the first child starts on top. */
  children: ReactNode
  /**
   * How many cards render as physical depth (the front card plus peeking
   * layers behind it). Extra cards beyond this collapse into a "+N" badge
   * rather than bloating the DOM. Default 3.
   */
  maxVisible?: number
  /** Uncontrolled starting position. Default 0. */
  defaultActiveIndex?: number
  /**
   * Controlled position. Supply it and the pile stops keeping its own,
   * leaving `onActiveIndexChange` as the only way it asks to move — for a
   * surface that also selects cards from somewhere else, a list beside the
   * pile or a card it has just created.
   *
   * Omit it for the uncontrolled behaviour seeded by `defaultActiveIndex`.
   */
  activeIndex?: number
  /** Fires after a swipe, button press, or arrow key completes. */
  onActiveIndexChange?: (index: number) => void
  /** Accessible name for the pile, e.g. "Ada's saved cards". */
  label?: string
  /**
   * Which way up the cards sit. Default `responsive` — portrait on a phone,
   * landscape from `sm` up. Pin it when the surface around the pile has
   * already committed to a shape.
   */
  orientation?: CardPileOrientation
}

const DRAG_THRESHOLD = 80
const EXIT_DISTANCE = 480
/*
 * Depth cues for the cards behind the front one, measured off the mockups.
 *
 * Two rules, and they are not the same rule. Sideways, each layer steps the
 * *same* distance and alternates which side it steps to — the first peeks out
 * to the right, the second to the left, neither further than the other.
 * Vertically the step accumulates: the first sits above the front card, the
 * second twice as far below it. That asymmetry is what stops the pile
 * reading as a fan (every layer marching off one way) or as a shadow (every
 * layer marching off two ways at once), and it is what a stack someone has
 * squared up by the edges and then knocked actually looks like.
 *
 * Measured against the mockup's own card and scaled to ours: at 520px wide
 * the layers sat 25/17px out and 21/39px up-and-down, which at 400px is
 * ~17 and ~16/32.
 *
 * The angle carries more of it than the offset does. A card set down on
 * another is rarely square to it and is almost never a clean inch to one
 * side, so a few degrees with a small nudge reads as a pile where a large
 * nudge at no angle reads as two cards someone laid out to compare.
 *
 * The step is per-orientation, so a portrait pile does not get the sideways
 * nudge of a landscape one half again as wide.
 *
 * Stated as percentages of the card, not pixels, and `translate()` resolves
 * them against the element's own box — so the sliver of edge showing is the
 * same fraction of a 320px card as of a 760px one. It used to be pixels plus
 * a multiplier the stylesheet had to be kept in step with; the card now
 * scales continuously with its container, and there is no longer a discrete
 * "large" size for a multiplier to key off.
 */
const DEPTH_STEP: Record<
  Exclude<CardPileOrientation, 'responsive'>,
  { x: number; y: number }
> = {
  landscape: { x: 1.5, y: 2 },
  portrait: { x: 2.2, y: 1.4 },
}
const DEPTH_ROTATE_BASE = 4
const DEPTH_ROTATE_STEP = 1.4
const DEPTH_SCALE_STEP = 0.015

function mod(value: number, length: number) {
  return ((value % length) + length) % length
}

/** Deterministic per-depth offset for the peeking cards behind the front one. */
function getLayerTransform(
  depth: number,
  orientation: Exclude<CardPileOrientation, 'responsive'>,
) {
  const step = DEPTH_STEP[orientation]
  // Odd depths go up and right, even ones down and left.
  const sign = depth % 2 === 1 ? 1 : -1
  // Sideways: same distance every layer, alternating side. Vertically: a
  // step per layer, so the pile deepens downward as it goes back.
  const x = sign * step.x
  const y = -sign * depth * step.y
  const rotate = sign * (DEPTH_ROTATE_BASE + (depth - 1) * DEPTH_ROTATE_STEP)
  const scale = 1 - depth * DEPTH_SCALE_STEP
  return `translate(${x}%, ${y}%) rotate(${rotate}deg) scale(${scale})`
}

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M10 3L5 8l5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M6 3l5 5-5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * A pile of `PersonCard`s you flip through by swiping — the physical-deck
 * metaphor made literal, for browsing a person's saved or captured cards.
 *
 * Only the front card is real to assistive tech; the peeking cards behind it
 * are decorative (`aria-hidden` + `inert`) since they duplicate content the
 * front card will present once it's on top. Every gesture has a non-swipe
 * equivalent: visible Previous/Next buttons, and Arrow Left/Right when focus
 * is anywhere inside the pile — swiping is an accelerator, not the only way
 * in. A tap that doesn't move (a click on the front card's own content, e.g.
 * a "Share" button) is left alone; only motion past the drag threshold is
 * treated as a swipe.
 *
 * The pile also decides which way up its cards sit — portrait on a phone,
 * landscape from `sm` up — and publishes that as `data-card-orientation` for
 * the cards to lay themselves out against. It is the pile's call rather than
 * the card's because it is a fact about the space the cards are being shown
 * in, not about any one of them.
 *
 * @example
 * <CardPile label="Ada's saved cards">
 *   <PersonCard name="Ada Lovelace" title="Head of Partnerships" />
 *   <PersonCard name="Grace Hopper" title="Principal Engineer" />
 * </CardPile>
 */
export const CardPile = forwardRef<HTMLDivElement, CardPileProps>(
  function CardPile(
    {
      children,
      maxVisible = 3,
      defaultActiveIndex = 0,
      activeIndex: controlledIndex,
      onActiveIndexChange,
      label,
      orientation = 'responsive',
      className,
      ...props
    },
    ref,
  ) {
    const items = useMemo(() => Children.toArray(children), [children])
    const count = items.length

    const [uncontrolledIndex, setUncontrolledIndex] = useState(
      count > 0 ? mod(defaultActiveIndex, count) : 0,
    )

    const isControlled = controlledIndex !== undefined
    // Wrapped either way, so a controlled caller can hand over a raw index
    // without having to know the pile loops.
    const activeIndex =
      count > 0 ? mod(isControlled ? controlledIndex : uncontrolledIndex, count) : 0
    const [dragX, setDragX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

    /*
     * `responsive` is resolved here rather than in CSS because the layer
     * offsets are inline transforms, and a media query cannot reach an
     * inline style. One resolved value then drives both: those transforms
     * and the `data-card-orientation` the cards lay themselves out against.
     *
     * Asked as the negation of `sm` rather than as `sm` itself, so that
     * every environment that cannot answer — jsdom, a server render, a
     * browser without `matchMedia` — answers "no" and lands on landscape.
     * Nothing that cannot report its width is a phone, and a phone-shaped
     * pile is the more surprising thing to get wrong.
     */
    const isNarrow = useMediaQuery(`not all and ${mediaQuery('sm')}`)
    const resolvedOrientation =
      orientation === 'responsive'
        ? isNarrow
          ? 'portrait'
          : 'landscape'
        : orientation

    const startXRef = useRef(0)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    )

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    function advance(direction: 1 | -1, flyDistance: number) {
      if (isAnimating || count <= 1) return

      setIsAnimating(true)
      setDragX(flyDistance)

      const newIndex = mod(activeIndex + direction, count)
      const duration = reducedMotion ? 0 : 220

      timeoutRef.current = setTimeout(() => {
        // A controlled pile does not move itself; it asks, and the answer
        // arrives as a new prop. The rest — the fly-out and the reset — is
        // presentation and runs either way.
        if (!isControlled) setUncontrolledIndex(newIndex)
        onActiveIndexChange?.(newIndex)
        setDragX(0)
        setIsAnimating(false)
      }, duration)
    }

    /*
     * A press that lands on a control inside the card is that control's, not
     * the pile's. Without this the pile captured every pointerdown, and
     * capture retargets the pointerup that follows — so the browser resolved
     * the click on the common ancestor instead of the button, and nothing on
     * the front card could be clicked at all. The card's own private-note
     * flip, its Book with me and Exchange buttons and all three contact icons
     * were inert; only the keyboard reached them.
     *
     * Matched on the interactive element rather than on a `data-` opt-out,
     * because the card's contents come from the caller: `CardPile` cannot
     * know what they put in a footer, and the failure mode of guessing wrong
     * is a dead button rather than a pile that will not drag.
     *
     * `label` is in the list for a reason that cost a second round of this
     * bug. A radio's control is usually a visually hidden `input` with the
     * visible part rendered as a sibling span inside the label — so a press
     * on what looks like the option finds no `input` above it in the tree,
     * the pile captured it, and the label's implicit activation never fired.
     * The private-note pill worked because it is a real `button`; the feeling
     * choices sat there looking hoverable and refusing to be chosen.
     */
    const INTERACTIVE =
      'button, a[href], label, input, textarea, select, [role="button"], [role="radio"], [contenteditable="true"]'

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      if (isAnimating) return
      if ((event.target as HTMLElement).closest(INTERACTIVE)) return
      event.currentTarget.setPointerCapture(event.pointerId)
      startXRef.current = event.clientX
      setIsDragging(true)
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
      if (!isDragging) return
      setDragX(event.clientX - startXRef.current)
    }

    function endDrag() {
      if (!isDragging) return
      setIsDragging(false)

      if (Math.abs(dragX) > DRAG_THRESHOLD) {
        const direction = dragX < 0 ? 1 : -1
        advance(direction, direction === 1 ? -EXIT_DISTANCE : EXIT_DISTANCE)
      } else {
        setDragX(0)
      }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        advance(1, -EXIT_DISTANCE)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        advance(-1, EXIT_DISTANCE)
      }
    }

    const visibleCount = Math.min(maxVisible, count)
    const hiddenCount = Math.max(count - maxVisible, 0)

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="card pile"
        aria-label={label ?? 'Card pile'}
        /*
         * The contract the cards lay out against: any ancestor may declare
         * an orientation, and `PersonCard` re-lays itself beneath it. Set
         * here as a resolved value — never `responsive` — so a card only
         * ever has to answer one question.
         */
        data-card-orientation={resolvedOrientation}
        className={cx('deck-card-pile', className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
      <div className="deck-card-pile__frame">
        {/* Flanking the card rather than sitting under it. They point at the
            thing they move, and they keep the space beside a landscape card —
            which is otherwise empty — doing something. Dropped below `sm`,
            where there is no such space and the dots carry the job. */}
        {count > 1 ? (
          <IconButton
            label="Previous card"
            icon={<ChevronLeftIcon />}
            round
            variant="secondary"
            className="deck-card-pile__arrow"
            disabled={isAnimating}
            onClick={() => advance(-1, EXIT_DISTANCE)}
          />
        ) : null}

        <div className="deck-card-pile__stage">
          {Array.from({ length: visibleCount }, (_, depth) => {
            const itemIndex = mod(activeIndex + depth, count)
            const isFront = depth === 0

            return (
              <div
                key={itemIndex}
                className={cx(
                  'deck-card-pile__layer',
                  isFront && 'deck-card-pile__layer--front',
                )}
                style={{
                  transform: isFront
                    ? `translateX(${dragX}px) rotate(${dragX / 24}deg)`
                    : getLayerTransform(depth, resolvedOrientation),
                  transition: isFront && isDragging ? 'none' : undefined,
                  zIndex: visibleCount - depth,
                }}
                aria-hidden={isFront ? undefined : true}
                inert={isFront ? undefined : true}
                onPointerDown={isFront ? handlePointerDown : undefined}
                onPointerMove={isFront ? handlePointerMove : undefined}
                onPointerUp={isFront ? endDrag : undefined}
                onPointerCancel={isFront ? endDrag : undefined}
              >
                {items[itemIndex]}
              </div>
            )
          })}

          {hiddenCount > 0 ? (
            <Badge
              tone="neutral"
              size="sm"
              className="deck-card-pile__badge"
            >
              +{hiddenCount}
            </Badge>
          ) : null}
        </div>

        {count > 1 ? (
          <IconButton
            label="Next card"
            icon={<ChevronRightIcon />}
            round
            variant="secondary"
            className="deck-card-pile__arrow"
            disabled={isAnimating}
            onClick={() => advance(1, -EXIT_DISTANCE)}
          />
        ) : null}
      </div>

        {/*
          Dots rather than "2 / 5". They say how many cards there are and
          which one you are on, and — unlike the arrows, which the layout
          drops on a phone for want of room beside the card — they are a way
          to reach any card directly rather than one step at a time. That
          matters more than it looks: without them, a narrow screen would
          leave dragging as the only pointer route through the pile.
        */}
        {count > 1 ? (
          <div className="deck-card-pile__dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={cx(
                  'deck-card-pile__dot',
                  i === activeIndex && 'deck-card-pile__dot--active',
                )}
                aria-label={`Card ${i + 1} of ${count}`}
                aria-current={i === activeIndex ? 'true' : undefined}
                onClick={() => {
                  if (isControlled) onActiveIndexChange?.(i)
                  else {
                    setUncontrolledIndex(i)
                    onActiveIndexChange?.(i)
                  }
                }}
              />
            ))}
          </div>
        ) : null}

        <p className="deck-visually-hidden" aria-live="polite">
          {count > 0 ? `Card ${activeIndex + 1} of ${count}` : ''}
        </p>
      </div>
    )
  },
)
