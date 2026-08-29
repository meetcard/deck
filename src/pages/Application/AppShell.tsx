import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeftRight,
  Briefcase,
  Calendar,
  House,
  IdCard,
  Plus,
  QrCode,
  ScanLine,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Wordmark } from '../../foundations/brand'
import { AccountSheet } from '../../components/AccountSheet/AccountSheet'
import type { AccountCard } from '../../components/AccountSheet/AccountSheet'
import { AppBar } from '../../components/AppBar/AppBar'
import { Avatar } from '../../components/Avatar/Avatar'
import { BottomNav } from '../../components/BottomNav/BottomNav'
import type { BottomNavItemProps } from '../../components/BottomNav/BottomNav'
import { Button } from '../../components/Button/Button'
import { IconButton } from '../../components/IconButton/IconButton'
import { Sheet } from '../../components/Sheet/Sheet'
import { SideNav } from '../../components/SideNav/SideNav'
import './AppShell.css'

/* ---- Icons ------------------------------------------------------------ */

/**
 * Icons come from `lucide-react` here, not hand-drawn inline as they are
 * inside `src/components`. That split is deliberate and load-bearing:
 * components accept `icon: ReactNode` and import no icon set, which is what
 * keeps `dist/deck.js` free of runtime dependencies. Composition layers like
 * this one are not published, so they can use a library.
 *
 * Weight carries the active state, not just colour. lucide draws on a 24
 * grid, so at the 20-22px these render the stroke lands near 1.5px at rest
 * and near 1.9px active — a step you can see without reading the label.
 */
const icon = (Glyph: LucideIcon, active = false) => (
  <Glyph strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" focusable="false" />
)

/* ---- Destinations ------------------------------------------------------ */

/**
 * The two navigations carry different destinations on purpose — they are not
 * one list rendered two ways.
 *
 * The rail leads with managing what you own: your cards, then the people and
 * events behind them. Exchange is absent, because trading cards is a thing
 * you do with a phone in your hand in front of someone, not at a desk.
 *
 * The bar inverts that. Exchange takes the elevated center slot as the
 * product's highest-frequency moment, and "My cards" gives up its place to
 * make room — editing how you present yourself is desk work.
 *
 * Settings appears in both, but only the rail separates it: the bar has five
 * peers, the rail pins it to the foot as the low-frequency destination it is.
 */
const useDestinations = (currentId: string) =>
  useMemo(() => {
    const a = (id: string) => id === currentId

    const dashboard = { id: '/', label: 'Dashboard', href: '/' }
    const connections = { id: '/connections', label: 'Connections', href: '/connections' }
    const events = { id: '/events', label: 'Events', href: '/events' }
    const settings = { id: '/settings', label: 'Settings', href: '/settings' }

    return {
      rail: [
        { ...dashboard, icon: icon(House, a('/')) },
        { id: '/cards', label: 'My cards', href: '/cards', icon: icon(IdCard, a('/cards')) },
        { ...connections, icon: icon(Users, a('/connections')) },
        { ...events, icon: icon(Calendar, a('/events')) },
      ],
      railFooter: [{ ...settings, icon: icon(Settings, a('/settings')) }],
      bar: [
        { ...dashboard, icon: icon(House, a('/')) },
        { ...connections, icon: icon(Users, a('/connections')) },
        { ...events, icon: icon(Calendar, a('/events')) },
        { ...settings, icon: icon(Settings, a('/settings')) },
      ] satisfies BottomNavItemProps[],
    }
  }, [currentId])

/**
 * The signed-in person's cards, as the account drawer lists them.
 *
 * Alex Rivera and these two slugs are the same fixture `MyCards` seeds from —
 * the shell and the page it frames should not disagree about who is signed
 * in. Deck has no data layer; a real app passes its own.
 *
 * No `href`s, for the reason `MyCards` gives about the same two cards: the
 * product routes to `/cards/<slug>` and there is no such route here, so a
 * dead link is worse than a working control. `AccountSheet` renders a row
 * without a route as a button, so what ships is a button rather than an
 * address that 404s. The nav's own `href`s stay — a destination is a link,
 * and demoting those to buttons would trade a prototype wart for an
 * accessibility one.
 */
const ACCOUNT_CARDS: AccountCard[] = [
  {
    id: 'personal',
    label: 'Personal card',
    link: 'meetcard.io/alex',
    icon: icon(IdCard),
  },
  {
    id: 'business',
    label: 'Business card',
    link: 'meetcard.io/alex@northwind',
    icon: icon(Briefcase),
    isDefault: true,
  },
]

