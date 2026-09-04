import { useState } from 'react'
import {
  ArrowRight,
  CircleCheck,
  CreditCard,
  Download,
  Minus,
  Plus,
  Receipt,
} from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { UsageMeter } from '../../components/UsageMeter/UsageMeter'
import { LinkButton } from './LinkButton'
import { SettingsPanel, SettingsRow, SettingsSection } from './SettingsPanel'
import { SEATS, TEAM } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

/**
 * What the plan has been used for this cycle.
 *
 * Seats are here as well as in the Team panel, and they are the same number
 * read two ways: Team asks "who is on the account", Billing asks "what am I
 * paying for". They come from one constant so they cannot drift.
 */
const USAGE = [
  { id: 'connections', label: 'Connections', value: 128, max: 500 },
  { id: 'seats', label: 'Seats', value: TEAM.length, max: SEATS.total },
  { id: 'events', label: 'Events per month', value: 3, max: 10 },
  { id: 'exchanges', label: 'Card exchanges', value: 214, max: 1000 },
]

interface Invoice {
  id: string
  date: string
  amount: string
  status: 'Paid' | 'Refunded'
}

const INVOICES: Invoice[] = [
  { id: 'INV-0042', date: 'Sep 1, 2026', amount: '$90.00', status: 'Paid' },
  { id: 'INV-0041', date: 'Aug 1, 2026', amount: '$90.00', status: 'Paid' },
  { id: 'INV-0040', date: 'Jul 1, 2026', amount: '$90.00', status: 'Paid' },
  { id: 'INV-0039', date: 'Jun 1, 2026', amount: '$90.00', status: 'Paid' },
]

const RENEWS = 'Oct 1, 2026'

/* ---- Page --------------------------------------------------------------- */

/**
 * Billing — the plan, what it has been used for, and what it costs.
 *
 * Ordered as the questions arrive: what am I on, am I outgrowing it, what am
 * I paying, and how do I stop. Plans is a page of its own at the foot rather
 * than a grid inlined here, because comparing three plans is a different job
 * from checking an invoice and it deserves the whole column.
 *
 * The seat stepper buys seats; it does not fill them. Its floor is whichever
 * is higher of the plan's three-seat minimum and the number of people already
 * on the team — dropping below the latter would silently sign someone out of
 * an account they are using, which is not a thing a stepper should be able to
 * do quietly.
 */
