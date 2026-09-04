import { useState } from 'react'
import { Blocks, Settings2, ShieldCheck, Unplug } from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { Stack } from '../../components/Stack/Stack'
import { providerIcons } from '../../components/ProviderButton/providerIcons'
import type { AuthProvider } from '../../components/ProviderButton/ProviderButton'
import { SettingsPanel, SettingsRow, SettingsSection } from './SettingsPanel'

/* ---- Model -------------------------------------------------------------- */

interface Integration {
  id: string
  name: string
  description: string
  connected: boolean
  /**
   * An SSO vendor's own mark, where there is one. The rest fall back to a
   * lettered `Avatar` — Deck ships four brand marks because those four are
   * sign-in buttons, and inventing logos for everyone else would be worse
   * than an honest initial.
   */
  provider?: AuthProvider
}

interface IntegrationGroup {
  title: string
  description: string
  integrations: Integration[]
}

const GROUPS: IntegrationGroup[] = [
  {
    title: 'CRM',
    description: 'Where the connections you collect end up.',
    integrations: [
      {
        id: 'hubspot',
        name: 'HubSpot',
        description:
          'Sync connections and their notes as contacts and activities.',
        connected: true,
      },
      {
        id: 'salesforce',
        name: 'Salesforce',
        description:
          'Push new connections as Leads and log card exchanges as tasks.',
        connected: false,
      },
    ],
  },
  {
    title: 'SSO',
    description: 'How your team signs in.',
    integrations: [
      {
        id: 'google',
        name: 'Google',
        description: 'Let teammates sign in with their Google workspace identity.',
        connected: true,
        provider: 'google',
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        description: 'Single sign-on with Microsoft 365 / Entra ID accounts.',
        connected: false,
        provider: 'microsoft',
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Sign in with LinkedIn and import profile details.',
        connected: true,
        provider: 'linkedin',
      },
      {
        id: 'github',
        name: 'GitHub',
        description: 'Sign in with GitHub for engineering and dev-team workspaces.',
        connected: false,
        provider: 'github',
      },
    ],
  },
  {
    title: 'Enrichment',
    description: 'What gets filled in for you.',
    integrations: [
      {
        id: 'clay',
        name: 'Clay',
        description:
          'Enrich new connections with verified contact and firm data.',
        connected: false,
      },
    ],
  },
]

/* ---- Page --------------------------------------------------------------- */

/**
 * Connected tools — the systems MeetCard hands work off to.
 *
 * Grouped by what the connection is *for* rather than by vendor, because that
 * is the question people arrive with: where do these contacts go, how does the
 * team sign in, what gets filled in automatically. Salesforce and Google are
 * both OAuth, and grouping on that would put them together and help nobody.
 *
 * CRM leads because it is the one with consequences — it moves data out of
 * MeetCard into a system other people read.
 *
 * The scopes line is at the foot rather than repeated per row: it is true of
 * every connection here, and saying it eight times makes it furniture.
 */
export function SettingsIntegrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      GROUPS.flatMap((group) =>
        group.integrations.map((one) => [one.id, one.connected]),
      ),
    ),
  )

  const toggle = (id: string) =>
    setConnected((all) => ({ ...all, [id]: !all[id] }))

  return (
    <SettingsPanel
      eyebrow="Integrations"
      icon={<Blocks />}
      title="Connected tools"
      description="Connect MeetCard to the systems your team already uses. Manage sign-in providers, push connections to your CRM, and enrich new contacts automatically."
      footer={
        <p className="settings__note">
          <ShieldCheck aria-hidden="true" focusable="false" />
          MeetCard only requests the minimum scopes needed. You can revoke
          access at any time.
        </p>
      }
    >
      {GROUPS.map((group, index) => (
        <SettingsSection
          key={group.title}
          title={group.title}
          description={group.description}
          divided={index > 0}
          gap={12}
        >
          <Stack as="ul" gap={8} className="settings__list">
            {group.integrations.map((integration) => {
              const on = connected[integration.id]

              return (
                <li key={integration.id}>
                  <SettingsRow
                    icon={
                      integration.provider ? (
                        providerIcons[integration.provider]
                      ) : (
                        <Avatar
                          name={integration.name}
                          size="sm"
                          shape="rounded"
                          decorative
                        />
                      )
                    }
                    title={
                      <>
                        {integration.name}{' '}
                        <Badge tone={on ? 'success' : 'neutral'} size="sm" dot>
                          {on ? 'Connected' : 'Not connected'}
                        </Badge>
                      </>
                    }
                    description={integration.description}
                    action={
                      on ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            iconStart={<Settings2 />}
                          >
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            iconStart={<Unplug />}
                            onClick={() => toggle(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggle(integration.id)}
                        >
                          Connect
                        </Button>
                      )
                    }
                  />
                </li>
              )
            })}
          </Stack>
        </SettingsSection>
      ))}
    </SettingsPanel>
  )
}
