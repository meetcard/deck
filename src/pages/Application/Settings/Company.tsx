import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Building2, Plus } from 'lucide-react'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { ChoiceGroup } from '../../../components/ChoiceGroup/ChoiceGroup'
import { CodeSnippet } from '../../../components/CodeSnippet/CodeSnippet'
import { ColorField } from '../../../components/ColorField/ColorField'
import { ImageUpload } from '../../../components/ImageUpload/ImageUpload'
import { Input } from '../../../components/Input/Input'
import { IntegrationRow } from '../../../components/IntegrationRow/IntegrationRow'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { Textarea } from '../../../components/Textarea/Textarea'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

/* MeetCard's own brand, which a company's colours start as and reset to. */
const DEFAULT_PRIMARY = '#2E6E5B'
const DEFAULT_ACCENT = '#C66A4A'

/** One channel of a hex, linearised the way WCAG's luminance formula wants. */
function channel(value: number): number {
  const srgb = value / 255
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
}

/** Relative luminance of `#rrggbb`, or `null` if that is not what it is. */
function luminance(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match) return null
  const int = parseInt(match[1], 16)
  return (
    0.2126 * channel((int >> 16) & 255) +
    0.7152 * channel((int >> 8) & 255) +
    0.0722 * channel(int & 255)
  )
}

/**
 * Which of two fixed on-colours to put on a company's brand fill.
 *
 * `--deck-color-solid-on` cannot answer this. It flips with the page's
 * scheme — light fills take dark text in dark mode — and a company's brand
 * colour does not flip with anything: it is the same green at midnight. So
 * the choice is made from the fill's own luminance, against the two
 * scheme-independent on-colours the cover tokens already define.
 *
 * A brand colour is whatever the company says it is, so this can still land
 * on a pair that reads poorly. It picks the better of the two rather than
 * pretending there is always a good one.
 */
function onBrandColor(hex: string): string {
  const fill = luminance(hex)
  if (fill === null) return 'var(--deck-color-cover-on)'

  const contrast = (a: number, b: number) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

  /* The two candidates are the scrim tokens' own values: ink and paper,
     which are fixed in both schemes precisely because the thing under them
     is not the page. */
  const ink = luminance('#1a1a1a') as number
  const paper = luminance('#faf8f4') as number

  return contrast(fill, ink) >= contrast(fill, paper)
    ? 'var(--deck-color-cover-scrim)'
    : 'var(--deck-color-cover-on)'
}

const AFFILIATIONS = [
  {
    id: 'meetcard',
    name: 'MeetCard',
    role: 'Founder & Head of Product',
    primary: true,
    verified: true,
  },
  {
    id: 'northline',
    name: 'Northline Labs',
    role: 'Advisor',
    primary: false,
    verified: false,
  },
]

const CALENDARS = [
  { name: 'Ben Ackles', provider: 'Google Calendar', enabled: true },
  { name: 'Dana Whitfield', provider: 'Outlook Calendar', enabled: true },
  { name: 'Marcus Lee', provider: 'Google Calendar', enabled: true },
  { name: 'Priya Raman', provider: 'No calendar connected', enabled: false },
]

const TEAM_EMBED = `<script src="https://cdn.meetcard.io/embed.js" async></script>
<meetcard-book type="team" company="@meetcard" display="inline"></meetcard-book>`

/**
 * The company behind the business card: who you are affiliated with, what the
 * card inherits from them, and where team bookings go.
 *
 * Affiliation comes first because everything under it is scoped by it — the
 * logo, the colors and the routing all belong to whichever company is
 * primary, and editing them before choosing one is editing an unknown.
 */
