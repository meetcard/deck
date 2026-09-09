import { useState } from 'react'
import { Globe, KeyRound, Laptop, Mail, Smartphone, Tablet } from 'lucide-react'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { Heading } from '../../../components/Heading/Heading'
import { Input } from '../../../components/Input/Input'
import { IntegrationRow } from '../../../components/IntegrationRow/IntegrationRow'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    logo: <Globe />,
    account: 'ben@gmail.com',
    connected: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    logo: <Mail />,
    account: 'Sign in with Microsoft',
    connected: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    logo: <Globe />,
    account: 'Sign in with LinkedIn',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    logo: <KeyRound />,
    account: 'benackles',
    connected: true,
  },
]

const SESSIONS = [
  {
    id: 'macbook',
    device: 'MacBook Pro · Chrome',
    when: 'This device',
    place: 'Boulder, Colorado',
    icon: <Laptop />,
    current: true,
  },
  {
    id: 'iphone',
    device: 'iPhone 15 Pro · Safari',
    when: '2 hours ago',
    place: 'Boulder, Colorado',
    icon: <Smartphone />,
    current: false,
  },
  {
    id: 'ipad',
    device: 'iPad Air · Safari',
    when: 'Yesterday',
    place: 'Denver, Colorado',
    icon: <Tablet />,
    current: false,
  },
]

/**
 * Sign-in, providers, sessions, and the two doors out — export and delete.
 *
 * Deletion is last and in its own card because it is the one control on this
 * screen that cannot be undone by doing the opposite. It says the recovery
 * window out loud rather than hiding it behind a confirmation dialog, so the
 * consequence is readable before the click rather than after it.
 */
export function Account() {
  const [connected, setConnected] = useState(
    () => new Set(PROVIDERS.filter((p) => p.connected).map((p) => p.id)),
  )
  const [sessions, setSessions] = useState(SESSIONS)
  const [twoFactor, setTwoFactor] = useState(false)

  const toggle = (id: string) =>
    setConnected((all) => {
      const next = new Set(all)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <SettingsPanel
      eyebrow="Account"
      title="Account & security"
      description="Manage your sign-in credentials, connected providers, and security settings."
    >
      <Stack gap={24}>
        <SettingsGroup title="Account">
          <div className="settings__form">
            <Input
              label="Email"
              id="account-email"
              type="email"
              defaultValue="ben@meetcard.io"
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Password"
          description="Changing your password signs you out everywhere else."
        >
          <div className="settings__form">
            <Input
              label="Current password"
              id="account-current"
              type="password"
              autoComplete="current-password"
            />
            <Input
              label="New password"
              id="account-new"
              type="password"
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              id="account-confirm"
              type="password"
              autoComplete="new-password"
            />
            <div>
              <Button variant="secondary">Update password</Button>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Connected sign-in providers"
          description="Use these providers to sign in to your MeetCard account."
        >
          {PROVIDERS.map((provider) => {
            const isOn = connected.has(provider.id)
            return (
              <IntegrationRow
                key={provider.id}
                name={provider.name}
                logo={provider.logo}
                account={isOn ? provider.account : undefined}
                description={isOn ? undefined : provider.account}
                status={isOn ? 'connected' : 'disconnected'}
                actions={
                  <Button
                    size="sm"
                    variant={isOn ? 'ghost' : 'secondary'}
                    onClick={() => toggle(provider.id)}
                  >
                    <span className="deck-visually-hidden">
                      {isOn
                        ? `Disconnect ${provider.name}`
                        : `Connect ${provider.name}`}
                    </span>
                    <span aria-hidden="true">
                      {isOn ? 'Disconnect' : 'Connect'}
                    </span>
                  </Button>
                }
              />
            )
          })}
        </SettingsGroup>

        <SettingsGroup title="Security">
          <SettingRow
            title="Two-factor authentication"
            description="Add an extra layer of security with an authenticator app."
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
          />
        </SettingsGroup>

        <SettingsGroup
          title="Active sessions"
          action={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSessions((all) => all.filter((s) => s.current))}
            >
              Sign out other sessions
            </Button>
          }
        >
          {sessions.map((session) => (
            <IntegrationRow
              key={session.id}
              name={session.device}
              logo={session.icon}
              status={session.current ? 'connected' : 'disconnected'}
              statusLabel={session.current ? 'This device' : session.when}
              description={session.place}
              actions={
                session.current ? undefined : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setSessions((all) =>
                        all.filter((s) => s.id !== session.id),
                      )
                    }
                  >
                    <span className="deck-visually-hidden">
                      Sign out {session.device}
                    </span>
                    <span aria-hidden="true">Sign out</span>
                  </Button>
                )
              }
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Data">
          <SettingRow
            title="Export my data"
            description="Download a copy of your cards, connections, and notes as JSON."
            control={
              <Button variant="secondary" size="sm">
                Export
              </Button>
            }
          />
        </SettingsGroup>

        {/* Its own card with its own border, because everything above is
            reversible and this is not. */}
        <section className="settings__group">
          <Heading level={3} size="xs" className="settings__group-title">
            Danger zone
          </Heading>
          <Card className="settings__danger">
            <Stack gap={12}>
              <Stack gap={2}>
                <Text weight="medium">Delete account</Text>
                <Text size="sm" tone="muted">
                  Permanently remove your account, cards, and all connections.
                  This can be cancelled within 30 days, then it's gone forever.
                </Text>
              </Stack>
              <div>
                <Button variant="destructive">Delete account</Button>
              </div>
            </Stack>
          </Card>
        </section>
      </Stack>
    </SettingsPanel>
  )
}
