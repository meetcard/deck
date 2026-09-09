import { useState } from 'react'
import type { ReactNode } from 'react'
import { Boxes, Cloud, Database, Globe, KeyRound, Mail, Sparkles } from 'lucide-react'
import { Button } from '../../../components/Button/Button'
import { IntegrationRow } from '../../../components/IntegrationRow/IntegrationRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

interface Service {
  id: string
  name: string
  group: 'CRM' | 'SSO' | 'Enrichment'
  logo: ReactNode
  description: string
  connected: boolean
}

const SERVICES: Service[] = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    group: 'CRM',
    logo: <Database />,
    description: 'Sync connections and their notes as contacts and activities.',
    connected: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    group: 'CRM',
    logo: <Cloud />,
    description: 'Push new connections as Leads and log card exchanges as tasks.',
    connected: false,
  },
  {
    id: 'google',
    name: 'Google',
    group: 'SSO',
    logo: <Globe />,
    description: 'Let teammates sign in with their Google workspace identity.',
    connected: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    group: 'SSO',
    logo: <Mail />,
    description: 'Single sign-on with Microsoft 365 / Entra ID accounts.',
    connected: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    group: 'SSO',
    logo: <Boxes />,
    description: 'Sign in with LinkedIn and import profile details.',
    connected: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    group: 'SSO',
    logo: <KeyRound />,
    description: 'Sign in with GitHub for engineering and dev-team workspaces.',
    connected: false,
  },
  {
    id: 'clay',
    name: 'Clay',
    group: 'Enrichment',
    logo: <Sparkles />,
    description: 'Enrich new connections with verified contact and firm data.',
    connected: false,
  },
]

const GROUPS = ['CRM', 'SSO', 'Enrichment'] as const

/**
 * Connected tools — what MeetCard is wired into, and as whom.
 *
 * No save bar: connecting a service is an OAuth round trip that has already
 * happened by the time the row changes. A Save here would claim the buttons
 * above it had not done anything yet.
 */
export function Integrations() {
  const [connected, setConnected] = useState(
    () => new Set(SERVICES.filter((s) => s.connected).map((s) => s.id)),
  )

  const toggle = (id: string) =>
    setConnected((all) => {
      const next = new Set(all)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <SettingsPanel
      eyebrow="Integrations"
      title="Connected tools"
      description="Connect MeetCard to the systems your team already uses. Manage sign-in providers, push connections to your CRM, and enrich new contacts automatically."
    >
      <Stack gap={24}>
        {GROUPS.map((group) => (
          <SettingsGroup key={group} title={group}>
            {SERVICES.filter((service) => service.group === group).map(
              (service) => {
                const isOn = connected.has(service.id)
                return (
                  <IntegrationRow
                    key={service.id}
                    name={service.name}
                    logo={service.logo}
                    description={service.description}
                    status={isOn ? 'connected' : 'disconnected'}
                    actions={
                      isOn ? (
                        <>
                          <Button size="sm" variant="secondary">
                            {/* Same word on every row, so the announced name
                                carries the service it belongs to. */}
                            <span className="deck-visually-hidden">
                              Manage {service.name}
                            </span>
                            <span aria-hidden="true">Manage</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggle(service.id)}
                          >
                            <span className="deck-visually-hidden">
                              Disconnect {service.name}
                            </span>
                            <span aria-hidden="true">Disconnect</span>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => toggle(service.id)}>
                          <span className="deck-visually-hidden">
                            Connect {service.name}
                          </span>
                          <span aria-hidden="true">Connect</span>
                        </Button>
                      )
                    }
                  />
                )
              },
            )}
          </SettingsGroup>
        ))}

        <Text size="xs" tone="muted">
          MeetCard only requests the minimum scopes needed. You can revoke
          access at any time.
        </Text>
      </Stack>
    </SettingsPanel>
  )
}
