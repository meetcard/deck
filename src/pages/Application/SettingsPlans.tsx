import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { Heading } from '../../components/Heading/Heading'
import { Link } from '../../components/Link/Link'
import { Text } from '../../components/Text/Text'
import { cx } from '../../lib/cx'
import { LinkButton } from './LinkButton'
import { SettingsPanel } from './SettingsPanel'
import { SEATS } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

type Cadence = 'monthly' | 'yearly'

interface Plan {
  id: string
  name: string
  pitch: string
  /** Dollars per month, and per month when paid a year up front. */
  monthly: number
  yearly: number
  /** What the price is *per*, when it is not simply per account. */
  unit?: string
  /** The catch under the price, e.g. a seat minimum. */
  fineprint?: string
  features: string[]
}

/*
 * Three plans, and the ladder between them is the shape of the product: one
 * card, then as many as you have selves, then a company's worth of people
 * sharing one brand.
 *
 * Yearly is a sixth off, which is where "Save 17%" comes from — $96 a year of
 * Pro becomes $80, $108 of a Team seat becomes $90.
 */
const PLANS: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    pitch: 'For getting started with your digital business card.',
    monthly: 0,
    yearly: 0,
    features: [
      '1 card',
      '100 connections',
      'Unlimited card exchanges',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    pitch: 'For professionals who network seriously.',
    monthly: 8,
    yearly: 6.67,
    features: [
      'Unlimited cards',
      'Unlimited connections',
      'CRM integrations',
      'Custom domain',
      'Advanced analytics',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    pitch: 'For teams networking at events together.',
    monthly: SEATS.pricePerSeat,
    yearly: 7.5,
    unit: 'per seat',
    fineprint: `${SEATS.minimum}-seat minimum`,
    features: [
      'Everything in Pro',
      '500 connections per seat',
      '10 events per month',
      'Team analytics',
      'Shared company branding',
    ],
  },
]

const CADENCES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

/** `$0`, `$8`, `$6.67` — cents only when there are any. */
const price = (amount: number) =>
  Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`

/* ---- Page --------------------------------------------------------------- */

export interface SettingsPlansProps {
  /** The plan the account is on, marked "Current" and not re-sellable. */
  currentPlanId?: string
}

/**
 * Available plans — Billing's one sub-page.
 *
 * It is reached from Billing and left by the breadcrumb, which is why it is
 * not a ninth entry in the settings nav: Plans is inside Billing, and a rail
 * that listed both would make them look like peers.
 *
 * Prices are shown per month at both cadences rather than "$80/year" against
 * "$8/month", because the only comparison anyone is trying to make is between
 * the two columns, and two different units make you do arithmetic to make it.
 *
 * The current plan keeps its card and loses its button. An account already on
 * Team has nothing to buy here; what it has is a plan to manage, so that is
 * the link it gets.
 */
export function SettingsPlans({ currentPlanId = 'team' }: SettingsPlansProps) {
  const [cadence, setCadence] = useState<Cadence>('monthly')

  return (
    <SettingsPanel
      /* No eyebrow: the breadcrumb above already says Billing, and better —
         it says Plans is *inside* it. */
      title="Available plans"
      description="Every plan includes a 14-day free trial of paid features. Switch anytime — changes prorate automatically."
      before={
        <nav aria-label="Breadcrumb" className="settings__breadcrumb">
          <Link href="/settings/billing" tone="muted" underline="hover">
            Billing
          </Link>
          <ChevronRight aria-hidden="true" focusable="false" />
          <span aria-current="page">Plans</span>
        </nav>
      }
    >
      <ChoiceGroup
        label="Billing cadence"
        hideLabel
        variant="segmented"
        options={CADENCES}
        value={cadence}
        onChange={(next) => setCadence(next as Cadence)}
        description={
          cadence === 'yearly'
            ? 'Paid a year up front — a sixth off every month.'
            : 'Paid monthly. Switch to yearly to save 17%.'
        }
      />

      <ul className="settings__plans">
        {PLANS.map((plan) => {
          const current = plan.id === currentPlanId
          const amount = cadence === 'yearly' ? plan.yearly : plan.monthly
          const free = amount === 0

          return (
            <Card
              as="li"
              key={plan.id}
              padding={20}
              /* The current plan is marked by its border and its badge, not
                 by a filled surface — it is the one card nobody is being
                 sold, so it should recede rather than shout. */
              className={cx(
                'settings__plan',
                current && 'settings__plan--current',
              )}
            >
              <div>
                <Heading level={3} size="sm">
                  {plan.name}{' '}
                  {current ? (
                    <Badge tone="brand" size="sm">
                      Current
                    </Badge>
                  ) : null}
                </Heading>
                <Text size="sm" tone="muted">
                  {plan.pitch}
                </Text>
              </div>

              <p className="settings__plan-price">
                <span className="settings__plan-amount">{price(amount)}</span>
                <span className="settings__plan-period">
                  {free
                    ? 'forever'
                    : `/mo${plan.unit ? ` ${plan.unit}` : ''}${
                        cadence === 'yearly' ? ', billed yearly' : ''
                      }`}
                </span>
              </p>

              {plan.fineprint ? (
                <Text size="xs" tone="muted">
                  {plan.fineprint}
                </Text>
              ) : null}

              <ul className="settings__plan-features">
                {plan.features.map((feature) => (
                  <li key={feature} className="settings__plan-feature">
                    <Check aria-hidden="true" focusable="false" />
                    {feature}
                  </li>
                ))}
              </ul>

              {current ? (
                <LinkButton
                  href="/settings/billing"
                  variant="secondary"
                  /* `LinkButton` borrows `Button`'s classes rather than its
                     props, so full width is asked for by name. */
                  className="deck-button--full-width"
                >
                  Manage plan
                </LinkButton>
              ) : (
                <Button variant={free ? 'secondary' : 'primary'} fullWidth>
                  Choose {plan.name}
                </Button>
              )}
            </Card>
          )
        })}
      </ul>

      <Text size="xs" tone="muted">
        Prices are shown per month at both cadences so the two columns can be
        compared directly. Nothing is charged — Deck has no data layer.
      </Text>
    </SettingsPanel>
  )
}