export function Company() {
  const [primary, setPrimary] = useState('meetcard')
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY)
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT)
  const [show, setShow] = useState({
    company: true,
    logo: true,
    nameOnProfile: false,
    workEmail: true,
    teamBooking: true,
  })
  const [cta, setCta] = useState('save-contact')

  const set = (key: keyof typeof show) => (next: boolean) =>
    setShow((all) => ({ ...all, [key]: next }))

  const enabled = CALENDARS.filter((member) => member.enabled).length

  return (
    <SettingsPanel
      eyebrow="Company"
      title="Company settings"
      description="Manage your company affiliation and what appears on your company-affiliated MeetCard."
      onSave={() => {}}
    >
      <Stack gap={24}>
        <SettingsGroup
          title="Company affiliation"
          action={
            <Button size="sm" variant="secondary" iconStart={<Plus aria-hidden="true" />}>
              Add another company
            </Button>
          }
        >
          {AFFILIATIONS.map((company) => (
            <SettingRow
              key={company.id}
              title={
                <span className="settings__affiliation">
                  {company.name}
                  {primary === company.id ? (
                    <Badge tone="brand" size="sm">
                      Primary
                    </Badge>
                  ) : null}
                  <Badge
                    tone={company.verified ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {company.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                </span>
              }
              description={company.role}
              control={
                primary === company.id ? undefined : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setPrimary(company.id)}
                  >
                    <span className="deck-visually-hidden">
                      Set {company.name} as primary
                    </span>
                    <span aria-hidden="true">Set as primary</span>
                  </Button>
                )
              }
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Company information">
          <div className="settings__form">
            <ImageUpload
              label="Logo"
              shape="square"
              description="Full-colour mark for light backgrounds. Square PNG or SVG, at least 256×256."
            />
            <ImageUpload
              label="Inverse logo"
              shape="square"
              description="Light mark for dark mode and overlaying the cover image."
            />
            <ImageUpload
              label="Cover image"
              shape="cover"
              description="4:3 image (1600×1200 recommended). Cropped to fill the company profile on the back of your card."
            />

            <Input
              label="Company name"
              id="company-name"
              defaultValue="MeetCard"
            />
            <Input
              label="Website"
              id="company-website"
              defaultValue="https://meetcard.io"
            />
            <Textarea
              label="Description"
              id="company-description"
              rows={3}
              defaultValue="Digital business cards for people who meet people."
            />
            <Input
              label="LinkedIn"
              id="company-linkedin"
              defaultValue="linkedin.com/company/meetcard"
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Brand colors"
          description="Used for buttons, highlights, and accents on your company MeetCards. Defaults to MeetCard's brand colors."
        >
          <div className="settings__form">
            <ColorField
              id="company-primary-color"
              label="Primary color"
              colorName="Signal Green"
              value={primaryColor}
              onValueChange={setPrimaryColor}
            />
            <ColorField
              id="company-accent-color"
              label="Accent color"
              colorName="Warm Clay"
              value={accentColor}
              onValueChange={setAccentColor}
            />

            {/*
              What the two colours are *for*, shown where they land: the main
              action filled in the primary, the second outlined in the
              accent. A pair of swatches would say which colours you chose;
              this says what you chose them for.

              Inline custom properties because these are the company's
              values, not the system's — the one case where a colour in a
              style attribute is the honest thing.
            */}
            <div className="settings__brand-preview">
              <Text size="xs" tone="muted" className="settings__eyebrow">
                Preview
              </Text>
              <div
                className="settings__brand-buttons"
                style={
                  {
                    '--settings-brand-primary': primaryColor,
                    '--settings-brand-accent': accentColor,
                    '--settings-brand-on': onBrandColor(primaryColor),
                  } as CSSProperties
                }
              >
                <span className="settings__brand-button settings__brand-button--primary">
                  Book a time
                </span>
                <span className="settings__brand-button settings__brand-button--accent">
                  Save contact
                </span>
              </div>
            </div>

            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPrimaryColor(DEFAULT_PRIMARY)
                  setAccentColor(DEFAULT_ACCENT)
                }}
              >
                Reset to MeetCard defaults
              </Button>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="My role">
          <div className="settings__form">
            <Input
              label="Job title"
              id="company-title"
              defaultValue="Founder & Head of Product"
            />
            <Input
              label="Department"
              id="company-department"
              defaultValue="Product"
            />
            <Input
              label="Work email"
              id="company-work-email"
              type="email"
              defaultValue="ben@meetcard.io"
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="On your MeetCard"
          description="Choose what appears on your company-affiliated card."
        >
          <SettingRow
            title="Show company"
            description="Display your company name under your title."
            checked={show.company}
            onCheckedChange={set('company')}
          />
          <SettingRow
            title="Show company logo"
            description="Add the company logo to your card."
            checked={show.logo}
            onCheckedChange={set('logo')}
          />
          <SettingRow
            title="Show the name on the company profile card"
            description="Useful when your logo isn't a wordmark. Off by default to avoid repeating the name."
            checked={show.nameOnProfile}
            onCheckedChange={set('nameOnProfile')}
          />
          <SettingRow
            title="Show work email"
            description="Reveal your work email to people you exchange with."
            checked={show.workEmail}
            onCheckedChange={set('workEmail')}
          />
          <SettingRow
            title="Primary CTA"
            description="The main action on your company card."
          >
            <ChoiceGroup
              label="Primary call to action"
              hideLabel
              variant="tile"
              columns={3}
              options={[
                {
                  value: 'save-contact',
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
              ]}
              value={cta}
              onChange={setCta}
            />
          </SettingRow>
        </SettingsGroup>

        <SettingsGroup
          title="Book with team"
          description="Route meeting requests to the right teammate by purpose."
        >
          <SettingRow
            title="Enable Book with Team"
            description="Adds a shared booking button members can show on their business card."
            checked={show.teamBooking}
            onCheckedChange={set('teamBooking')}
          />

          {show.teamBooking ? (
            <SettingRow
              title="Team booking link"
              description="Members can show this on their business card from their profile settings."
            >
              <Stack gap={16}>
                <Input
                  label="Button label"
                  id="team-button-label"
                  defaultValue="Book with our team"
                />
                <CodeSnippet
                  label="Embed on your website"
                  description="Add the team booking widget to any page."
                  code={TEAM_EMBED}
                />
              </Stack>
            </SettingRow>
          ) : null}
        </SettingsGroup>

        <SettingsGroup
          title="Team calendar connections"
          description={`Team booking can only route to members whose calendar is enabled — ${enabled} of ${CALENDARS.length} so far. Members enable their own calendar in Profile settings under Book with.`}
        >
          {CALENDARS.map((member) => (
            <IntegrationRow
              key={member.name}
              name={member.name}
              logo={<Building2 />}
              description={member.provider}
              status={member.enabled ? 'connected' : 'attention'}
              statusLabel={member.enabled ? 'Calendar enabled' : 'Not enabled'}
            />
          ))}
        </SettingsGroup>

        <SettingsGroup title="Verification">
          <Card surface="subtle" elevation="none">
            <Stack gap={4}>
              <Text weight="medium">MeetCard is verified</Text>
              <Text size="sm" tone="muted">
                Your affiliation is confirmed with a matching work email domain.
              </Text>
            </Stack>
          </Card>
        </SettingsGroup>
      </Stack>
    </SettingsPanel>
  )
}
