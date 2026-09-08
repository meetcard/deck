import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { ChoiceGroup } from '../../../components/ChoiceGroup/ChoiceGroup'
import { Link } from '../../../components/Link/Link'
import { PlanCard } from '../../../components/PlanCard/PlanCard'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { SettingsPanel } from './SettingsPanel'

type Period = 'monthly' | 'yearly'

/** A year bought up front costs ten months. */
const YEARLY_DISCOUNT = 0.17

interface Plan {
  id: string
  name: string
  description: string
  /** Dollars a month, billed monthly. `0` is free at any cadence. */
  monthly: number
  /** What the figure is per, once a price is on it. */
  period?: string
  note?: string
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'For getting started with your digital business card.',
    monthly: 0,
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
    description: 'For professionals who network seriously.',
    monthly: 8,
    period: '/mo',
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
    description: 'For teams networking at events together.',
    monthly: 9,
    period: '/mo per seat',
    note: 'Starting at $9/mo per seat, 3-seat minimum.',
    features: [
      'Everything in Pro',
      '500 connections per seat',
      '10 events per month',
      'Team analytics',
      'Shared company branding',
    ],
  },
]

/** Whole dollars where the discount lands on one, cents where it doesn't. */
function price(monthly: number, period: Period): string {
  if (monthly === 0) return '$0'
  if (period === 'monthly') return `$${monthly}`
  const discounted = monthly * (1 - YEARLY_DISCOUNT)
  const rounded = Math.round(discounted * 100) / 100
  return `$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`
}

export interface PlansProps {
  /** Which plan the workspace is on. */
  currentPlanId?: string
  /** Back to Billing. The product routes; this composition has no router. */
  onBack?: () => void
}

/**
 * Every plan, side by side — the screen Billing's "Compare plans" opens.
 *
 * The prices move with the billing period rather than being listed twice,
 * because the question a person is answering here is "which plan", and
 * asking them to also hold two price columns in their head while they answer
 * it is asking two questions at once. The saving is named on the control
 * that causes it.
 *
 * The plan you are on keeps its place in the row, marked, with an action
 * that says what it actually does. A comparison that hid your own plan
 * would be missing the only column you can compare the others against.
 */
export function Plans({ currentPlanId = 'team', onBack }: PlansProps) {
  const [period, setPeriod] = useState<Period>('monthly')

  return (
    <SettingsPanel
      eyebrow="Billing"
      title="Available plans"
      description="Every plan includes a 14-day free trial of paid features. Switch anytime — changes prorate automatically."
      before={
        <Link
          href="/settings/billing"
          tone="muted"
          underline="hover"
          onClick={
            onBack
              ? (event) => {
                  event.preventDefault()
                  onBack()
                }
              : undefined
          }
        >
          <ArrowLeft aria-hidden="true" className="settings__back-icon" />
          Billing
        </Link>
      }
    >
      <Stack gap={16}>
        <div className="settings__period">
          <ChoiceGroup
            label="Billing period"
            hideLabel
            value={period}
            onChange={(next) => setPeriod(next as Period)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              {
                value: 'yearly',
                label: (
                  <>
                    Yearly
                    <Badge tone="success" size="sm">
                      Save 17%
                    </Badge>
                  </>
                ),
              },
            ]}
          />
          {period === 'yearly' ? (
            <Text size="xs" tone="muted">
              Prices shown per month, billed annually.
            </Text>
          ) : null}
        </div>

        <div className="settings__plans">
          {PLANS.map((plan) => {
            const current = plan.id === currentPlanId

            return (
              <PlanCard
                key={plan.id}
                name={plan.name}
                description={plan.description}
                price={price(plan.monthly, period)}
                period={plan.monthly === 0 ? 'forever' : plan.period}
                note={plan.note}
                features={plan.features}
                current={current}
                action={
                  <Button
                    size="sm"
                    fullWidth
                    variant={current ? 'secondary' : 'primary'}
                  >
                    {current ? 'Manage plan' : `Choose ${plan.name}`}
                  </Button>
                }
              />
            )
          })}
        </div>
      </Stack>
    </SettingsPanel>
  )
}
