import { useState } from 'react'
import { Badge } from '../../../components/Badge/Badge'
import { Banner } from '../../../components/Banner/Banner'
import { ChoiceGroup } from '../../../components/ChoiceGroup/ChoiceGroup'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

type Cadence = 'off' | 'daily' | 'weekly'

const INITIAL = {
  followUps: true,
  newConnection: true,
  newLead: false,
  syncSuccess: false,
  syncFailure: true,
  bookingNew: true,
  bookingCancelled: true,
  bookingRescheduled: false,
  push: false,
  email: true,
}

type Toggles = typeof INITIAL

/**
 * Which alerts arrive, and how.
 *
 * The cadence picker is nested under the reminder it paces rather than
 * sitting beside it: it is not a preference of its own, it is the shape of
 * the one above, and it disappears when there is nothing to pace.
 */
export function Notifications() {
  const [on, setOn] = useState<Toggles>(INITIAL)
  const [cadence, setCadence] = useState<Cadence>('weekly')

  const set = (key: keyof Toggles) => (next: boolean) =>
    setOn((all) => ({ ...all, [key]: next }))

  return (
    <SettingsPanel
      eyebrow="Notifications"
      title="Notification preferences"
      description="Choose which alerts you receive and how they're delivered."
      onSave={() => {}}
    >
      <Stack gap={24}>
        <SettingsGroup title="Follow-up reminders">
          <SettingRow
            title="Follow-up reminders"
            description="Get nudged to follow up with people you've exchanged cards with."
            checked={on.followUps}
            onCheckedChange={set('followUps')}
          />
          {on.followUps ? (
            <SettingRow
              title="Default cadence"
              description="How often to surface follow-up reminders."
            >
              <ChoiceGroup
                label="Default cadence"
                hideLabel
                options={[
                  { value: 'off', label: 'Off' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                ]}
                value={cadence}
                onChange={(next) => setCadence(next as Cadence)}
              />
            </SettingRow>
          ) : null}
        </SettingsGroup>

        <SettingsGroup title="Connection alerts">
          <SettingRow
            title="New connection"
            description="When someone adds you to their connections."
            checked={on.newConnection}
            onCheckedChange={set('newConnection')}
          />
          <SettingRow
            title="New lead"
            description="When a connection is flagged as a potential lead."
            checked={on.newLead}
            onCheckedChange={set('newLead')}
          />
        </SettingsGroup>

        <SettingsGroup title="CRM">
          <SettingRow
            title="Sync success"
            description="When a CRM sync completes successfully."
            checked={on.syncSuccess}
            onCheckedChange={set('syncSuccess')}
          />
          <SettingRow
            title="Sync failure"
            description="When a CRM sync fails and needs attention."
            checked={on.syncFailure}
            onCheckedChange={set('syncFailure')}
          />
        </SettingsGroup>

        <SettingsGroup title="Booking">
          <SettingRow
            title="New booking"
            description="When someone books a meeting through your card."
            checked={on.bookingNew}
            onCheckedChange={set('bookingNew')}
          />
          <SettingRow
            title="Cancelled"
            description="When a booked meeting is cancelled."
            checked={on.bookingCancelled}
            onCheckedChange={set('bookingCancelled')}
          />
          <SettingRow
            title="Rescheduled"
            description="When a booked meeting is rescheduled."
            checked={on.bookingRescheduled}
            onCheckedChange={set('bookingRescheduled')}
          />
        </SettingsGroup>

        <SettingsGroup title="Delivery">
          <SettingRow
            title="Push"
            description="Send notifications to this device."
            checked={on.push}
            onCheckedChange={set('push')}
          />
          <SettingRow
            title="Email"
            description="Send a digest to ben@meetcard.io."
            checked={on.email}
            onCheckedChange={set('email')}
          />
          <SettingRow
            title="Browser push"
            description="Push is blocked for this site."
            control={<Badge tone="error">Blocked</Badge>}
          >
            {/* Stated as a Banner rather than help text, because it is not
                advice about a setting — it is the reason the setting above
                cannot do anything, and the fix is outside the app. */}
            <Banner tone="warning" title="Blocked in your browser">
              To re-enable, open your browser's site settings for MeetCard and
              allow notifications. This can't be reset from within the app.
            </Banner>
          </SettingRow>
        </SettingsGroup>
      </Stack>
    </SettingsPanel>
  )
}
