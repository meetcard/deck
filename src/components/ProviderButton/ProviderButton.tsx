import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import type { ButtonSize } from '../Button/Button'
import { providerIcons } from './providerIcons'
import './ProviderButton.css'

/** The single sign-on connections MeetCard offers. */
export type AuthProvider = 'google' | 'microsoft' | 'linkedin' | 'github'

/** Display names, for the derived accessible name. */
const PROVIDER_NAMES: Record<AuthProvider, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  linkedin: 'LinkedIn',
  github: 'GitHub',
}

export interface ProviderButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  provider: AuthProvider
  /**
   * Visible text. Omit it for the compact square used in a provider row —
   * the button still announces "Continue with Google".
   */
  children?: ReactNode
  size?: ButtonSize
  fullWidth?: boolean
  /**
   * Accessible name, when the default ("Continue with Google") is wrong for
   * the context — connecting an account from Settings, say, rather than
   * signing in.
   */
  label?: string
}

/**
 * A single sign-on button, one per provider.
 *
 * Not `Button` with an icon, for two reasons. The vendors' marks are
 * multi-colour trademarks that must not be recoloured, so they cannot ride
 * on `currentColor` like every other icon in Deck. And the icon-only form
 * has an accessible name that must not be "Google" — a screen reader user
 * needs to hear what pressing it *does*, which is why `label` defaults to
 * "Continue with {Provider}" rather than the vendor's name.
 *
 * Presentational only. It takes `onClick` and knows nothing about the
 * identity provider behind it — wiring it to Clerk (or anything else) is the
 * application's job.
 *
 * @example
 * <Stack direction="row" gap={12} justify="center">
 *   <ProviderButton provider="google" onClick={() => signIn('google')} />
 *   <ProviderButton provider="linkedin" onClick={() => signIn('linkedin')} />
 * </Stack>
 *
 * @example
 * <ProviderButton provider="google" fullWidth>Continue with Google</ProviderButton>
 */
export const ProviderButton = forwardRef<
  HTMLButtonElement,
  ProviderButtonProps
>(function ProviderButton(
  {
    provider,
    children,
    size = 'md',
    fullWidth = false,
    label,
    type = 'button',
    className,
    ...props
  },
  ref,
) {
  const iconOnly = children === undefined
  const name = label ?? `Continue with ${PROVIDER_NAMES[provider]}`

  return (
    <button
      ref={ref}
      type={type}
      // With visible text the label would duplicate it, so it is only
      // applied where the mark is the whole button.
      aria-label={iconOnly || label ? name : undefined}
      className={cx(
        'deck-provider-button',
        `deck-provider-button--${size}`,
        iconOnly && 'deck-provider-button--icon-only',
        fullWidth && 'deck-provider-button--full-width',
        className,
      )}
      {...props}
    >
      <span className="deck-provider-button__icon" aria-hidden="true">
        {providerIcons[provider]}
      </span>
      {children}
    </button>
  )
})
