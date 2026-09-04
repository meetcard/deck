import type { ReactNode } from 'react'
import { Avatar } from '../Avatar/Avatar'
import type { CardShare } from './ShareFace'
import { GlobeIcon, LinkedInIcon, PinIcon, QrCodeIcon } from './cardIcons'

export interface CardCompanyPerson {
  name: string
  avatarSrc?: string
}

/**
 * The company behind the card.
 *
 * Reached from the company's name on the person's card, and it is the same
 * card turned rather than a page you navigate to — which is the point. You
 * looked at someone's card and wondered who they work for; you should not
 * have to leave the card you were holding to find out.
 */
export interface CardCompanyProfile {
  name: string
  /** The company's mark, set at the top of the card. */
  logoSrc?: string
  /** What the company says it does, in one line. */
  headline: string
  /** A sentence or two beneath. Clamped to three lines. */
  description?: ReactNode
  /** Shown as a chip, e.g. `"meetcard.io"`. */
  website?: string
  /** Shown as a chip, e.g. `"Boulder, CO"`. */
  location?: string
  linkedInHref?: string
  /** The faces you would recognise — the first few, then a count. */
  people?: CardCompanyPerson[]
  /** How many people there are in total, if more than `people` lists. */
  peopleTotal?: number
  /** The company's own link. Omit to leave the company unshareable. */
  share?: CardShare
}

export function CompanyFace({
  profile,
  onShare,
}: {
  profile: CardCompanyProfile
  onShare?: () => void
}) {
  const shown = profile.people ?? []
  const overflow = Math.max((profile.peopleTotal ?? shown.length) - shown.length, 0)

  return (
    <div className="deck-person-card__company">
      {profile.logoSrc ? (
        <img
          className="deck-person-card__logo deck-person-card__company-logo"
          src={profile.logoSrc}
          alt={profile.name}
        />
      ) : (
        <p className="deck-person-card__company-name">{profile.name}</p>
      )}

      <div className="deck-person-card__company-body">
        <span className="deck-person-card__eyebrow">Company profile</span>
        {/* `h3`, the same level the person's name takes on the other face.
            This is the card's own heading whichever face is showing, and a
            level below it would skip one wherever the page's is an `h2`. */}
        <h3 className="deck-person-card__company-headline">{profile.headline}</h3>
        {profile.description ? (
          <p className="deck-person-card__company-description">
            {profile.description}
          </p>
        ) : null}

        <div className="deck-person-card__company-meta">
          {profile.website ? (
            <span className="deck-person-card__chip">
              <GlobeIcon />
              {profile.website}
            </span>
          ) : null}
          {profile.location ? (
            <span className="deck-person-card__chip">
              <PinIcon />
              {profile.location}
            </span>
          ) : null}
          {profile.linkedInHref ? (
            <a
              className="deck-person-card__chip deck-person-card__chip--icon"
              href={profile.linkedInHref}
            >
              <LinkedInIcon />
              <span className="deck-visually-hidden">
                {profile.name} on LinkedIn
              </span>
            </a>
          ) : null}
          {profile.share && onShare ? (
            <button
              type="button"
              className="deck-person-card__chip deck-person-card__chip--action"
              onClick={onShare}
            >
              <QrCodeIcon />
              Share
            </button>
          ) : null}

          {shown.length > 0 ? (
            /* A list, because that is what it is: the people at this company
               you would recognise. The overflow count is inside it rather
               than beside it, so a screen reader hears "and 9 more" as part
               of the same list instead of as a stray number. */
            <ul className="deck-person-card__people">
              {shown.map((person) => (
                <li key={person.name}>
                  <Avatar name={person.name} src={person.avatarSrc} size="sm" />
                </li>
              ))}
              {overflow > 0 ? (
                <li className="deck-person-card__people-more">+{overflow}</li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
