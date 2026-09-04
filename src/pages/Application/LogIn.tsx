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

export interface LogInProps {
  /** Receives the submitted credentials. */
  onSubmit?: (credentials: { email: string; password: string }) => void
  /** Receives the chosen SSO connection. */
  onProviderSelect?: (provider: AuthProvider) => void
  /** Shown above the form — a failed attempt, a locked account. */
  error?: ReactNode
  /** A submission is in flight: the form locks and the button says so. */
  pending?: boolean
  forgotPasswordHref?: string
  signUpHref?: string
}

/**
 * Log in — the email/password form and the SSO connections beside it.
 *
 * Presentational. It holds no credentials and talks to no identity provider:
 * `onSubmit` hands you the two values, `onProviderSelect` hands you the
 * chosen connection, and the application decides what that means. Clerk is
 * what will sit behind those callbacks, and keeping the boundary here means
 * the screen can be built, reviewed, and visually tested without it.
 *
 * The form is uncontrolled and read from `FormData` on submit. That is not
 * laziness: a controlled password field re-renders the page on every
 * keystroke and puts the plaintext in React state, and there is nothing on
 * this screen that needs to react to a half-typed password.
 *
 * Email is the first field and the primary path; the providers sit under an
 * "OR", below the fold of attention rather than above it, because a returning
 * user who signed up with a password should not have to read past four logos
 * to find the form they want.
 */
export function LogIn({
  onSubmit,
  onProviderSelect,
  error,
  pending = false,
  forgotPasswordHref = '/forgot-password',
  signUpHref = '/sign-up',
}: LogInProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onSubmit?.({
      email: String(data.get('email') ?? ''),
      password: String(data.get('password') ?? ''),
    })
  }

  return (
    <AuthShell
      title="Welcome back"
      footer={
        <Text size="sm">
          Don't have an account? <Link href={signUpHref}>Sign Up</Link>
        </Text>
      }
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        {/* Banner's error tone carries `role="alert"`, so a failed attempt
            is announced rather than only appearing. */}
        {error ? <Banner tone="error">{error}</Banner> : null}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com"
          required
          disabled={pending}
        />

        <PasswordInput
          label="Password"
          name="password"
          purpose="current"
          placeholder="••••••••"
          required
          disabled={pending}
        />

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </Button>

        <div className="auth-form__aside">
          <Link href={forgotPasswordHref}>Forgot password?</Link>
        </div>
      </form>

      <Divider label="OR" />

      <ProviderRow onSelect={onProviderSelect} disabled={pending} />
    </AuthShell>
  )
}
