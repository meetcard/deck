import type { FormEvent, ReactNode } from 'react'
import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { Divider } from '../../components/Divider/Divider'
import { Input } from '../../components/Input/Input'
import { Link } from '../../components/Link/Link'
import { PasswordInput } from '../../components/PasswordInput/PasswordInput'
import { Text } from '../../components/Text/Text'
import type { AuthProvider } from '../../components/ProviderButton'
import { AuthShell } from './AuthShell'
import { ProviderRow } from './ProviderRow'
import './AuthShell.css'

/** Four corner brackets — the universal "point the camera at this" glyph. */
const ScanIcon = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M2 5.5v-2a1.5 1.5 0 0 1 1.5-1.5h2M10.5 2h2A1.5 1.5 0 0 1 14 3.5v2M14 10.5v2a1.5 1.5 0 0 1-1.5 1.5h-2M5.5 14h-2A1.5 1.5 0 0 1 2 12.5v-2" />
  </svg>
)

export interface SignUpDetails {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface SignUpProps {
  /** Receives the submitted details. */
  onSubmit?: (details: SignUpDetails) => void
  /** Receives the chosen SSO connection. */
  onProviderSelect?: (provider: AuthProvider) => void
  /**
   * Starts the card-scanning path: capture a paper business card and read
   * the details off it. Omit it to hide the option entirely — on a device
   * with no camera it is not an option.
   */
  onScanCard?: () => void
  /** Shown above the form — a taken email address, a rejected password. */
  error?: ReactNode
  /** A submission is in flight: the form locks and the button says so. */
  pending?: boolean
  logInHref?: string
}

/**
 * Sign up — three ways onto MeetCard, in order of how much typing they cost.
 *
 * The form is the default because it always works. The providers are faster
 * for anyone who has one. And "Scan your card" is the one that belongs to
 * this product rather than to sign-up in general: MeetCard is a business-card
 * company, the person signing up is very likely holding a paper card with
 * their own name, title, company, and email already printed on it, and OCR
 * turns that into a filled form. It sits last not because it matters least
 * but because it is the unfamiliar one — it needs the two conventional
 * options above it to be legible as an alternative to them.
 *
 * Scanning starts a flow rather than completing one: it produces a
 * pre-filled form the person confirms, since OCR gets names wrong and a
 * misread email address is an account you can never recover.
 *
 * Presentational, like {@link LogIn} — Clerk will sit behind `onSubmit` and
 * `onProviderSelect`, and the scanner behind `onScanCard`.
 */
export function SignUp({
  onSubmit,
  onProviderSelect,
  onScanCard,
  error,
  pending = false,
  logInHref = '/log-in',
}: SignUpProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSubmit?.({
      firstName: String(data.get('firstName') ?? ''),
      lastName: String(data.get('lastName') ?? ''),
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    })
  }

  return (
    <AuthShell
      title="Create your account"
      footer={
        <Text size="sm">
          Already have an account? <Link href={logInHref}>Log In</Link>
        </Text>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {error ? <Banner tone="error">{error}</Banner> : null}

        <div className="auth-form__name-row">
          <Input
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            required
            disabled={pending}
          />
          <Input
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            required
            disabled={pending}
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          required
          disabled={pending}
        />

        {/* `new` is what asks a password manager to generate rather than
            fill — the difference between a strong password and a reused one. */}
        <PasswordInput
          label="Password"
          name="password"
          purpose="new"
          placeholder="••••••••"
          required
          disabled={pending}
        />

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? 'Creating your account…' : 'Sign up'}
        </Button>
      </form>

      <Divider label="OR" />

      <ProviderRow onSelect={onProviderSelect} disabled={pending} />

      {onScanCard ? (
        <>
          <Divider label="OR" />

          <Button
            variant="secondary"
            fullWidth
            iconStart={ScanIcon}
            disabled={pending}
            onClick={onScanCard}
          >
            Scan your card
          </Button>
        </>
      ) : null}
    </AuthShell>
  )
}
