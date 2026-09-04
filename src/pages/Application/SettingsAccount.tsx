import { useState } from 'react'
import {
  Download,
  KeyRound,
  LogOut,
  Mail,
  Monitor,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  Unplug,
} from 'lucide-react'
import { Badge } from '../../components/Badge/Badge'
import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { PasswordInput } from '../../components/PasswordInput/PasswordInput'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Switch } from '../../components/Switch/Switch'
import { Text } from '../../components/Text/Text'
import { providerIcons } from '../../components/ProviderButton/providerIcons'
import type { AuthProvider } from '../../components/ProviderButton/ProviderButton'
import { SettingsPanel, SettingsRow, SettingsSection } from './SettingsPanel'
import { ACCOUNT } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

interface Provider {
  id: AuthProvider
  name: string
  /** The identity behind the connection, or what connecting would do. */
  detail: string
  connected: boolean
}

const PROVIDERS: Provider[] = [
  { id: 'google', name: 'Google', detail: 'alex.rivera@gmail.com', connected: true },
  { id: 'microsoft', name: 'Microsoft', detail: 'Sign in with Microsoft', connected: false },
  { id: 'linkedin', name: 'LinkedIn', detail: 'Sign in with LinkedIn', connected: false },
  { id: 'github', name: 'GitHub', detail: 'alexrivera', connected: true },
]

interface Session {
  id: string
  device: string
  location: string
  /** "This device" for the current one, otherwise how long ago. */
  seen: string
  current?: boolean
  icon: 'desktop' | 'phone' | 'tablet'
}

const SESSIONS: Session[] = [
  {
    id: 'macbook',
    device: 'MacBook Pro · Chrome',
    location: 'Boulder, Colorado',
    seen: 'This device',
    current: true,
    icon: 'desktop',
  },
  {
    id: 'iphone',
    device: 'iPhone 15 Pro · Safari',
    location: 'Boulder, Colorado',
    seen: '2 hours ago',
    icon: 'phone',
  },
  {
    id: 'ipad',
    device: 'iPad Air · Safari',
    location: 'Denver, Colorado',
    seen: 'Yesterday',
    icon: 'tablet',
  },
]

const SESSION_ICONS = {
  desktop: <Monitor />,
  phone: <Smartphone />,
  tablet: <Tablet />,
}

/* ---- Page --------------------------------------------------------------- */

/**
 * Account & security — the credentials, not the card.
 *
 * The split from Profile is the one people actually use: Profile is what
 * other people see, this is how you get in. Nothing here appears on a card.
 *
 * Ordered by how often it is touched and how much damage it does, which run
 * in opposite directions — email and password at the top, deleting the
 * account at the bottom behind a confirmation that makes you name what you
 * are destroying.
 *
 * Disconnecting the last sign-in provider while no password is set would lock
 * someone out of their own account, so the last connected provider says so
 * instead of offering the button.
 */
