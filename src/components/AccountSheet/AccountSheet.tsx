import type { ReactNode } from 'react'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Sheet } from '../Sheet/Sheet'
import './AccountSheet.css'

/* Hand-drawn rather than imported, for the reason every glyph in here is:
   `src/components` ships in the published bundle and stays free of runtime
   dependencies. 1.5 is the house stroke at this 16 grid. */
const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** The fallback card glyph — an ID card, which is what a MeetCard is. */
const CardIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="1.5" y="3" width="13" height="10" rx="2" />
    <path d="M4.5 7.5h2M4.5 10h3M10 6.75h2.5M10 9.25h2.5" />
  </svg>
)

const ChevronIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="m6 3.5 4.5 4.5L6 12.5" />
  </svg>
)

/*
 * A hub and eight teeth rather than a toothed cog outline. At the 20px these
 * render, a real gear's teeth are sub-pixel and collapse into a blob — the
 * silhouette survives the size, the detail does not.
 *
 * The teeth start on the hub rather than clear of it. A gap there is what
 * turns the same eight strokes into an asterisk.
 */
const SettingsIcon = (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 5V1.7M8 11v3.3M5 8H1.7M11 8h3.3M5.88 5.88 3.55 3.55M10.12 10.12l2.33 2.33M10.12 5.88l2.33-2.33M5.88 10.12l-2.33 2.33" />
  </svg>
)

export interface AccountCard {
  /** Stable key, usually the card's route. */
  id: string
  /** What the card is called — "Personal card". */
  label: string
  /**
   * The card's public link, printed beneath the label —
   * `"meetcard.io/ben"`. This is the thing that actually distinguishes two
   * cards from each other, so it is shown rather than tucked away.
   */
  link?: string
  /** Route for the row. Without it the row is a button and calls `onSelectCard`. */
  href?: string
  /** Defaults to an ID-card glyph. */
  icon?: ReactNode
  /** The card handed over when nothing else is picked. */
  isDefault?: boolean
}

export interface AccountSheetProps {
  open: boolean
  onClose: () => void
  /** The signed-in person. */
  name: string
  /**
   * The dialog's accessible name, announced on open.
   *
   * "Account" rather than the person's name: a screen reader reads the
   * dialog's name and then its content, and naming it after the person makes
   * the first thing you hear a repeat of the second. This says what the
   * surface is, which is the part the name does not cover.
   */
  label?: string
  /** Public handle, shown under the name — `"/ben"`. */
  handle?: string
  /** Photo. Falls back to initials, as `Avatar` does everywhere. */
  avatarSrc?: string
  cards?: AccountCard[]
  onSelectCard?: (id: string) => void
  /** Heading over the card list. */
  cardsLabel?: string
  settingsLabel?: string
  /**
   * Where Settings goes — `"/settings/profile"` in the product, which opens
   * on the profile section rather than a settings index: this entry point
   * comes from a person's own face, so the section about them is the one
   * they meant.
   *
   * Deliberately undefaulted. Every row here follows one rule — a link when
   * it has a route, a button when it does not — and a row that invented an
   * `href` nobody had routed yet would be the one exception, which is how a
   * component starts shipping links that 404.
   */
  settingsHref?: string
  onSelectSettings?: () => void
  /**
   * Extra rows after Settings — signing out, switching account. Appended
   * inside the list, so pass `<li>`s.
   */
  children?: ReactNode
}

export interface AccountSheetRowProps {
  href?: string
  onClick?: () => void
  icon?: ReactNode
  label: ReactNode
  badge?: ReactNode
  /** The muted second line — a card's public link. */
  detail?: ReactNode
  /** Rows that lead somewhere with more behind it. */
  chevron?: boolean
}

/**
 * One destination in the account drawer. A link when it has a route and a
 * button when it does not, so a row that navigates is openable in a new tab
 * and a row that only calls back is not pretending to be an address.
 *
 * Exported so the `children` slot can add rows that match the ones above
 * them. Wrap it in an `<li>`.
 *
 * @example
 * <AccountSheet …>
 *   <li><AccountSheetRow label="Sign out" onClick={signOut} /></li>
 * </AccountSheet>
 */
