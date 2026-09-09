import { useState } from 'react'
import { CreditCard, Download, Minus, Plus } from 'lucide-react'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Heading } from '../../../components/Heading/Heading'
import { IconButton } from '../../../components/IconButton/IconButton'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { UsageMeter } from '../../../components/UsageMeter/UsageMeter'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

const PER_SEAT = 9
const MIN_SEATS = 3
const MAX_SEATS = 10

const USAGE = [
  { label: 'Connections', value: 128, max: 500 },
  { label: 'Events this month', value: 3, max: 10 },
  { label: 'Card exchanges', value: 214, max: 1000 },
]

const INVOICES = [
  { id: 'INV-0042', date: 'Aug 1, 2026', amount: '$59.00' },
  { id: 'INV-0041', date: 'Jul 1, 2026', amount: '$59.00' },
  { id: 'INV-0040', date: 'Jun 1, 2026', amount: '$59.00' },
  { id: 'INV-0039', date: 'May 1, 2026', amount: '$59.00' },
]

export interface BillingProps {
  /**
   * Opens the plan comparison. A route of its own in the product; here it
   * is a view Billing swaps to, because this composition has no router.
   */
  onComparePlans?: () => void
}

/**
 * Plan, usage, seats, payment, invoices.
 *
 * The seat control shows the price moving as it changes, because the number
 * of seats is not the thing anyone is deciding — the monthly figure is, and
 * making someone multiply by nine to find it is how a plan page gets abandoned.
 */
export function Billing({ onComparePlans }: BillingProps = {}) {
  const [seats, setSeats] = useState(6)

  const step = (delta: number) =>
    setSeats((current) =>
      Math.min(MAX_SEATS, Math.max(MIN_SEATS, current + delta)),
    )

  const monthly = seats * PER_SEAT

  return (
    <SettingsPanel
      eyebrow="Billing"
      title="Plan, usage & payments"
      description="Manage your subscription, review usage, update your payment method, and download invoices."
    >
      <Stack gap={24}>
        <SettingsGroup
          title="Current plan"
          description="Your subscription and billing cadence."
        >
          <div className="settings__plan">
            <Stack gap={4}>
              <div className="settings__plan-name">
                <Heading level={4} size="sm">
                  Team
                </Heading>
                <Badge tone="success" size="sm">
                  Active
                </Badge>
              </div>
              <Text size="sm" tone="muted">
                ${monthly}/month · billed monthly · {seats} seats at ${PER_SEAT}
                /seat
              </Text>
            </Stack>
            <Button variant="secondary" onClick={onComparePlans}>
              Change plan
            </Button>
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Usage"
          description="How much of your plan you've used this cycle."
        >
          <div className="settings__usage">
            {USAGE.map((row) => (
              <UsageMeter
                key={row.label}
                label={row.label}
                value={row.value}
                max={row.max}
              />
            ))}
            <UsageMeter label="Seats" value={seats} max={MAX_SEATS} />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Team seats"
          description={`${MIN_SEATS} seat minimum · $${PER_SEAT}/seat/month for additional seats.`}
        >
          <SettingRow
            title="Seats"
            description={`${seats} seats · $${monthly}/month`}
            control={
              <div className="settings__stepper">
                <IconButton
                  label="Remove a seat"
                  icon={<Minus />}
                  size="sm"
                  variant="secondary"
                  disabled={seats <= MIN_SEATS}
                  onClick={() => step(-1)}
                />
                {/* `aria-live` rather than a label on the number: the count
                    is the result of the two buttons either side, so it wants
                    announcing when it changes, not naming as a control. */}
                <output className="settings__stepper-value" aria-live="polite">
                  {seats}
                </output>
                <IconButton
                  label="Add a seat"
                  icon={<Plus />}
                  size="sm"
                  variant="secondary"
                  disabled={seats >= MAX_SEATS}
                  onClick={() => step(1)}
                />
              </div>
            }
          />
        </SettingsGroup>

        <SettingsGroup
          title="Payment method"
          description="The card charged for your subscription."
        >
          <SettingRow
            title="Visa ending in 4242"
            description="Expires 08/28"
            control={
              <Button variant="secondary" size="sm">
                Update
              </Button>
            }
          >
            <div className="settings__payment">
              <CreditCard aria-hidden="true" />
              <Text size="xs" tone="muted">
                Charged on the 1st of each month.
              </Text>
            </div>
          </SettingRow>
        </SettingsGroup>

        <SettingsGroup
          title="Invoices"
          description="Download past invoices for your records."
        >
          {INVOICES.map((invoice) => (
            <SettingRow
              key={invoice.id}
              title={invoice.id}
              description={`${invoice.date} · ${invoice.amount}`}
              control={
                <>
                  <Badge tone="success" size="sm">
                    Paid
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconStart={<Download aria-hidden="true" />}
                  >
                    <span className="deck-visually-hidden">
                      Download invoice {invoice.id}
                    </span>
                    <span aria-hidden="true">Download</span>
                  </Button>
                </>
              }
            />
          ))}
        </SettingsGroup>

        <SettingsGroup
          title="Subscription"
          description="Cancel or reactivate your subscription."
        >
          <SettingRow
            title="Renews on Sep 1, 2026"
            description="Cancelling keeps your cards live until the end of the cycle."
            control={
              <Button variant="ghost" size="sm">
                Cancel subscription
              </Button>
            }
          />
          <SettingRow
            title="Compare plans"
            description="See features and pricing for Solo, Pro, and Team."
            control={
              <Button variant="secondary" size="sm" onClick={onComparePlans}>
                View plans
              </Button>
            }
          />
        </SettingsGroup>
      </Stack>
    </SettingsPanel>
  )
}
