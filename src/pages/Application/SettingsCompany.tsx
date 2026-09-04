import { useId, useRef, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  CalendarClock,
  Globe,
  IdCard,
  Image as ImageIcon,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { Stack } from '../../components/Stack/Stack'
import { Switch } from '../../components/Switch/Switch'
import { Tag } from '../../components/Tag/Tag'
import { Text } from '../../components/Text/Text'
import { Textarea } from '../../components/Textarea/Textarea'
import { BookingEmbed } from './BookingEmbed'
import {
  PrefixInput,
  SettingsFooter,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
} from './SettingsPanel'
import { COMPANY, TEAM } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

interface Affiliation {
  id: string
  name: string
  role: string
  verified: boolean
  primary: boolean
}

const AFFILIATIONS: Affiliation[] = [
  {
    id: 'northwind',
    name: COMPANY.name,
    role: COMPANY.role,
    verified: true,
    primary: true,
  },
  {
    id: 'front-range',
    name: 'Front Range Collective',
    role: 'Advisor',
    verified: false,
    primary: false,
  },
]

/** The company card's main action — what a stranger's thumb lands on. */
const PRIMARY_CTAS = [
  {
    value: 'save',
    label: 'Save contact',
    description: 'Adds you to their address book.',
  },
  {
    value: 'book',
    label: 'Book a meeting',
    description: 'Opens your booking link.',
  },
  {
    value: 'contact',
    label: 'Contact me',
    description: 'Shows your contact options.',
  },
]

interface Purpose {
  id: string
  name: string
  /** `TeamMember` ids routed this purpose. */
  members: string[]
}

const PURPOSES: Purpose[] = [
  { id: 'sales', name: 'Sales', members: ['sam', 'prisha'] },
  { id: 'partnerships', name: 'Partnerships', members: ['alex'] },
]

/* ---- Contrast ----------------------------------------------------------- */

/** sRGB channel to its linear value, per WCAG's relative-luminance formula. */
const linear = (channel: number) => {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const luminance = (hex: string) => {
  const parsed = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim())
  if (!parsed) return 0
  const [red, green, blue] = parsed
    .slice(1)
    .map((part) => linear(Number.parseInt(part, 16)))
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/**
 * Black or white, whichever is legible on the colour someone picked.
 *
 * The one place in Deck where a foreground cannot be a token: the background
 * is a hex the user typed, and half the palette a company might choose needs
 * dark ink rather than light. Hard-coding white here is how a brand picker
 * ships a preview that fails contrast on warm colours — which is exactly the
 * mistake the preview exists to catch.
 */
const readableInk = (background: string) =>
  luminance(background) > 0.179 ? '#000000' : '#ffffff'

/* ---- Page --------------------------------------------------------------- */

/**
 * Company settings — the brand your business card wears.
 *
 * Everything here is shared: the logo, the colours and the cover are what
 * every teammate's business card inherits, which is why Profile links across
 * to this page rather than offering its own copy of them. One company, one
 * set of colours, or the team stops looking like a team.
 *
 * Affiliation comes first because it decides what the rest of the page is
 * about. Someone advising three companies has three of these, and the primary
 * one is the brand their business card carries.
 *
 * Verification is at the foot rather than beside the affiliation it describes:
 * it is a fact about the account, not a control, and putting it under the
 * settings it justifies means the page ends on why any of this is trusted.
 */
export function SettingsCompany() {
  const coverInputId = useId()
  const coverInput = useRef<HTMLInputElement>(null)

  const [affiliations, setAffiliations] = useState(AFFILIATIONS)
  const [name, setName] = useState(COMPANY.name)
  const [website, setWebsite] = useState(COMPANY.website)
  const [description, setDescription] = useState(COMPANY.description)
  const [linkedin, setLinkedin] = useState(COMPANY.linkedin)
  const [cover, setCover] = useState<string | null>(null)

  const [primary, setPrimary] = useState<string>(COMPANY.primary)
  const [accent, setAccent] = useState<string>(COMPANY.accent)

  const [role, setRole] = useState(COMPANY.role)
  const [department, setDepartment] = useState(COMPANY.department)
  const [workEmail, setWorkEmail] = useState(COMPANY.workEmail)

  const [showCompany, setShowCompany] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [showNameOnProfile, setShowNameOnProfile] = useState(false)
  const [showWorkEmail, setShowWorkEmail] = useState(false)
  const [primaryCta, setPrimaryCta] = useState('save')

  const [teamBooking, setTeamBooking] = useState(true)
  const [teamLabel, setTeamLabel] = useState('Book with team')
  const [teamLink, setTeamLink] = useState(
    `https://meetcard.io/${COMPANY.slug}/book/`,
  )
  const [purposes, setPurposes] = useState(PURPOSES)

  const branded =
    primary.toLowerCase() !== COMPANY.primary.toLowerCase() ||
    accent.toLowerCase() !== COMPANY.accent.toLowerCase()

  /* Team booking can only route to someone whose calendar is connected —
     an unrouted purpose would send a stranger to a page with no times on it. */
  const bookable = TEAM.filter((member) => member.calendar)

  function chooseCover(file: File | undefined) {
    if (!file) return
    // Released before it is replaced — an object URL pins the file in memory
    // until it is revoked.
    if (cover) URL.revokeObjectURL(cover)
    setCover(URL.createObjectURL(file))
  }

  const makePrimary = (id: string) =>
    setAffiliations((all) =>
      all.map((one) => ({ ...one, primary: one.id === id })),
    )

  const togglePurposeMember = (purposeId: string, memberId: string) =>
    setPurposes((all) =>
      all.map((purpose) =>
        purpose.id === purposeId
          ? {
              ...purpose,
              members: purpose.members.includes(memberId)
                ? purpose.members.filter((one) => one !== memberId)
                : [...purpose.members, memberId],
            }
          : purpose,
      ),
    )

  return (
    <SettingsPanel
      eyebrow="Company"
      icon={<Building2 />}
      title="Company settings"
      description="Manage your company affiliation and what appears on your company-affiliated MeetCard."
      footer={
        <SettingsFooter note="Changes apply to every teammate's business card." />
      }
    >
      <SettingsSection
        title="Company affiliation"
        description="The companies you can make a business card for. The primary one is the brand your card wears."
        divided={false}
        gap={12}
        actions={
          <Button size="sm" variant="secondary" iconStart={<Plus />}>
            Add another company
          </Button>
        }
      >
        <Stack as="ul" gap={8} className="settings__list">
          {affiliations.map((affiliation) => (
            <li key={affiliation.id}>
              <SettingsRow
                icon={
                  <Avatar
                    name={affiliation.name}
                    size="sm"
                    shape="rounded"
                    decorative
                  />
                }
                title={
                  <>
                    {affiliation.name}{' '}
                    {affiliation.primary ? (
                      <Badge tone="brand" size="sm">
                        Primary
                      </Badge>
                    ) : null}
                    <Badge
                      tone={affiliation.verified ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {affiliation.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </>
                }
                description={affiliation.role}
                action={
                  <>
                    {affiliation.primary ? null : (
                      <Button
                        size="sm"
                        variant="ghost"
                        iconStart={<Star />}
                        onClick={() => makePrimary(affiliation.id)}
                      >
                        Set as primary
                      </Button>
                    )}
                    <IconButton
                      label={`Edit your ${affiliation.name} affiliation`}
                      variant="ghost"
                      size="sm"
                      icon={<Pencil />}
                    />
                    <IconButton
                      label={`Remove your ${affiliation.name} affiliation`}
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 />}
                      disabled={affiliation.primary}
                      onClick={() =>
                        setAffiliations((all) =>
                          all.filter((one) => one.id !== affiliation.id),
                        )
                      }
                    />
                  </>
                }
              />
            </li>
          ))}
        </Stack>
      </SettingsSection>

      <SettingsSection title="Company information">
        <SettingsRow
          icon={<IdCard />}
          title="Logo"
          description="Full-colour mark for light backgrounds. Square PNG or SVG, at least 256×256."
          action={
            <Button size="sm" variant="secondary" iconStart={<Upload />}>
              Upload logo
            </Button>
          }
        />

        <SettingsRow
          icon={<ImageIcon />}
          title="Inverse logo"
          description="Light mark for dark mode and for sitting over the cover image."
          action={
            <Button size="sm" variant="secondary" iconStart={<Upload />}>
              Upload inverse
            </Button>
          }
        />

        <Stack gap={8}>
          <Text size="sm" weight="semibold" as="span">
            Cover image
          </Text>
          <Text size="xs" tone="muted">
            Landscape, 1400×800 or larger. Cropped to 7:4 on the back of your
            card — the same frame it lands in there, so what you compose is
            what people see.
          </Text>

          <div className="settings__cover">
            {cover ? (
              <img className="settings__cover-photo" src={cover} alt="" />
            ) : (
              <p className="settings__cover-empty">
                No cover yet. The company profile falls back to your brand
                colours.
              </p>
            )}
          </div>

          {/* A real `<input type="file">` with a label styled as a button,
              rather than a button that clicks a hidden input — the native
              control is already keyboard-operable and already announces
              itself. Same pattern as `AddEvent`'s cover. */}
          <Stack direction="row" gap={8} wrap align="center">
            <input
              ref={coverInput}
              id={coverInputId}
              type="file"
              accept="image/*"
              className="settings__file deck-visually-hidden"
              onChange={(changeEvent) =>
                chooseCover(changeEvent.target.files?.[0])
              }
            />
            <label
              htmlFor={coverInputId}
              className="deck-button deck-button--secondary deck-button--sm"
            >
              <span className="deck-button__icon" aria-hidden="true">
                <Upload />
              </span>
              {cover ? 'Replace cover' : 'Upload cover'}
            </label>
            {cover ? (
              <Button
                size="sm"
                variant="ghost"
                iconStart={<X />}
                onClick={() => {
                  URL.revokeObjectURL(cover)
                  setCover(null)
                  if (coverInput.current) coverInput.current.value = ''
                }}
              >
                Remove
              </Button>
            ) : null}
          </Stack>
        </Stack>

        <div className="settings__pair">
          <Input
            label="Company name"
            value={name}
            onChange={(changeEvent) => setName(changeEvent.target.value)}
          />
          <PrefixInput
            label="Website"
            prefix="https://"
            icon={<Globe />}
            value={website}
            onValueChange={setWebsite}
          />
        </div>

        <Textarea
          label="Description"
          rows={3}
          value={description}
          description="One line, shown on the company profile on the back of the card."
          onChange={(changeEvent) => setDescription(changeEvent.target.value)}
        />

        <PrefixInput
          label="LinkedIn"
          prefix="linkedin.com/"
          value={linkedin}
          onValueChange={setLinkedin}
        />
      </SettingsSection>

      <SettingsSection
        title="Brand colours"
        description="Used for buttons, highlights and accents on your company MeetCards. Defaults to MeetCard's own palette."
      >
        <div className="settings__pair">
          <Stack gap={8}>
            <Text size="sm" weight="semibold" as="span">
              Primary colour{' '}
              <Text size="xs" tone="muted" as="span">
                ·{' '}
                {primary.toLowerCase() === COMPANY.primary.toLowerCase()
                  ? COMPANY.primaryName
                  : 'Custom'}
              </Text>
            </Text>
            <div className="settings__swatch">
              <input
                type="color"
                className="settings__swatch-input"
                aria-label="Primary colour swatch"
                value={primary}
                onChange={(changeEvent) => setPrimary(changeEvent.target.value)}
              />
              <Input
                label="Primary colour hex value"
                hideLabel
                fieldClassName="settings__swatch-hex"
                value={primary}
                onChange={(changeEvent) => setPrimary(changeEvent.target.value)}
              />
            </div>
          </Stack>

          <Stack gap={8}>
            <Text size="sm" weight="semibold" as="span">
              Accent colour{' '}
              <Text size="xs" tone="muted" as="span">
                ·{' '}
                {accent.toLowerCase() === COMPANY.accent.toLowerCase()
                  ? COMPANY.accentName
                  : 'Custom'}
              </Text>
            </Text>
            <div className="settings__swatch">
              <input
                type="color"
                className="settings__swatch-input"
                aria-label="Accent colour swatch"
                value={accent}
                onChange={(changeEvent) => setAccent(changeEvent.target.value)}
              />
              <Input
                label="Accent colour hex value"
                hideLabel
                fieldClassName="settings__swatch-hex"
                value={accent}
                onChange={(changeEvent) => setAccent(changeEvent.target.value)}
              />
            </div>
          </Stack>
        </div>

        {/* The two colours doing the two jobs they will actually do, rather
            than as bare swatches — a hex code says nothing about whether the
            label on top of it can be read. */}
        <div className="settings__brand-preview">
          <Text size="xs" tone="muted" as="span">
            Preview
          </Text>
          <span
            className="settings__brand-chip"
            style={{ backgroundColor: primary, color: readableInk(primary) }}
          >
            Book a time
          </span>
          <span
            className="settings__brand-chip"
            style={{ backgroundColor: accent, color: readableInk(accent) }}
          >
            Save contact
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={!branded}
            onClick={() => {
              setPrimary(COMPANY.primary)
              setAccent(COMPANY.accent)
            }}
          >
            Reset to MeetCard defaults
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection title="My role">
        <div className="settings__pair">
          <Input
            label="Job title"
            value={role}
            onChange={(changeEvent) => setRole(changeEvent.target.value)}
          />
          <Input
            label="Department"
            value={department}
            onChange={(changeEvent) => setDepartment(changeEvent.target.value)}
          />
        </div>
        <Input
          label="Work email"
          type="email"
          iconStart={<Mail />}
          value={workEmail}
          description="Its domain is what verifies the affiliation."
          onChange={(changeEvent) => setWorkEmail(changeEvent.target.value)}
        />
      </SettingsSection>

      <SettingsSection
        title={name}
        description={`Choose what appears on your ${name} card.`}
        gap={12}
      >
        <div className="settings__band">
          <Switch
            label="Show company"
            description="Display your company name under your title."
            checked={showCompany}
            onChange={(changeEvent) =>
              setShowCompany(changeEvent.target.checked)
            }
          />
        </div>
        <div className="settings__band">
          <Switch
            label="Show company logo"
            description="Add the company logo to your card."
            checked={showLogo}
            onChange={(changeEvent) => setShowLogo(changeEvent.target.checked)}
          />
        </div>
        <div className="settings__band">
          <Switch
            label="Show the company name on the company profile"
            description="Useful when your logo isn't a wordmark. Off by default, to avoid saying the name twice."
            checked={showNameOnProfile}
            onChange={(changeEvent) =>
              setShowNameOnProfile(changeEvent.target.checked)
            }
          />
        </div>
        <div className="settings__band">
          <Switch
            label="Show work email"
            description="Reveal your work email to people you exchange with."
            checked={showWorkEmail}
            onChange={(changeEvent) =>
              setShowWorkEmail(changeEvent.target.checked)
            }
          />
        </div>

        <ChoiceGroup
          label="Primary call to action"
          description="The main action on your company card."
          variant="tile"
          columns={3}
          options={PRIMARY_CTAS}
          value={primaryCta}
          onChange={setPrimaryCta}
        />
      </SettingsSection>

      <SettingsSection
        title="Book with team"
        description="Route meeting requests to the right teammate by purpose."
        gap={12}
      >
        <div className="settings__band">
          <Switch
            label="Enable Book with team"
            description="Adds one shared booking button your teammates can put on their business cards."
            checked={teamBooking}
            onChange={(changeEvent) =>
              setTeamBooking(changeEvent.target.checked)
            }
          />
        </div>

        {teamBooking ? (
          <>
            <div className="settings__pair">
              <Input
                label="Button label"
                placeholder="Book with team"
                value={teamLabel}
                onChange={(changeEvent) => setTeamLabel(changeEvent.target.value)}
              />
              <Input
                label="Team booking link"
                type="url"
                placeholder="https://"
                value={teamLink}
                description="Members show this on their business card from their own profile settings."
                onChange={(changeEvent) => setTeamLink(changeEvent.target.value)}
              />
            </div>

            {/* The company's own identifier, the same one its share link
                carries — one company, one handle, wherever it is quoted. */}
            <BookingEmbed type="team" identifier={`@${COMPANY.slug}`} />

            <SettingsRow
              icon={<CalendarClock />}
              title="Team calendar connections"
              description="Team booking can only route to members whose calendar is enabled."
              action={
                <Badge
                  tone={bookable.length === TEAM.length ? 'success' : 'warning'}
                  size="sm"
                >
                  {bookable.length} of {TEAM.length}
                </Badge>
              }
            >
              <Stack as="ul" gap={8} className="settings__list">
                {TEAM.map((member) => (
                  <li key={member.id}>
                    <SettingsRow
                      title={member.name ?? member.email}
                      description={member.calendar ?? 'No calendar connected'}
                      action={
                        <Badge
                          tone={member.calendar ? 'success' : 'neutral'}
                          size="sm"
                          dot
                        >
                          {member.calendar ? 'Calendar enabled' : 'Not enabled'}
                        </Badge>
                      }
                    />
                  </li>
                ))}
              </Stack>
            </SettingsRow>

            {/*
              Purposes are what makes this different from one shared link: a
              visitor says what the meeting is for, and the routing picks
              somebody who can take it. Only members with a calendar are
              offered — routing to a teammate with no availability sends a
              stranger to an empty page.
            */}
            {purposes.map((purpose) => (
              <SettingsRow
                key={purpose.id}
                title={purpose.name}
                description={
                  purpose.members.length === 0
                    ? 'Nobody routed yet — this purpose will be hidden.'
                    : `Routed to ${purpose.members.length} ${
                        purpose.members.length === 1 ? 'person' : 'people'
                      }.`
                }
                action={
                  <IconButton
                    label={`Remove the ${purpose.name} purpose`}
                    variant="ghost"
                    size="sm"
                    icon={<X />}
                    onClick={() =>
                      setPurposes((all) =>
                        all.filter((one) => one.id !== purpose.id),
                      )
                    }
                  />
                }
              >
                <Stack direction="row" gap={6} wrap>
                  {bookable.map((member) => (
                    <Tag
                      key={member.id}
                      selected={purpose.members.includes(member.id)}
                      onToggle={() => togglePurposeMember(purpose.id, member.id)}
                    >
                      {member.name ?? member.email}
                    </Tag>
                  ))}
                </Stack>
              </SettingsRow>
            ))}

            <div>
              <Button
                size="sm"
                variant="secondary"
                iconStart={<Plus />}
                onClick={() =>
                  setPurposes((all) => [
                    ...all,
                    {
                      id: `purpose-${Date.now()}`,
                      name: 'New purpose',
                      members: [],
                    },
                  ])
                }
              >
                Add purpose
              </Button>
            </div>
          </>
        ) : null}
      </SettingsSection>

      <SettingsSection title="Verification" gap={12}>
        <SettingsRow
          icon={<BadgeCheck />}
          title={`${name} is verified`}
          description={`Your affiliation is confirmed by a work email on the ${
            workEmail.split('@')[1] ?? COMPANY.website
          } domain.`}
          action={
            <Badge tone="success" size="sm">
              <ShieldCheck aria-hidden="true" focusable="false" />
              Verified
            </Badge>
          }
        />
      </SettingsSection>
    </SettingsPanel>
  )
}
