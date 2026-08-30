import { ProviderButton, type AuthProvider } from '../../components/ProviderButton'

/**
 * The connections MeetCard offers, in the order they appear.
 *
 * Google first because it is the overwhelming majority of sign-ins, then
 * LinkedIn — the one that matters most for a networking product, since it is
 * also where the profile data worth importing lives.
 */
const PROVIDERS: readonly AuthProvider[] = [
  'google',
  'linkedin',
  'microsoft',
  'github',
]

export interface ProviderRowProps {
  /** Called with the chosen provider. Wiring it to Clerk is the app's job. */
  onSelect?: (provider: AuthProvider) => void
  /** Disable the whole row while a redirect is in flight. */
  disabled?: boolean
  providers?: readonly AuthProvider[]
}

/**
 * The row of SSO buttons shared by sign-in and sign-up.
 *
 * Icon-only, because four labelled buttons would be four full-width rows and
 * would make the providers louder than the form they sit under. Each still
 * announces "Continue with …".
 */
export function ProviderRow({
  onSelect,
  disabled = false,
  providers = PROVIDERS,
}: ProviderRowProps) {
  return (
    <div className="auth-form__providers">
      {providers.map((provider) => (
        <ProviderButton
          key={provider}
          provider={provider}
          disabled={disabled}
          onClick={() => onSelect?.(provider)}
        />
      ))}
    </div>
  )
}
