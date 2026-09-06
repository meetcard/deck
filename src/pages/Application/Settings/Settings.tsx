import { useState } from 'react'
import type { JSX } from 'react'
import {
  Bell,
  Building2,
  CreditCard,
  Plug,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { Heading } from '../../../components/Heading/Heading'
import { SettingsNav } from '../../../components/SettingsNav/SettingsNav'
import { Stack } from '../../../components/Stack/Stack'
import { Account } from './Account'
import { Billing } from './Billing'
import { Company } from './Company'
import { Integrations } from './Integrations'
import { Notifications } from './Notifications'
import { Profile } from './Profile'
import { Team } from './Team'
import './Settings.css'

export type SettingsSectionId =
  | 'profile'
  | 'account'
  | 'notifications'
  | 'billing'
  | 'company'
  | 'integrations'
  | 'team'

const icon = (Glyph: typeof UserRound) => (
  <Glyph strokeWidth={1.75} aria-hidden="true" focusable="false" />
)

/*
 * Split the way responsibility splits, not the way the routes are ordered.
 * The first three are yours alone and take effect on your own card; the last
 * four reach other people — a seat someone else pays for, a logo on everyone's
 * card, a token that grants access. Someone looking for "why can't Priya book
 * a time" is looking in the second group, and the heading is what tells them.
 */
const GROUPS = [
  {
    label: 'You',
    items: [
      { id: 'profile', label: 'Profile', icon: icon(UserRound) },
      { id: 'account', label: 'Account', icon: icon(ShieldCheck) },
      { id: 'notifications', label: 'Notifications', icon: icon(Bell) },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { id: 'billing', label: 'Billing', icon: icon(CreditCard) },
      { id: 'company', label: 'Company', icon: icon(Building2) },
      { id: 'integrations', label: 'Integrations', icon: icon(Plug) },
      { id: 'team', label: 'Team', icon: icon(Users) },
    ],
  },
]

const SECTIONS: Record<SettingsSectionId, () => JSX.Element> = {
  profile: Profile,
  account: Account,
  notifications: Notifications,
  billing: Billing,
  company: Company,
  integrations: Integrations,
  team: Team,
}

export interface SettingsProps {
  /** Which section is open. Uncontrolled unless `onSectionChange` is given. */
  section?: SettingsSectionId
  onSectionChange?: (section: SettingsSectionId) => void
}

/**
 * Settings — the nav and whichever section it has open.
 *
 * The nav items carry no `href`. In the product these are real routes, but
 * `SettingsNav` renders a route-less item as a `<button>`, and a button that
 * switches the panel is the honest control for a composition with no router
 * under it — the same call `AppShell` makes for the account drawer. A real
 * app passes its own `href`s and lets the router do the work.
 *
 * `SettingsNav` collapses to a native `<select>` on a phone, so this page
 * needs no breakpoint of its own for the navigation.
 */
export function Settings({ section, onSectionChange }: SettingsProps) {
  const [internal, setInternal] = useState<SettingsSectionId>('profile')
  const current = section ?? internal

  const select = (next: string) => {
    const id = next as SettingsSectionId
    if (section === undefined) setInternal(id)
    onSectionChange?.(id)
  }

  const Section = SECTIONS[current]

  return (
    <div className="settings">
      <Stack gap={24} className="settings__container">
        <Heading level={1} size="xl" family="serif">
          Settings
        </Heading>

        <div className="settings__layout">
          <SettingsNav
            groups={GROUPS}
            currentId={current}
            onSelect={select}
            label="Settings sections"
            className="settings__nav"
          />

          {/* Keyed on the section so switching remounts it: each section
              holds its own draft state, and carrying a half-edited bio into
              Billing would be a bug rather than a feature. */}
          <div className="settings__content">
            <Section key={current} />
          </div>
        </div>
      </Stack>
    </div>
  )
}
