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
import { cx } from '../../lib/cx'
import { Badge } from '../Badge/Badge'
import { IconButton } from '../IconButton/IconButton'
import './CardPile.css'

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
  /** Fires after a swipe, button press, or arrow key completes. */
  onActiveIndexChange?: (index: number) => void
  /** Accessible name for the pile, e.g. "Ada's saved cards". */
  label?: string
}

const DRAG_THRESHOLD = 80
const EXIT_DISTANCE = 480
/*
 * Depth cues for the cards behind the front one.
 *
 * Tuned to read as a *stack* rather than a fan. The previous values rotated
 * the layers 5 and 7 degrees, which scatters them like a hand of playing
 * cards; a pile of business cards on a desk is near-aligned, and what tells
 * you there is more than one is the sliver of edge showing below and the
 * slight loss of size going back — not the angle.
 *
 * The offset is downward so the layers peek from beneath the front card's
 * bottom edge, which is where you would see them in a real pile.
 */
const DEPTH_OFFSET_X = 6
const DEPTH_OFFSET_Y = 9
const DEPTH_ROTATE_BASE = 1.2
const DEPTH_ROTATE_STEP = 0.8
const DEPTH_SCALE_STEP = 0.015

function mod(value: number, length: number) {
  return ((value % length) + length) % length
}

/** Deterministic per-depth offset for the peeking cards behind the front one. */
function getLayerTransform(depth: number) {
  const x = depth * DEPTH_OFFSET_X
  const y = depth * DEPTH_OFFSET_Y
  // Alternating so a stack of three does not lean uniformly, which reads as
  // a skewed card rather than a hand-stacked pile.
  const sign = depth % 2 === 1 ? 1 : -1
  const rotate = sign * (DEPTH_ROTATE_BASE + (depth - 1) * DEPTH_ROTATE_STEP)
  const scale = 1 - depth * DEPTH_SCALE_STEP
  return `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`
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
      onActiveIndexChange,
      label,
      className,
      ...props
    },
    ref,
  ) {
    const items = useMemo(() => Children.toArray(children), [children])
    const count = items.length

    const [activeIndex, setActiveIndex] = useState(
      count > 0 ? mod(defaultActiveIndex, count) : 0,
    )
    const [dragX, setDragX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(() =>
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
    )

    const startXRef = useRef(0)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
    )

    // Only reacts to the media query changing after mount — the initial
    // value is read directly in useState above, not set here.
    useEffect(() => {
      if (typeof window.matchMedia !== 'function') return

      const query = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onChange = () => setReducedMotion(query.matches)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    }, [])

    useEffect(() => () => clearTimeout(timeoutRef.current), [])

    function advance(direction: 1 | -1, flyDistance: number) {
      if (isAnimating || count <= 1) return

      setIsAnimating(true)
      setDragX(flyDistance)

      const newIndex = mod(activeIndex + direction, count)
      const duration = reducedMotion ? 0 : 220

      timeoutRef.current = setTimeout(() => {
        setActiveIndex(newIndex)
        onActiveIndexChange?.(newIndex)
        setDragX(0)
        setIsAnimating(false)
      }, duration)
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      if (isAnimating) return
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
        className={cx('deck-card-pile', className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
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
                    : getLayerTransform(depth),
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
          <div className="deck-card-pile__controls">
            <IconButton
              label="Previous card"
              icon={<ChevronLeftIcon />}
              size="sm"
              variant="secondary"
              disabled={isAnimating}
              onClick={() => advance(-1, EXIT_DISTANCE)}
            />
            <IconButton
              label="Next card"
              icon={<ChevronRightIcon />}
              size="sm"
              variant="secondary"
              disabled={isAnimating}
              onClick={() => advance(1, -EXIT_DISTANCE)}
            />
          </div>
        ) : null}

        <p className="deck-visually-hidden" aria-live="polite">
          {count > 0 ? `Card ${activeIndex + 1} of ${count}` : ''}
        </p>
      </div>
    )
  },
)