export function AccountSheetRow({
  href,
  onClick,
  icon,
  label,
  badge,
  detail,
  chevron,
}: AccountSheetRowProps) {
  const content = (
    <>
      {/* Rendered even when empty. The slot holds its 20px either way, so a
          row without a glyph still lines its text up with the rows above it
          rather than stepping out to the wall. */}
      <span className="deck-account-sheet__row-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="deck-account-sheet__row-text">
        <span className="deck-account-sheet__row-label">
          <span className="deck-account-sheet__row-name">{label}</span>
          {badge}
        </span>
        {detail ? (
          <span className="deck-account-sheet__row-detail">{detail}</span>
        ) : null}
      </span>
      {chevron ? (
        <span className="deck-account-sheet__row-chevron" aria-hidden="true">
          {ChevronIcon}
        </span>
      ) : null}
    </>
  )

  return href ? (
    <a href={href} className="deck-account-sheet__row" onClick={onClick}>
      {content}
    </a>
  ) : (
    <button type="button" className="deck-account-sheet__row" onClick={onClick}>
      {content}
    </button>
  )
}

/**
 * The account drawer, opened from the avatar in the app bar.
 *
 * Answers "who am I signed in as, and what do I hand people" in one surface.
 * That pairing is the reason this is not a generic menu: the cards are not a
 * settings sub-page reached through a menu item, they are the account, and
 * showing them with their public links means the common question — *which of
 * these is the one I give out* — is answered without opening anything.
 *
 * A `side` drawer rather than a bottom sheet, at every width. It is a list of
 * destinations, and it hangs off a control in the top-right corner of the
 * bar; a panel that flew to the bottom of the screen would leave the thing
 * that opened it behind.
 *
 * The profile block is this sheet's visible header, so `Sheet`'s own title is
 * hidden — it survives as the dialog's accessible name and nothing more, and
 * the close control lifts into the corner beside the avatar.
 *
 * Deck has no router and no session. Every row takes an `href` from the
 * composition layer and falls back to a callback without one, so an app with
 * routing gets real links and a prototype without it gets working controls
 * rather than a drawer full of addresses that 404.
 *
 * @example
 * <AccountSheet
 *   open={open}
 *   onClose={close}
 *   name="Ben Ackles"
 *   handle="/ben"
 *   settingsHref="/settings/profile"
 *   cards={[{ id: 'personal', label: 'Personal card', link: 'meetcard.io/ben', href: '/cards/ben' }]}
 * />
 */
export function AccountSheet({
  open,
  onClose,
  name,
  label = 'Account',
  handle,
  avatarSrc,
  cards = [],
  onSelectCard,
  cardsLabel = 'My cards',
  settingsLabel = 'Settings',
  settingsHref,
  onSelectSettings,
  children,
}: AccountSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      placement="side"
      title={label}
      hideTitle
      className="deck-account-sheet"
    >
      <div className="deck-account-sheet__profile">
        {/* Decorative: the name is printed right beside it, and announcing it
            twice is how a two-line header becomes four. */}
        <Avatar name={name} src={avatarSrc} size="lg" decorative />
        <span className="deck-account-sheet__identity">
          <span className="deck-account-sheet__name">{name}</span>
          {handle ? (
            <span className="deck-account-sheet__handle">{handle}</span>
          ) : null}
        </span>
      </div>

      {/* Unlabelled: the dialog around it is already named, and a second
          "Account" on the landmark inside it names the same thing twice. */}
      <nav className="deck-account-sheet__nav">
        {cards.length > 0 ? (
          <div className="deck-account-sheet__section">
            <h3 className="deck-account-sheet__section-label">{cardsLabel}</h3>
            <ul className="deck-account-sheet__list">
              {cards.map((card) => (
                <li key={card.id}>
                  <AccountSheetRow
                    href={card.href}
                    onClick={() => onSelectCard?.(card.id)}
                    icon={card.icon ?? CardIcon}
                    label={card.label}
                    badge={
                      card.isDefault ? (
                        <Badge tone="brand" variant="solid" size="sm">
                          Default
                        </Badge>
                      ) : null
                    }
                    detail={card.link}
                    chevron
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="deck-account-sheet__section deck-account-sheet__section--plain">
          <ul className="deck-account-sheet__list">
            <li>
              {/* No chevron. The cards above lead into a card each; this is a
                  single destination, and a chevron on every row makes the
                  mark stop meaning anything. */}
              <AccountSheetRow
                href={settingsHref}
                onClick={onSelectSettings}
                icon={SettingsIcon}
                label={settingsLabel}
              />
            </li>
            {children}
          </ul>
        </div>
      </nav>
    </Sheet>
  )
}