export interface AppShellProps {
  /** The screen rendered between the bar and the nav. */
  children?: ReactNode
  /** Which destination is active. Matches a `BottomNavItemProps['id']`. */
  currentId?: string
  /** The signed-in person, for the account avatar. */
  accountName?: string
  /** Public handle, shown under the name in the account drawer. */
  accountHandle?: string
  /** The cards the account drawer offers. */
  accountCards?: AccountCard[]
  /** Opens the account drawer on mount, for stories. */
  accountOpen?: boolean
}

/**
 * The persistent shell every authenticated screen renders inside.
 *
 * Composes `AppBar` at the top with one of two navigations beneath it: the
 * `SideNav` rail from `md` (768px) up, the `BottomNav` bar below. Only one is
 * ever rendered visibly — the other is `display: none` and so is out of the
 * accessibility tree too — and the swap is pure CSS, so there is no viewport
 * JS to disagree with the server about.
 *
 * The two navigations are not the same list at two sizes. The rail carries
 * "My cards" and no Exchange; the bar carries Exchange and no "My cards".
 * See `useDestinations` for why. That means the shell's navigation changes
 * *content*, not just arrangement, at the breakpoint — unusual, and worth
 * knowing before adding a destination to one and not the other.
 *
 * A consequence worth stating plainly: **Exchange has no desktop entry
 * point.** The center action is the only way into the sheet, and it exists
 * only in the bar. That mirrors the product's own model, where exchanging is
 * an in-person moment, and the desktop path is expected to come from page
 * content — Dashboard's "Share via QR" — rather than from the frame. If that
 * turns out to be wrong, an `AppBar` action is the place to fix it.
 *
 * The layout is a grid in both modes rather than a fixed rail with a
 * hard-coded top offset: the bar spans row one, so the rail begins exactly
 * where the bar ends whatever the bar's height turns out to be with a notch,
 * a longer title, or a second line.
 *
 * @example
 * <AppShell currentId="/connections">
 *   <Connections />
 * </AppShell>
 */
export function AppShell({
  children,
  currentId = '/',
  accountName = 'Alex Rivera',
  accountHandle = '/alex',
  accountCards = ACCOUNT_CARDS,
  accountOpen = false,
}: AppShellProps) {
  const [exchangeOpen, setExchangeOpen] = useState(false)
  const [accountSheetOpen, setAccountSheetOpen] = useState(accountOpen)
  const destinations = useDestinations(currentId)

  return (
    <div className="app-shell">
      {/*
        The full lockup rather than the mark alone, and a link home rather than
        an ornament — the logo in a product's bar is the way back to the start,
        and people try it. No page title beside it: every screen carries its
        own heading, and repeating it in the bar spends the one piece of
        chrome that is on screen at all times saying something already said.
      */}
      <AppBar
        sticky
        className="app-shell__bar"
        brand={
          <a className="app-shell__home" href="/" aria-label="MeetCard home">
            <Wordmark aria-hidden="true" />
          </a>
        }
        actions={
          <IconButton
            label="Account"
            variant="ghost"
            size="sm"
            aria-expanded={accountSheetOpen}
            onClick={() => setAccountSheetOpen(true)}
            icon={<Avatar name={accountName} size="sm" decorative />}
          />
        }
      />

      <SideNav
        className="app-shell__side"
        items={destinations.rail}
        footerItems={destinations.railFooter}
        currentId={currentId}
      />

      <main className="app-shell__content">{children}</main>

      <BottomNav
        className="app-shell__nav"
        items={destinations.bar}
        currentId={currentId}
        centerAction={{
          label: 'Exchange',
          icon: icon(ArrowLeftRight),
          onClick: () => setExchangeOpen(true),
        }}
      />

      {/*
        The avatar's drawer. It hangs off the bar's own control, so it comes
        in from that edge rather than up from the bottom — and it is the only
        entry point to "My cards" the bar has, since the bar gives that slot
        up to Exchange. On a phone this is the way to your own cards.
      */}
      {/*
        Selecting a row closes the drawer and nothing else. The shell frames a
        screen it is handed as `children` — it does not choose one — so there
        is no honest way for it to go anywhere from here without a router.
        Dismissing is the part it can actually do, and a control that does the
        one true thing beats a link that does nothing.

        `settingsHref` is left unset for the same reason, which makes Settings
        a button here. Pass the product's `/settings/profile` once routing
        exists and it becomes a link with no other change.
      */}
      <AccountSheet
        open={accountSheetOpen}
        onClose={() => setAccountSheetOpen(false)}
        name={accountName}
        handle={accountHandle}
        cards={accountCards}
        onSelectCard={() => setAccountSheetOpen(false)}
        onSelectSettings={() => setAccountSheetOpen(false)}
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
          <Button fullWidth iconStart={icon(QrCode)}>
            Show my card
          </Button>
          <Button fullWidth variant="secondary" iconStart={icon(ScanLine)}>
            Scan a card
          </Button>
          <Button fullWidth variant="ghost" iconStart={icon(Plus)}>
            Add manually
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
