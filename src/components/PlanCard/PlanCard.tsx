import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Badge } from '../Badge/Badge'
import { Card, type CardProps } from '../Card/Card'
import { Heading } from '../Heading/Heading'
import { Text } from '../Text/Text'
import './PlanCard.css'

export interface PlanCardProps extends Omit<CardProps, 'children' | 'title'> {
  name: string
  description?: ReactNode
  /** The figure alone — "$8", "$0". Kept apart from `period` so a column of
   * plans lines its prices up on the same baseline whatever follows them. */
  price: string
  /** What the figure is per: "/mo", "/mo per seat", "forever". */
  period?: ReactNode
  /** The small print under the price — a seat minimum, a trial length. */
  note?: ReactNode
  /** What you get. One line each; no sub-lists. */
  features: ReactNode[]
  /** Marks the plan you are already on. */
  current?: boolean
  /** The action — "Choose Pro", "Manage plan". */
  action?: ReactNode
  /** Heading level for the plan's name. Default 3. */
  level?: 2 | 3 | 4
}

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3.5 8.5l3 3 6-6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * One plan in a row of them: what it costs, what it includes, and the one
 * button that changes anything.
 *
 * The plan you are on is marked rather than removed, and its action says
 * what it actually does — you do not "choose" the plan you already have.
 * That mark is a badge and a border, never the border alone: which plan you
 * are on is the single most important thing on the screen and it does not
 * get to depend on seeing a colour.
 *
 * Features are a list of lines with no nesting on purpose. A plan comparison
 * that grows sub-bullets has stopped comparing and started explaining, and
 * the explaining belongs on a pricing page rather than in a settings panel.
 *
 * @example
 * <PlanCard
 *   name="Pro"
 *   description="For professionals who network seriously."
 *   price="$8"
 *   period="/mo"
 *   features={['Unlimited cards', 'CRM integrations']}
 *   action={<Button size="sm">Choose Pro</Button>}
 * />
 */
export const PlanCard = forwardRef<HTMLElement, PlanCardProps>(
  function PlanCard(
    {
      name,
      description,
      price,
      period,
      note,
      features,
      current = false,
      action,
      level = 3,
      className,
      ...cardProps
    },
    ref,
  ) {
    return (
      <Card
        ref={ref}
        as="article"
        className={cx(
          'deck-plan-card',
          current && 'deck-plan-card--current',
          className,
        )}
        {...cardProps}
      >
        <div className="deck-plan-card__heading">
          <Heading level={level} size="sm">
            {name}
          </Heading>
          {current ? (
            <Badge tone="brand" size="sm">
              Current
            </Badge>
          ) : null}
        </div>

        {description ? (
          <Text size="sm" tone="muted" className="deck-plan-card__description">
            {description}
          </Text>
        ) : null}

        <p className="deck-plan-card__price">
          <span className="deck-plan-card__figure">{price}</span>
          {period ? (
            <span className="deck-plan-card__period"> {period}</span>
          ) : null}
        </p>

        {note ? (
          <Text size="xs" tone="muted">
            {note}
          </Text>
        ) : null}

        <ul className="deck-plan-card__features">
          {features.map((feature, index) => (
            <li key={index} className="deck-plan-card__feature">
              {/* Decorative: every line in this list is included, so a tick
                  read out on each one is the same word fifteen times. */}
              <span className="deck-plan-card__check" aria-hidden="true">
                <CheckIcon />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        {action ? <div className="deck-plan-card__action">{action}</div> : null}
      </Card>
    )
  },
)
