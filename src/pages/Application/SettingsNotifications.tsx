import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Select } from '../../components/Select/Select'
import { Stack } from '../../components/Stack/Stack'
import { Switch } from '../../components/Switch/Switch'
import { Text } from '../../components/Text/Text'
import {
  SettingsFooter,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
} from './SettingsPanel'
import { ACCOUNT } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

/**
 * Every alert MeetCard can send, grouped by what it is about.
 *
 * Written as data rather than markup because the panel is one shape repeated
 * eleven times, and a list makes the defaults readable at a glance — which
 * matters more here than anywhere else in Settings, since the defaults are
 * what almost everyone ships with.
 */
interface Alert {
  id: string
  label: string
  description: string
  on: boolean
}

interface AlertGroup {
  title: string
  alerts: Alert[]
}

const GROUPS: AlertGroup[] = [
  {
    title: 'Connection alerts',
    alerts: [
      {
        id: 'new-connection',
        label: 'New connection',
        description: 'When someone adds you to their connections.',
        on: true,
      },
      {
        id: 'new-lead',
        label: 'New lead',
        description: 'When a connection is flagged as a potential lead.',
        on: true,
      },
    ],
  },
  {
    title: 'CRM',
    alerts: [
      {
        id: 'sync-success',
        label: 'Sync success',
        description: 'When a CRM sync completes successfully.',
        /* Off, and deliberately: a sync that worked is not news. The failure
           below is on for the same reason. */
        on: false,
      },
      {
        id: 'sync-failure',
        label: 'Sync failure',
        description: 'When a CRM sync fails and needs attention.',
        on: true,
      },
    ],
  },
  {
    title: 'Booking',
    alerts: [
      {
        id: 'new-booking',
        label: 'New booking',
        description: 'When someone books a meeting through your card.',
        on: true,
      },
      {
        id: 'booking-cancelled',
        label: 'Cancelled',
        description: 'When a booked meeting is cancelled.',
        on: true,
      },
      {
        id: 'booking-rescheduled',
        label: 'Rescheduled',
        description: 'When a booked meeting is rescheduled.',
        on: true,
      },
    ],
  },
]

const DELIVERY: Alert[] = [
  {
    id: 'push',
    label: 'Push',
    description: 'Send notifications to this device.',
    on: true,
  },
  {
    id: 'email',
    label: 'Email',
    description: `Send a digest to ${ACCOUNT.email}.`,
    on: true,
  },
]

const CADENCES = [
  { value: 'off', label: 'Off' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

/* ---- Page --------------------------------------------------------------- */

export interface SettingsNotificationsProps {
  /**
   * Whether this browser has been granted permission to show notifications.
   * A prop rather than a read of `Notification.permission`, so the panel
   * renders the same thing in a story, a snapshot and a test as it does in a
   * browser that has already been asked.
   */
  pushPermission?: 'granted' | 'denied' | 'unasked'
}

/**
 * Notification preferences — which alerts you get, and how they reach you.
 *
 * Ordered by what the alert is about rather than by channel, because that is
 * how people arrive: someone turns off CRM noise, not "email". Channel is the
 * last section, applied across everything above it.
 *
 * Follow-up reminders lead, and they are the only alert with a setting of
 * their own — a cadence, since a nudge you cannot pace is one you turn off.
 * The cadence stays visible while the reminders are off rather than
 * disappearing: a control that vanishes is a control people cannot find again.
 */
export function SettingsNotifications({
  pushPermission = 'unasked',
}: SettingsNotificationsProps) {
  const [followUps, setFollowUps] = useState(true)
  const [cadence, setCadence] = useState('weekly')
  const [alerts, setAlerts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      [...GROUPS.flatMap((group) => group.alerts), ...DELIVERY].map((alert) => [
        alert.id,
        alert.on,
      ]),
    ),
  )

  const toggle = (id: string) =>
    setAlerts((all) => ({ ...all, [id]: !all[id] }))

  const renderAlert = (alert: Alert) => (
    <div key={alert.id} className="settings__band">
      <Switch
        label={alert.label}
        description={alert.description}
        checked={alerts[alert.id]}
        onChange={() => toggle(alert.id)}
      />
    </div>
  )

  const push = {
    granted: {
      title: 'Browser push is on',
      description: 'This browser will show MeetCard notifications.',
    },
    denied: {
      title: 'Browser push is blocked',
      description:
        'This browser is refusing notifications. Allow them in its site settings to turn push back on.',
    },
    unasked: {
      title: 'Browser push is not set up',
      description:
        'This browser has not been asked yet. Turning Push on above is what asks.',
    },
  }[pushPermission]

  return (
    <SettingsPanel
      eyebrow="Notifications"
      icon={<Bell />}
      title="Notification preferences"
      description="Choose which alerts you receive and how they're delivered."
      footer={
        <SettingsFooter note="Preferences apply to every device you're signed in on." />
      }
    >
      <SettingsSection title="Follow-up reminders" divided={false}>
        <div className="settings__band">
          <Switch
            label="Follow-up reminders"
            description="Get nudged to follow up with people you've exchanged cards with."
            checked={followUps}
            onChange={(changeEvent) => setFollowUps(changeEvent.target.checked)}
          />
        </div>

        <SettingsRow
          title="Default cadence"
          description="How often to surface follow-up reminders."
          action={
            <Select
              label="Default cadence"
              hideLabel
              size="sm"
              options={CADENCES}
              value={cadence}
              disabled={!followUps}
              onChange={(changeEvent) => setCadence(changeEvent.target.value)}
            />
          }
        />
      </SettingsSection>

      {GROUPS.map((group) => (
        <SettingsSection key={group.title} title={group.title} gap={12}>
          <Stack gap={8}>{group.alerts.map(renderAlert)}</Stack>
        </SettingsSection>
      ))}

      <SettingsSection
        title="Delivery"
        description="Where every alert above is sent."
        gap={12}
      >
        <Stack gap={8}>{DELIVERY.map(renderAlert)}</Stack>
      </SettingsSection>

      <SettingsSection title="Push status" gap={12}>
        <SettingsRow
          icon={<Bell />}
          title={push.title}
          description={push.description}
        />
        <Text size="xs" tone="muted">
          Deck ships no service worker, so this reports what the browser would
          say rather than asking it.
        </Text>
      </SettingsSection>
    </SettingsPanel>
  )
}
