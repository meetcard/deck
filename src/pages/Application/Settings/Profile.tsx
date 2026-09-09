import { useState } from 'react'
import { CalendarDays, Lock } from 'lucide-react'
import { Banner } from '../../../components/Banner/Banner'
import { Button } from '../../../components/Button/Button'
import { Checkbox } from '../../../components/Checkbox/Checkbox'
import { ChoiceGroup } from '../../../components/ChoiceGroup/ChoiceGroup'
import { CodeSnippet } from '../../../components/CodeSnippet/CodeSnippet'
import { ImageUpload } from '../../../components/ImageUpload/ImageUpload'
import { Input } from '../../../components/Input/Input'
import { IntegrationRow } from '../../../components/IntegrationRow/IntegrationRow'
import { Link } from '../../../components/Link/Link'
import { ReorderList } from '../../../components/ReorderList/ReorderList'
import { Select } from '../../../components/Select/Select'
import { SettingRow } from '../../../components/SettingRow/SettingRow'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'
import { Textarea } from '../../../components/Textarea/Textarea'
import { TimeSlotPicker } from '../../../components/TimeSlotPicker/TimeSlotPicker'
import { SettingsGroup, SettingsPanel } from './SettingsPanel'

const BIO_LIMIT = 160

/**
 * The buttons on the card, top to bottom.
 *
 * `Book a time` is managed: what it says and where it points are decided by
 * the Book with group above, and two places to edit one button is how they
 * come to disagree. Its *position* is still yours — where a button sits on
 * your card is your decision even when its wording is not — so it keeps its
 * handle and only its fields are read-only.
 */
const CTAS = [
  {
    id: 'book',
    label: 'Book a time',
    href: 'meetcard.io/ben@meetcard/book',
    managed: true,
  },
  { id: 'website', label: 'Website', href: 'meetcard.io', managed: false },
]

const DAYS = [
  { value: 'sun', label: 'Sun' },
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
]

const EMBED = `<script src="https://cdn.meetcard.io/embed.js" async></script>
<meetcard-book type="person" handle="ben@meetcard" display="inline"></meetcard-book>`

/* Three days of a sample week. Busy slots are the calendar's, free ones are
   what a visitor would actually be offered — showing both is the only way the
   preview says anything about the rules above it. */
const PREVIEW_DAYS = [
  {
    label: 'Mon, Sep 7',
    slots: [
      { time: '09:00', taken: true },
      { time: '09:45', taken: true },
      { time: '10:30' },
      { time: '11:15' },
      { time: '12:00' },
      { time: '15:00', taken: true },
      { time: '16:30' },
    ],
  },
  {
    label: 'Tue, Sep 8',
    slots: [
      { time: '09:00' },
      { time: '09:45' },
      { time: '10:30' },
      { time: '11:15', taken: true },
      { time: '12:00', taken: true },
      { time: '13:30' },
      { time: '15:00' },
    ],
  },
]

/**
 * Your identity as the card shows it, and the rules behind the booking button
 * on it.
 *
 * The longest screen in Settings, and deliberately one screen: everything
 * here is the same object seen from different angles — the card. Splitting
 * "availability" out would mean editing your booking rules somewhere that
 * cannot show you the card they appear on.
 *
 * The availability preview is the section's whole argument. Scheduling rules
 * are a stack of small numbers whose combined effect nobody can hold in their
 * head, so the page renders the outcome — the slots a visitor would actually
 * be offered — rather than trusting anyone to derive it.
 */