export function SettingsAccount() {
  const [email, setEmail] = useState(ACCOUNT.email)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordNote, setPasswordNote] = useState<string | null>(null)
  const [twoFactor, setTwoFactor] = useState(false)
  const [providers, setProviders] = useState(PROVIDERS)
  const [sessions, setSessions] = useState(SESSIONS)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const connectedCount = providers.filter((one) => one.connected).length
  const mismatch = next.length > 0 && confirm.length > 0 && next !== confirm
  const canUpdate =
    current.length > 0 && next.length > 0 && confirm.length > 0 && !mismatch

  function updatePassword() {
    if (!canUpdate) return
    setCurrent('')
    setNext('')
    setConfirm('')
    setPasswordNote('Password updated. Other sessions stay signed in.')
  }

  const toggleProvider = (id: AuthProvider) =>
    setProviders((all) =>
      all.map((one) =>
        one.id === id ? { ...one, connected: !one.connected } : one,
      ),
    )

  return (
    <SettingsPanel
      eyebrow="Account"
      icon={<KeyRound />}
      title="Account & security"
      description="Manage your sign-in credentials, connected providers, and security settings."
    >
      <SettingsSection title="Account" divided={false}>
        <Input
          label="Email"
          type="email"
          iconStart={<Mail />}
          value={email}
          description="Where sign-in links and receipts go. Not shown on your card."
          onChange={(changeEvent) => setEmail(changeEvent.target.value)}
        />

        <SettingsRow
          icon={<KeyRound />}
          title="Password"
          description="Set a password so you can sign in without a provider."
        >
          <Stack gap={16}>
            {passwordNote ? (
              <Banner
                tone="success"
                onDismiss={() => setPasswordNote(null)}
              >
                {passwordNote}
              </Banner>
            ) : null}

            <div className="settings__triple">
              <PasswordInput
                label="Current password"
                purpose="current"
                placeholder="••••••••"
                value={current}
                onChange={(changeEvent) => setCurrent(changeEvent.target.value)}
              />
              <PasswordInput
                label="New password"
                purpose="new"
                placeholder="••••••••"
                value={next}
                onChange={(changeEvent) => setNext(changeEvent.target.value)}
              />
              <PasswordInput
                label="Confirm password"
                purpose="new"
                placeholder="••••••••"
                value={confirm}
                error={mismatch ? 'This does not match the new password.' : undefined}
                onChange={(changeEvent) => setConfirm(changeEvent.target.value)}
              />
            </div>

            <div>
              <Button
                variant="secondary"
                disabled={!canUpdate}
                onClick={updatePassword}
              >
                Update password
              </Button>
            </div>
          </Stack>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Connected sign-in providers"
        description="Use these providers to sign in to your MeetCard account."
        gap={12}
      >
        <Stack as="ul" gap={8} className="settings__list">
          {providers.map((provider) => {
            /* Taking away the last way in is not a setting, it is a lockout.
               The row says why rather than offering a button that would. */
            const onlyWayIn = provider.connected && connectedCount === 1

            return (
              <li key={provider.id}>
                <SettingsRow
                  icon={providerIcons[provider.id]}
                  title={
                    <>
                      {provider.name}{' '}
                      <Badge
                        tone={provider.connected ? 'success' : 'neutral'}
                        size="sm"
                        dot
                      >
                        {provider.connected ? 'Connected' : 'Not connected'}
                      </Badge>
                    </>
                  }
                  description={
                    onlyWayIn
                      ? `${provider.detail} — your only way in, so it can't be disconnected.`
                      : provider.detail
                  }
                  action={
                    <Button
                      size="sm"
                      variant={provider.connected ? 'ghost' : 'secondary'}
                      disabled={onlyWayIn}
                      iconStart={provider.connected ? <Unplug /> : undefined}
                      onClick={() => toggleProvider(provider.id)}
                    >
                      {provider.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  }
                />
              </li>
            )
          })}
        </Stack>
      </SettingsSection>

      <SettingsSection title="Security" gap={12}>
        <div className="settings__band">
          <Switch
            label="Two-factor authentication"
            description="Add an extra layer of security with an authenticator app."
            checked={twoFactor}
            onChange={(changeEvent) => setTwoFactor(changeEvent.target.checked)}
          />
        </div>

        <SettingsRow
          icon={<ShieldCheck />}
          title="Active sessions"
          description="Everywhere you are currently signed in."
          action={
            <Button
              size="sm"
              variant="secondary"
              iconStart={<LogOut />}
              disabled={sessions.length === 1}
              onClick={() => setSessions((all) => all.filter((one) => one.current))}
            >
              Sign out other sessions
            </Button>
          }
        >
          <Stack as="ul" gap={8} className="settings__list">
            {sessions.map((session) => (
              <li key={session.id}>
                <SettingsRow
                  icon={SESSION_ICONS[session.icon]}
                  title={
                    <>
                      {session.device}{' '}
                      {session.current ? (
                        <Badge tone="brand" size="sm">
                          This device
                        </Badge>
                      ) : (
                        <Badge tone="neutral" size="sm">
                          {session.seen}
                        </Badge>
                      )}
                    </>
                  }
                  description={session.location}
                  action={
                    session.current ? undefined : (
                      <IconButton
                        label={`Sign out ${session.device}`}
                        variant="ghost"
                        size="sm"
                        icon={<LogOut />}
                        onClick={() =>
                          setSessions((all) =>
                            all.filter((one) => one.id !== session.id),
                          )
                        }
                      />
                    )
                  }
                />
              </li>
            ))}
          </Stack>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Data" gap={12}>
        <SettingsRow
          icon={<Download />}
          title="Export my data"
          description="Download a copy of your cards, connections, and notes as JSON."
          action={
            <Button size="sm" variant="secondary" iconStart={<Download />}>
              Export
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection title="Danger zone" gap={12}>
        <SettingsRow
          tone="danger"
          icon={<Trash2 />}
          title="Delete account"
          description="Permanently remove your account, cards, and all connections. This can be cancelled within 30 days, then it's gone forever."
          action={
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleting(true)}
            >
              Delete account
            </Button>
          }
        />
      </SettingsSection>

      {/*
        Typing the email is not friction for its own sake: this is the one
        control on the page that destroys other people's copies of your card
        too, and it is two clicks from a row you might have been skimming.
      */}
      <Sheet
        open={deleting}
        onClose={() => {
          setDeleting(false)
          setDeleteConfirm('')
        }}
        placement="center"
        title="Delete your account?"
        description={`Your cards stop resolving and your connections lose the copies they saved. You have 30 days to change your mind.`}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleting(false)
                setDeleteConfirm('')
              }}
            >
              Keep my account
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm.trim() !== email}
            >
              Delete account
            </Button>
          </>
        }
      >
        <Stack gap={12}>
          <Text size="sm" tone="muted">
            Type <strong>{email}</strong> to confirm.
          </Text>
          <Input
            label="Confirm your email"
            hideLabel
            type="email"
            placeholder={email}
            value={deleteConfirm}
            onChange={(changeEvent) => setDeleteConfirm(changeEvent.target.value)}
          />
        </Stack>
      </Sheet>
    </SettingsPanel>
  )
}
