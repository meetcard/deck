import type { ReactNode } from 'react'
import { Mark } from '../../foundations/brand/Mark'
import { Card } from '../../components/Card/Card'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import './AuthShell.css'

export interface AuthShellProps {
  /** The `h1`. One short line — "Welcome back", "Create your account". */
  title: string
  /** The form, and whatever sits beneath it. */
  children: ReactNode
  /** The line under the card body pointing at the other route in. */
  footer?: ReactNode
}

/**
 * The single card every account screen is built in.
 *
 * Deliberately not exported from Deck. It is a page layout, not a component:
 * one centred card with a lockup and an `h1`, which is the shape of sign-in,
 * sign-up, forgotten password, and the post-SSO steps that will follow. It
 * lives here so those screens share it without it becoming public API that
 * has to accommodate every product's idea of an auth page.
 *
 * It sits beside `AppShell` rather than inside it, and that is the point:
 * these are the screens you see before there is an app to be shelled. No
 * nav, no app bar, nothing to navigate to — one card, one task.
 *
 * The card is the widest thing on screen at 380px — deliberately narrow.
 * These forms are four fields at most, and a short measure is what makes a
 * page you are meant to leave quickly read as short.
 */
export function AuthShell({ title, children, footer }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <Card
        as="section"
        padding={24}
        elevation="sm"
        className="auth-shell__card"
      >
        <Stack gap={20}>
          <Stack gap={12} align="center">
            {/*
              Built from `Mark` plus real text rather than `Wordmark`. The
              wordmark sets "MeetCard" in Ink, which is a fixed brand colour
              — on the elevated card in dark mode the type all but vanishes,
              which its own documentation warns about. The mark is Signal
              Green in both themes and holds up; the name beside it is text,
              so it takes the surface's own colour and is selectable and
              searchable besides.
            */}
            <p className="auth-shell__lockup">
              <Mark className="auth-shell__mark" aria-hidden="true" />
              MeetCard
            </p>
            <Heading level={1} size="lg" className="auth-shell__title">
              {title}
            </Heading>
          </Stack>

          {children}
        </Stack>

        {footer ? <div className="auth-shell__footer">{footer}</div> : null}
      </Card>
    </main>
  )
}
