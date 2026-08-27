import { useState, type ReactNode } from 'react'
import { Mark } from '../../foundations/brand'
import { AppBar } from '../../components/AppBar/AppBar'
import { Avatar } from '../../components/Avatar/Avatar'
import { BottomNav } from '../../components/BottomNav/BottomNav'
import type { BottomNavItemProps } from '../../components/BottomNav/BottomNav'
import { Button } from '../../components/Button/Button'
import { IconButton } from '../../components/IconButton/IconButton'
import { Sheet } from '../../components/Sheet/Sheet'
import './AppShell.css'

/* ---- Icons ------------------------------------------------------------ */

const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const HomeIcon = (
  <svg {...iconProps}>
    <path d="M2.5 7 8 2.5 13.5 7v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V7Z" />
  </svg>
)

const ConnectionsIcon = (
  <svg {...iconProps}>
    <circle cx="6" cy="5.5" r="2.5" />
    <path d="M1.5 13.5a4.5 4.5 0 0 1 9 0" />
    <path d="M11 3.2a2.5 2.5 0 0 1 0 4.6M12.5 13.5a4.5 4.5 0 0 0-2-3.7" />
  </svg>
)

const EventsIcon = (
  <svg {...iconProps}>
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
  </svg>
)

/* Sliders rather than a cog: at 16px a toothed gear's teeth collapse into a
   ring of dashes and read as a sun. Controls-on-a-track survives the size. */
const SettingsIcon = (
  <svg {...iconProps}>
    <path d="M2.5 5h11M2.5 11h11" />
    <circle cx="6" cy="5" r="1.7" />
    <circle cx="10" cy="11" r="1.7" />
  </svg>
)

const ExchangeIcon = (
  <svg {...iconProps}>
    <path d="M2.5 5.5h8M8.5 3 11 5.5 8.5 8M13.5 10.5h-8M7.5 8 5 10.5 7.5 13" />
  </svg>
)

const QrIcon = (
  <svg {...iconProps}>
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <path d="M9 9h2v2H9zM13 13h1M11.5 13.5h.01" />
  </svg>
)

const ScanIcon = (
  <svg {...iconProps}>
    <path d="M2 5.5V3a1 1 0 0 1 1-1h2.5M10.5 2H13a1 1 0 0 1 1 1v2.5M14 10.5V13a1 1 0 0 1-1 1h-2.5M5.5 14H3a1 1 0 0 1-1-1v-2.5" />
    <path d="M2 8h12" />
  </svg>
)

const PlusIcon = (
  <svg {...iconProps}>
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
)

/* ---- Destinations ------------------------------------------------------ */

/**
 * Four destinations, matching the app's bottom bar. Exchange is deliberately
 * absent: it is the elevated center action below, because it is something you
 * do rather than a place you go.
 *
 * Two destinations carry a terser label here than their page title, and only
 * here — the pages, their headings, and their Storybook entries are unchanged.
 * A slot gives 61px of label room at 375px wide, the tightest common phone.
 * "Connections" measures 68 and ellipsised to "Connecti…"; "Dashboard"
 * measures 59, clearing by 2px, which is one font tweak or one translation
 * from the same bug. The slots are `flex: 1`, so neither is something the
 * other labels or the destination count can fix — dropping to three
 * destinations buys a single pixel. "People" (37) and "Home" (32) both leave
 * real headroom, and "Home" is what the house icon was already saying.
 * A terser nav label than page title is ordinary; a truncated primary
 * destination is not.
 */
const DESTINATIONS: BottomNavItemProps[] = [
  { id: '/', label: 'Home', icon: HomeIcon, href: '/' },
  { id: '/connections', label: 'People', icon: ConnectionsIcon, href: '/connections' },
  { id: '/events', label: 'Events', icon: EventsIcon, href: '/events' },
  { id: '/settings', label: 'Settings', icon: SettingsIcon, href: '/settings' },
]

export interface AppShellProps {
  /** The screen rendered between the bar and the nav. */
  children?: ReactNode
  /** Which destination is active. Matches a `BottomNavItemProps['id']`. */
  currentId?: string
  /** Shown in the bar when the mark alone isn't enough context. */
  title?: ReactNode
  /** The signed-in person, for the account avatar. */
  accountName?: string
}

/**
 * The persistent shell every authenticated screen renders inside.
 *
 * Composes the two halves of the app frame — `AppBar` at the top for brand
 * and account access, `BottomNav` at the bottom for the four destinations —
 * around a scrolling content slot. Pages supply only their own content and
 * say which destination they sit under; the frame is identical everywhere,
 * which is what makes it read as one app rather than a set of screens.
 *
 * Exchange is the elevated center action rather than a fifth destination,
 * and it opens a `Sheet` instead of navigating. That follows both components'
 * stated intent: `BottomNav` describes the center slot as "the thing you do,"
 * and `Sheet` calls itself "the home of the Exchange action." Keeping it modal
 * means the exchange happens without losing the screen behind it — you are
 * mid-conversation when you reach for it.
 *
 * Mobile-first, matching the installed PWA this documents. A desktop side rail
 * is a separate composition and is not attempted here.
 *
 * @example
 * <AppShell currentId="/connections" title="Connections">
 *   <Connections />
 * </AppShell>
 */
export function AppShell({
  children,
  currentId = '/',
  title,
  accountName = 'Alex Rivera',
}: AppShellProps) {
  const [exchangeOpen, setExchangeOpen] = useState(false)

  return (
    <div className="app-shell">
      <AppBar
        sticky
        className="app-shell__bar"
        brand={<Mark style={{ height: 24, width: 24 }} />}
        title={title}
        actions={
          <IconButton
            label="Me"
            variant="ghost"
            icon={<Avatar name={accountName} size="xs" decorative />}
          />
        }
      />

      <main className="app-shell__content">{children}</main>

      <BottomNav
        className="app-shell__nav"
        items={DESTINATIONS}
        currentId={currentId}
        centerAction={{
          label: 'Exchange',
          icon: ExchangeIcon,
          onClick: () => setExchangeOpen(true),
        }}
      />

      {/* The three ways to trade a card, in the order you'd reach for them:
          showing yours is the common case, scanning is the reply, and typing
          it in by hand is the fallback when neither phone cooperates. */}
      <Sheet
        open={exchangeOpen}
        onClose={() => setExchangeOpen(false)}
        title="Exchange"
        description="Share your card or capture someone else's."
      >
        <div className="app-shell__exchange">
          <Button fullWidth iconStart={QrIcon}>
            Show my card
          </Button>
          <Button fullWidth variant="secondary" iconStart={ScanIcon}>
            Scan a card
          </Button>
          <Button fullWidth variant="ghost" iconStart={PlusIcon}>
            Add manually
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
