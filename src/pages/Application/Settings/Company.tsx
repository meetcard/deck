import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'
import { Badge } from '../../../components/Badge/Badge'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { ChoiceGroup } from '../../../components/ChoiceGroup/ChoiceGroup'
import { CodeSnippet } from '../../../components/CodeSnippet/CodeSnippet'
import { Field } from '../../../components/Field/Field'
import { ImageUpload } from '../../../components/ImageUpload/ImageUpload'
import { Input } from '../../../components/Input/Input'
import { IntegrationRow } from '../../../components/IntegrationRow/IntegrationRow'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { Textarea } from '../../../components/Textarea/Textarea'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

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
            <Field htmlFor="company-primary-color" label="Primary color">
              {/* A real `<input type="color">`: it opens the platform's own
                  picker, which is the one control nobody has to be taught,
                  and it stays a text-enterable hex for anyone who has one. */}
              <input
                id="company-primary-color"
                type="color"
                defaultValue="#2e6e5b"
                className="settings__color"
              />
            </Field>
            <Field htmlFor="company-accent-color" label="Accent color">
              <input
                id="company-accent-color"
                type="color"
                defaultValue="#c2603c"
                className="settings__color"
              />
            </Field>
            <div>
              <Button variant="ghost" size="sm">
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