export function SettingsBilling() {
  const [seats, setSeats] = useState(SEATS.total)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)

  const filled = TEAM.length
  const floor = Math.max(SEATS.minimum, filled)
  const monthly = seats * SEATS.pricePerSeat

  return (
    <SettingsPanel
      eyebrow="Billing"
      icon={<CreditCard />}
      title="Plan, usage & payments"
      description="Manage your subscription, review usage, update your payment method, and download invoices."
    >
      <SettingsSection
        title="Current plan"
        description="Your subscription and billing cadence."
        divided={false}
      >
        {cancelled ? (
          <Banner
            tone="warning"
            title="Your subscription is set to cancel"
            actions={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCancelled(false)}
              >
                Reactivate
              </Button>
            }
          >
            Team features stay on until {RENEWS}, then the account drops to
            Solo.
          </Banner>
        ) : null}

        <div className="settings__plan-summary">
          <div>
            <Heading level={4} size="sm">
              Team{' '}
              <Badge tone={cancelled ? 'warning' : 'success'} size="sm" dot>
                {cancelled ? 'Cancelling' : 'Active'}
              </Badge>
            </Heading>
            <Text size="sm" tone="muted">
              ${monthly}/month · billed monthly · {seats} seats at $
              {SEATS.pricePerSeat}/seat
            </Text>
          </div>
          <LinkButton
            href="/settings/billing/plans"
            size="sm"
            variant="secondary"
          >
            Change plan
          </LinkButton>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Usage"
        description="How much of your plan you've used this cycle."
        gap={20}
      >
        <Stack as="ul" gap={20} className="settings__list">
          {USAGE.map((meter) => (
            <li key={meter.id}>
              <UsageMeter
                label={meter.label}
                value={meter.value}
                max={meter.max}
                formatValue={(value, max) => `${value} / ${max}`}
              />
            </li>
          ))}
        </Stack>
      </SettingsSection>

      <SettingsSection
        title="Seats"
        description={`${SEATS.minimum} seat minimum · $${SEATS.pricePerSeat}/seat/month for additional seats.`}
        gap={12}
      >
        <SettingsRow
          title={`${seats} seats · $${monthly}/month`}
          description={
            seats === floor
              ? `${filled} of them are in use, and the plan's minimum is ${SEATS.minimum}.`
              : `${filled} in use, ${seats - filled} spare.`
          }
          action={
            <div className="settings__stepper">
              <IconButton
                label="Remove seat"
                variant="secondary"
                size="sm"
                icon={<Minus />}
                disabled={seats <= floor}
                onClick={() => setSeats((all) => Math.max(all - 1, floor))}
              />
              <span className="settings__stepper-value">{seats}</span>
              <IconButton
                label="Add seat"
                variant="secondary"
                size="sm"
                icon={<Plus />}
                onClick={() => setSeats((all) => all + 1)}
              />
            </div>
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Payment method"
        description="The card charged for your subscription."
        gap={12}
      >
        <SettingsRow
          icon={<span className="settings__card-brand">VISA</span>}
          title="Visa ending in 4242"
          description="Expires 08/28"
          action={
            <Button size="sm" variant="secondary">
              Update
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Invoices"
        description="Download past invoices for your records."
        gap={12}
      >
        <Stack as="ul" gap={8} className="settings__list">
          {INVOICES.map((invoice) => (
            <li key={invoice.id}>
              <SettingsRow
                icon={<Receipt />}
                title={invoice.id}
                description={invoice.date}
                action={
                  <>
                    <Text size="sm" weight="semibold" as="span">
                      {invoice.amount}
                    </Text>
                    <Badge tone="success" size="sm">
                      <CircleCheck aria-hidden="true" focusable="false" />
                      {invoice.status}
                    </Badge>
                    <IconButton
                      label={`Download ${invoice.id}`}
                      variant="ghost"
                      size="sm"
                      icon={<Download />}
                    />
                  </>
                }
              />
            </li>
          ))}
        </Stack>
      </SettingsSection>

      <SettingsSection
        title="Subscription"
        description="Cancel or reactivate your subscription."
        gap={12}
      >
        {/* Not the danger tone. A renewal date is neutral news; painting the
            whole band red would make "your subscription is working" look like
            a problem, and would spend the alarm this page needs for the one
            row that actually deletes something. The button carries it. */}
        <SettingsRow
          title={
            cancelled
              ? `Team features end on ${RENEWS}`
              : `Your subscription renews on ${RENEWS}`
          }
          description={
            cancelled
              ? 'Reactivating before then keeps everything as it is.'
              : 'Cancelling keeps your cards live and drops the account to Solo at the end of the cycle.'
          }
          action={
            cancelled ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCancelled(false)}
              >
                Reactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setCancelling(true)}
              >
                Cancel subscription
              </Button>
            )
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Plans"
        description="Compare all available plans."
        gap={12}
      >
        <SettingsRow
          title="See features and pricing"
          description="Solo, Pro, and Team, side by side."
          action={
            <LinkButton
              href="/settings/billing/plans"
              size="sm"
              variant="secondary"
              iconEnd={<ArrowRight />}
            >
              View plans
            </LinkButton>
          }
        />
      </SettingsSection>

      <Sheet
        open={cancelling}
        onClose={() => setCancelling(false)}
        placement="center"
        title="Cancel your subscription?"
        description={`Team features stay on until ${RENEWS}. After that the account drops to Solo — one card, 100 connections, and no shared branding.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelling(false)}>
              Keep my plan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCancelled(true)
                setCancelling(false)
              }}
            >
              Cancel subscription
            </Button>
          </>
        }
      >
        <Text size="sm" tone="muted">
          Your cards keep working and nobody loses a connection. What ends is
          the team: {filled} people drop to their own free accounts, and the
          shared branding comes off their cards.
        </Text>
      </Sheet>
    </SettingsPanel>
  )
}