export function Profile() {
  const [bio, setBio] = useState('Builder at MeetCard. Ask me about decks.')
  const [card, setCard] = useState('business')
  const [booking, setBooking] = useState(true)
  const [days, setDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [ctas, setCtas] = useState(CTAS)
  const [privacy, setPrivacy] = useState('public')
  const [reciprocal, setReciprocal] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const toggleDay = (value: string) =>
    setDays((all) =>
      all.includes(value) ? all.filter((day) => day !== value) : [...all, value],
    )

  return (
    <SettingsPanel
      eyebrow="Profile"
      title="Your identity"
      description="This is how you appear on your MeetCard. Update your photo, contact details, and the actions people can take when they receive your card."
      onSave={() => {}}
      saveNote="Changes save automatically to your live card."
    >
      <Stack gap={24}>
        <SettingsGroup title="Identity">
          <div className="settings__form">
            <ImageUpload
              label="Profile photo"
              shape="circle"
              description="Square, at least 400×400px. JPG or PNG."
            />

            <div className="settings__row">
              <Input
                label="First name"
                id="profile-first"
                defaultValue="Ben"
              />
              <Input
                label="Last name"
                id="profile-last"
                defaultValue="Ackles"
              />
            </div>

            <Input
              label="Website"
              id="profile-website"
              defaultValue="https://meetcard.io"
            />

            <Textarea
              label="Bio"
              description={`${bio.length}/${BIO_LIMIT} characters`}
              id="profile-bio"
              rows={3}
              maxLength={BIO_LIMIT}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Your cards"
          description="You have two cards. Each one has its own URL, tagline, and details — pick a card to edit what it shows."
        >
          <div className="settings__form">
            <ChoiceGroup
              label="Card being edited"
              options={[
                { value: 'business', label: 'Business' },
                { value: 'personal', label: 'Personal' },
              ]}
              value={card}
              onChange={setCard}
            />

            <Input
              label="Card URL"
              description={
                card === 'business'
                  ? 'Business cards use the name@company format.'
                  : 'Personal cards use your handle.'
              }
              id="profile-url"
              defaultValue={card === 'business' ? 'ben@meetcard' : 'ben'}
            />

            <Input
              label="Tagline"
              description="The line under your name on the card."
              id="profile-tagline"
              defaultValue="What a lovable guy"
            />

            <div className="settings__row">
              <Input
                label="Job title"
                id="profile-title"
                defaultValue="Builder"
              />
              <Input
                label="Workplace"
                description="Tap-through to the company profile on the card."
                id="profile-workplace"
                defaultValue="MeetCard"
              />
            </div>

            <Input
              label="Location"
              id="profile-location"
              defaultValue="Boulder, Colorado"
            />

            <Banner tone="info" title="Cover image & brand colors">
              Your business card inherits MeetCard's cover image, logo, and
              brand colors.{' '}
              <Link href="/settings/company">Company settings</Link>
            </Banner>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Contact">
          <div className="settings__form">
            <Input
              label="Phone"
              id="profile-phone"
              type="tel"
              defaultValue="+1 303 555 0142"
            />
          </div>
        </SettingsGroup>

        <SettingsGroup title="Social">
          <div className="settings__form">
            <Input
              label="LinkedIn"
              id="profile-linkedin"
              defaultValue="linkedin.com/in/benackles"
            />
            <Input
              label="GitHub"
              id="profile-github"
              defaultValue="github.com/benackles"
            />
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Book with"
          description="Let people schedule time with you straight from your card."
        >
          <SettingRow
            title="Book a time with me"
            description="Shows a booking button on your personal and business cards."
            checked={booking}
            onCheckedChange={setBooking}
          />

          {booking ? (
            <>
              <SettingRow title="Button" description="What the card's booking button says.">
                <div className="settings__form">
                  <Input
                    label="Button label"
                    id="profile-book-label"
                    defaultValue="Book a time"
                  />
                  <Input
                    label="Booking link"
                    id="profile-book-link"
                    defaultValue="meetcard.io/ben/book"
                  />
                  <CodeSnippet
                    label="Embed on your website"
                    description="Add a booking widget to any page."
                    code={EMBED}
                  />
                </div>
              </SettingRow>

              <SettingRow
                title="Calendar"
                description="Use the account you already sign in with, so Book with can show real availability and add booked meetings to your calendar."
              >
                <div className="settings__nested-list">
                  <IntegrationRow
                    name="Google Calendar"
                    logo={<CalendarDays />}
                    account="ben@meetcard.io"
                    status="connected"
                    statusLabel="Calendar enabled"
                    actions={
                      <Button size="sm" variant="ghost">
                        <span className="deck-visually-hidden">
                          Disconnect Google Calendar
                        </span>
                        <span aria-hidden="true">Disconnect</span>
                      </Button>
                    }
                  />
                  <IntegrationRow
                    name="Outlook Calendar"
                    logo={<CalendarDays />}
                    account="ben.ackles@meetcard.io"
                    status="attention"
                    actions={
                      <Button size="sm">
                        <span className="deck-visually-hidden">
                          Enable Outlook Calendar
                        </span>
                        <span aria-hidden="true">Enable calendar</span>
                      </Button>
                    }
                  />
                </div>
              </SettingRow>

              <SettingRow
                title="Availability"
                description="Scheduling rules applied on top of your calendar's busy times."
              >
                <div className="settings__form">
                  <div className="settings__row">
                    <Select
                      id="profile-timezone"
                      label="Time zone"
                      defaultValue="america-denver"
                      options={[
                        { value: 'america-denver', label: 'Mountain — Denver' },
                        { value: 'america-new-york', label: 'Eastern — New York' },
                        { value: 'europe-london', label: 'GMT — London' },
                      ]}
                    />
                    <Select
                      id="profile-duration"
                      label="Meeting duration"
                      defaultValue="30"
                      options={[
                        { value: '15', label: '15 minutes' },
                        { value: '30', label: '30 minutes' },
                        { value: '45', label: '45 minutes' },
                        { value: '60', label: '60 minutes' },
                      ]}
                    />
                  </div>

                  {/* A fieldset of checkboxes, not a ChoiceGroup: available
                      days are a multiple selection and ChoiceGroup is radios.
                      The legend is what names the set, so the seven boxes are
                      announced as one question rather than seven. */}
                  <fieldset className="settings__days">
                    <legend className="deck-field__label">Available days</legend>
                    <div className="settings__days-row">
                      {DAYS.map((day) => (
                        <Checkbox
                          key={day.value}
                          label={day.label}
                          checked={days.includes(day.value)}
                          onChange={() => toggleDay(day.value)}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <div className="settings__row">
                    <Input
                      label="Working hours start"
                      id="profile-start"
                      type="time"
                      defaultValue="09:00"
                    />
                    <Input
                      label="Working hours end"
                      id="profile-end"
                      type="time"
                      defaultValue="17:00"
                    />
                  </div>

                  <div className="settings__row">
                    <Select
                      id="profile-buffer-before"
                      label="Buffer before"
                      defaultValue="0"
                      options={[
                        { value: '0', label: 'None' },
                        { value: '5', label: '5 minutes' },
                        { value: '15', label: '15 minutes' },
                      ]}
                    />
                    <Select
                      id="profile-buffer-after"
                      label="Buffer after"
                      defaultValue="15"
                      options={[
                        { value: '0', label: 'None' },
                        { value: '5', label: '5 minutes' },
                        { value: '15', label: '15 minutes' },
                      ]}
                    />
                  </div>

                  <div className="settings__row">
                    <Select
                      id="profile-notice"
                      label="Minimum booking notice"
                      defaultValue="4h"
                      options={[
                        { value: '1h', label: '1 hour' },
                        { value: '4h', label: '4 hours' },
                        { value: '24h', label: '24 hours' },
                      ]}
                    />
                    <Select
                      id="profile-window"
                      label="Maximum booking window"
                      defaultValue="30d"
                      options={[
                        { value: '14d', label: '14 days' },
                        { value: '30d', label: '30 days' },
                        { value: '60d', label: '60 days' },
                      ]}
                    />
                  </div>
                </div>
              </SettingRow>

              <SettingRow
                title="Availability preview"
                description="What visitors would see on your public booking page, using a sample of your calendar."
              >
                <div className="settings__preview">
                  {PREVIEW_DAYS.map((day) => (
                    <TimeSlotPicker
                      key={day.label}
                      label={day.label}
                      slots={day.slots}
                    />
                  ))}
                </div>
              </SettingRow>

              <SettingRow
                title="No double-bookings"
                description="Slots are re-checked the moment a visitor confirms. If something landed on your calendar in between, the booking is stopped and they pick again."
              />
            </>
          ) : null}
        </SettingsGroup>

        {/*
          The order of the two buttons on the card, and the labels on the one
          you own. Ordering is the whole content of this group, which is why
          it is a list you rearrange rather than two number fields.
        */}
        <SettingsGroup
          title="Calls to action"
          description="The two buttons on your card, top to bottom. Drag a row, or focus its handle and use the arrow keys."
        >
          <div className="settings__form">
            <ReorderList
              label="Calls to action"
              items={ctas.map((cta) => ({
                id: cta.id,
                label: cta.label,
                content: (
                  <>
                    <Input
                      label={`${cta.label} button label`}
                      hideLabel
                      size="sm"
                      readOnly={cta.managed}
                      defaultValue={cta.label}
                      fieldClassName="settings__cta-label"
                    />
                    <Input
                      label={`${cta.label} link`}
                      hideLabel
                      size="sm"
                      readOnly={cta.managed}
                      defaultValue={cta.href}
                      fieldClassName="settings__cta-link"
                    />
                    {/* The fields are read-only and the lock says so at a
                        glance; the note under the list says who has them.
                        `aria-hidden`, because a screen reader is already
                        told the inputs are read-only. */}
                    {cta.managed ? (
                      <Lock
                        aria-hidden="true"
                        focusable="false"
                        className="settings__cta-lock"
                      />
                    ) : null}
                  </>
                ),
              }))}
              onReorder={(ids) =>
                setCtas((all) => ids.map((id) => all.find((cta) => cta.id === id)!))
              }
            />
            <Text size="xs" tone="muted">
              Your booking button is managed above in Book with.
            </Text>
          </div>
        </SettingsGroup>

        <SettingsGroup
          title="Card privacy"
          description="Choose how much of your card people see before they connect."
        >
          <div className="settings__form">
            <ChoiceGroup
              label="Card visibility"
              hideLabel
              variant="tile"
              columns={2}
              options={[
                {
                  value: 'public',
                  label: 'Public',
                  description: 'Your full card is visible to anyone with the link.',
                },
                {
                  value: 'reveal',
                  label: 'Reveal on tap',
                  description: 'Show only your name and photo until they tap to reveal.',
                },
              ]}
              value={privacy}
              onChange={setPrivacy}
            />
          </div>

        </SettingsGroup>

        {/* Kept apart from the visibility choice above: that one says what a
            stranger sees, these say what they have to do first. */}
        <SettingsGroup title="Additional controls">
          <SettingRow
            title="Require reciprocal exchange"
            description="Only reveal your contact details to people who share their card back."
            checked={reciprocal}
            onCheckedChange={setReciprocal}
          />
          <SettingRow
            title="Require authenticated reveal"
            description="Require viewers to sign in before they can reveal your full card."
            checked={authenticated}
            onCheckedChange={setAuthenticated}
          />
        </SettingsGroup>
      </Stack>
    </SettingsPanel>
  )
}
