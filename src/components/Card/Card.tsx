import { forwardRef } from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { spaceVar, type Shadow, type Space } from '../../foundations/tokens'
import './Card.css'

export type CardSurface = 'default' | 'subtle' | 'elevated' | 'brand'

export type CardElement = 'div' | 'article' | 'section' | 'li'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  surface?: CardSurface
  /** Elevation step. Figma maps `sm` to cards; `md`+ is for floating UI. */
  elevation?: Shadow | 'none'
  /** Inner padding as a Deck space step. Defaults to 20. */
  padding?: Space
  /**
   * Adds hover/press affordance. Visual only — pair it with a real focusable
   * child (a link or button) so the card is reachable by keyboard.
   */
  interactive?: boolean
  as?: CardElement
}

/**
 * The surface every MeetCard experience is built on.
 *
 * Compose with `CardHeader`, `CardBody`, and `CardFooter`. Those sections
 * bleed their dividers to the card's edge automatically, so padding stays a
 * single decision made once on `Card`.
 *
 * @example
 * <Card as="article" interactive>
 *   <CardHeader divided>
 *     <Heading level={3}>Ada Lovelace</Heading>
 *     <Badge tone="success">Connected</Badge>
 *   </CardHeader>
 *   <CardBody><Text tone="muted">Analytical Engine, London</Text></CardBody>
 * </Card>
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    surface = 'elevated',
    elevation = 'sm',
    padding = 20,
    interactive = false,
    as: Tag = 'div',
    className,
    style,
    ...props
  },
  ref,
) {
  return (
    <Tag
      ref={ref as never}
      className={cx(
        'deck-card',
        `deck-card--surface-${surface}`,
        elevation !== 'none' && `deck-card--elevation-${elevation}`,
        interactive && 'deck-card--interactive',
        className,
      )}
      style={
        { '--deck-card-padding': spaceVar(padding), ...style } as CSSProperties
      }
      {...props}
    />
  )
})

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** Draw a full-bleed rule between this section and the next. */
  divided?: boolean
}

/** Title row for a card. Lays out as a spaced row by default. */
export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardHeader({ divided = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          'deck-card__header',
          divided && 'deck-card__header--divided',
          className,
        )}
        {...props}
      />
    )
  },
)

/** Main card content. */
export const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardBody({ divided = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          'deck-card__body',
          divided && 'deck-card__body--divided',
          className,
        )}
        {...props}
      />
    )
  },
)

/** Action row, usually holding buttons. */
export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(
  function CardFooter({ divided = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          'deck-card__footer',
          divided && 'deck-card__footer--divided',
          className,
        )}
        {...props}
      />
    )
  },
)
