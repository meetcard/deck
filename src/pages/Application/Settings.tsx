import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  Bell,
  Blocks,
  Building2,
  CreditCard,
  KeyRound,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Heading } from '../../components/Heading/Heading'
import { SettingsNav } from '../../components/SettingsNav/SettingsNav'
import type { SettingsNavGroup } from '../../components/SettingsNav/SettingsNav'
import { Stack } from '../../components/Stack/Stack'
import { SettingsAccount } from './SettingsAccount'
import { SettingsBilling } from './SettingsBilling'
import { SettingsCompany } from './SettingsCompany'
import { SettingsIntegrations } from './SettingsIntegrations'
import { SettingsNotifications } from './SettingsNotifications'
import { SettingsPlans } from './SettingsPlans'
import { SettingsProfile } from './SettingsProfile'
import { SettingsTeam } from './SettingsTeam'
import { isSettingsSectionId } from './settingsData'
import type { SettingsSectionId } from './settingsData'
import './Settings.css'

/* ---- Destinations ------------------------------------------------------- */

const icon = (Glyph: LucideIcon) => (
  <Glyph strokeWidth={1.75} aria-hidden="true" focusable="false" />
)

/**
 * Two groups, and the split is the product's own: what is yours, and what is
 * your company's. Profile and Account move with you between jobs; Billing,
 * Company, Integrations and Team belong to whoever is paying.
 *
 * `/settings/billing/plans` is deliberately absent. It is a page you arrive at
 * from Billing and leave by a breadcrumb, not a ninth destination — putting it
 * in the rail would make "Billing" and "Plans" look like peers when one is
 * inside the other.
 */
const GROUPS: SettingsNavGroup[] = [
  {
    label: 'User',
    items: [
      { id: '/settings/profile', href: '/settings/profile', label: 'Profile', icon: icon(UserRound) },
      { id: '/settings/account', href: '/settings/account', label: 'Account', icon: icon(KeyRound) },
      { id: '/settings/notifications', href: '/settings/notifications', label: 'Notifications', icon: icon(Bell) },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: '/settings/billing', href: '/settings/billing', label: 'Billing', icon: icon(CreditCard) },
      { id: '/settings/company', href: '/settings/company', label: 'Company', icon: icon(Building2) },
      { id: '/settings/integrations', href: '/settings/integrations', label: 'Integrations', icon: icon(Blocks) },
      { id: '/settings/team', href: '/settings/team', label: 'Team', icon: icon(Users) },
    ],
  },
]

/* ---- Page --------------------------------------------------------------- */

export interface SettingsProps {
  /** Which panel to open on. Defaults to Profile. */
  section?: SettingsSectionId
  /** Told which section was chosen, for an app that owns the route. */
  onSectionChange?: (section: SettingsSectionId) => void
}

/**
 * Settings — eight panels behind one nav.
 *
 * The frame is a two-column grid from `md` up and a single column below it,
 * which is the width `SettingsNav` already swaps its own control on: the list
 * beside the panel on a desk, the platform's picker above it on a phone. One
 * change of layout, at the line the app shell uses for its own navigation.
 *
 * **This page is its own router.** Every destination is a real `<a href>` —
 * the nav's items, Billing's "Change plan", Profile's cross-link to Company,
 * the Plans breadcrumb — and a single delegated click handler intercepts the
 * ones pointing inside `/settings` and swaps the panel instead. That is
 * exactly what a router's `<Link>` does, and it is why the markup here stays
 * navigable and shareable rather than degrading to buttons that only work in
 * this demo. An app with a real router drops the handler and keeps the links.
 *
 * The panels hold their own state and none of it persists — Deck has no data
 * layer, so a switch flipped here is flipped until the page goes away.
 *
 * @example
 * <AppShell currentId="/settings">
 *   <Settings section="/settings/billing" />
 * </AppShell>
 */
export function Settings({
  section: initialSection = '/settings/profile',
  onSectionChange,
}: SettingsProps) {
  const [section, setSection] = useState<SettingsSectionId>(initialSection)

  function go(next: SettingsSectionId) {
    setSection(next)
    onSectionChange?.(next)
  }

  /*
   * Standing in for a router. Anything that resolves to a settings section is
   * handled here; every other link on the page — a company's website, an
   * invoice — is left alone and behaves like a link.
   */
  function handleClick(clickEvent: MouseEvent<HTMLDivElement>) {
    const target = clickEvent.target as HTMLElement | null
    const link = target?.closest?.('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (!isSettingsSectionId(href)) return

    clickEvent.preventDefault()
    go(href)
  }

  const panels: Record<SettingsSectionId, ReactNode> = {
    '/settings/profile': <SettingsProfile />,
    '/settings/account': <SettingsAccount />,
    '/settings/notifications': <SettingsNotifications />,
    '/settings/billing': <SettingsBilling />,
    '/settings/billing/plans': <SettingsPlans />,
    '/settings/company': <SettingsCompany />,
    '/settings/integrations': <SettingsIntegrations />,
    '/settings/team': <SettingsTeam />,
  }

  return (
    <div className="settings" onClick={handleClick}>
      <Stack gap={24} className="settings__container">
        <Heading level={1} size="xl" family="serif">
          Settings
        </Heading>

        <div className="settings__layout">
          <SettingsNav
            groups={GROUPS}
            /* Plans is inside Billing, so Billing stays lit while you are on
               it — the nav should say where in the product you are, not
               unlight itself because the exact route is missing from it. */
            currentId={
              section === '/settings/billing/plans' ? '/settings/billing' : section
            }
            onSelect={(id) => {
              if (isSettingsSectionId(id)) go(id)
            }}
            className="settings__nav"
          />

          {/* Keyed, so switching panels remounts rather than carrying one
              panel's half-edited state into the next one's fields. */}
          <div className="settings__panel-column" key={section}>
            {panels[section]}
          </div>
        </div>
      </Stack>
    </div>
  )
}
