import { useId, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarCheck,
  CalendarClock,
  Camera,
  Clock,
  Eye,
  EyeOff,
  Globe,
  Handshake,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
} from 'lucide-react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Badge } from '../../components/Badge/Badge'
import { Button } from '../../components/Button/Button'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { Link } from '../../components/Link/Link'
import { Select } from '../../components/Select/Select'
import { Stack } from '../../components/Stack/Stack'
import { Switch } from '../../components/Switch/Switch'
import { Tag } from '../../components/Tag/Tag'
import { Text } from '../../components/Text/Text'
import { Textarea } from '../../components/Textarea/Textarea'
import { TimeSlotPicker } from '../../components/TimeSlotPicker/TimeSlotPicker'
import type { TimeSlot } from '../../components/TimeSlotPicker/TimeSlotPicker'
import { providerIcons } from '../../components/ProviderButton/providerIcons'
import {
  PrefixInput,
  SettingsFooter,
  SettingsPanel,
  SettingsRow,
  SettingsSection,
} from './SettingsPanel'
import { ACCOUNT, CARDS, COMPANY } from './settingsData'

/* ---- Model -------------------------------------------------------------- */

const BIO_LIMIT = 160

const DAYS = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
]

const option = (value: string, label: string) => ({ value, label })

const TIME_ZONES = [
  option('America/Denver', 'America/Denver'),
  option('America/Los_Angeles', 'America/Los_Angeles'),
  option('America/New_York', 'America/New_York'),
  option('Europe/London', 'Europe/London'),
]

const DURATIONS = [
  option('15', '15 minutes'),
  option('30', '30 minutes'),
  option('45', '45 minutes'),
  option('60', '60 minutes'),
]

const HOURS = [
  option('7', '7 AM'),
  option('8', '8 AM'),
  option('9', '9 AM'),
  option('10', '10 AM'),
  option('16', '4 PM'),
  option('17', '5 PM'),
  option('18', '6 PM'),
  option('19', '7 PM'),
]

const BUFFERS = [
  option('0', 'None'),
  option('5', '5 minutes'),
  option('10', '10 minutes'),
  option('15', '15 minutes'),
]

const NOTICE = [
  option('1', '1 hour'),
  option('4', '4 hours'),
  option('24', '1 day'),
  option('48', '2 days'),
]

const WINDOW = [
  option('14', '14 days out'),
  option('30', '30 days out'),
  option('60', '60 days out'),
  option('90', '90 days out'),
]

/*
 * Two days of a sample calendar, busy times included. Written out rather than
 * generated so the preview is the same picture in a story, a snapshot and a
 * review — an availability preview that shuffles every render is one nobody
 * can point at.
 */
const PREVIEW_DAYS: { label: string; slots: TimeSlot[] }[] = [
  {
    label: 'Thu, Sep 3',
    slots: [
      { time: '09:00' },
      { time: '09:45', taken: true },
      { time: '10:30', taken: true },
      { time: '11:15' },
      { time: '12:00' },
      { time: '12:45' },
      { time: '13:30', taken: true },
      { time: '14:15', taken: true },
      { time: '15:00' },
      { time: '15:45' },
      { time: '16:30' },
    ],
  },
  {
    label: 'Fri, Sep 4',
    slots: [
      { time: '09:00', taken: true },
      { time: '09:45', taken: true },
      { time: '10:30' },
      { time: '11:15' },
      { time: '12:00' },
      { time: '12:45' },
      { time: '13:30' },
      { time: '14:15' },
      { time: '15:00', taken: true },
      { time: '15:45', taken: true },
      { time: '16:30' },
    ],
  },
]

interface Calendar {
  id: 'google' | 'microsoft'
  name: string
  account: string
  enabled: boolean
}

const CALENDARS: Calendar[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    account: ACCOUNT.email,
    enabled: true,
  },
  {
    id: 'microsoft',
    name: 'Outlook Calendar',
    account: 'alex.rivera@northwind.studio',
    enabled: false,
  },
]

const PRIVACY = [
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
]

interface CallToAction {
  id: string
  label: string
  url: string
  /** Owned by the Book with section — editable there, not here. */
  managed?: boolean
}

const CTAS: CallToAction[] = [
  {
    id: 'book',
    label: 'Book a time',
    url: `https://meetcard.io/${CARDS[0].slug}/book/`,
    managed: true,
  },
  { id: 'website', label: 'Website', url: `https://${ACCOUNT.website}` },
]

/* ---- Page --------------------------------------------------------------- */

/**
 * Profile — how you appear on the card people are handed.
 *
 * The order is the card being built up: who you are, which card, how to reach
 * you, what someone can do with it, and last who gets to see any of it. That
 * is also roughly the order of how often each is edited, which is why the name
 * is at the top and the privacy model is at the bottom.
 *
 * Two things on this page are deliberately *not* editable here. The cover
 * image and brand colours belong to the company — one company, one palette, or
 * the team stops looking like a team — and the team booking button is the
 * company's too. Both say so and link across to Company settings rather than
 * offering a second copy that would quietly disagree.
 *
 * Reordering the calls to action is buttons, not drag. The prototype drags;
 * a drag handle with no keyboard equivalent is a control half the people on
 * the page cannot use, and with two rows an "up"/"down" pair is also simply
 * faster.
 *
 * Nothing persists — Deck has no data layer.
 */
export function SettingsProfile() {
  const photoInputId = useId()
  const photoInput = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(ACCOUNT.firstName)
  const [lastName, setLastName] = useState(ACCOUNT.lastName)
  const [website, setWebsite] = useState(ACCOUNT.website)
  const [bio, setBio] = useState(ACCOUNT.bio)
  const [photo, setPhoto] = useState<string | null>(null)

  const [cardId, setCardId] = useState(CARDS[0].id)
  const [cards, setCards] = useState(CARDS)

  const [phone, setPhone] = useState(ACCOUNT.phone)
  const [linkedin, setLinkedin] = useState(ACCOUNT.linkedin)
  const [github, setGithub] = useState(ACCOUNT.github)

  const [booking, setBooking] = useState(true)
  const [bookingLabel, setBookingLabel] = useState('Book a time')
  const [bookingLink, setBookingLink] = useState(
    `https://meetcard.io/${CARDS[0].slug}/book/`,
  )
  const [calendars, setCalendars] = useState(CALENDARS)
  const [bookingCalendar, setBookingCalendar] = useState<Calendar['id']>('google')

  const [timeZone, setTimeZone] = useState(ACCOUNT.timeZone)
  const [duration, setDuration] = useState('30')
  const [days, setDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri'])
  const [startHour, setStartHour] = useState('9')
  const [endHour, setEndHour] = useState('17')
  const [bufferBefore, setBufferBefore] = useState('0')
  const [bufferAfter, setBufferAfter] = useState('15')
  const [notice, setNotice] = useState('4')
  const [horizon, setHorizon] = useState('30')

  const [teamBooking, setTeamBooking] = useState(false)
  const [ctas, setCtas] = useState(CTAS)
  const [privacy, setPrivacy] = useState('public')
  const [reciprocal, setReciprocal] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const card = cards.find((one) => one.id === cardId) ?? cards[0]
  const isBusiness = card.id === 'business'
  const enabledCalendar = calendars.find((one) => one.enabled)

  const updateCard = (patch: Partial<(typeof CARDS)[number]>) =>
    setCards((all) =>
      all.map((one) => (one.id === cardId ? { ...one, ...patch } : one)),
    )

  function choosePhoto(file: File | undefined) {
    if (!file) return
    if (photo) URL.revokeObjectURL(photo)
    setPhoto(URL.createObjectURL(file))
  }

  const toggleDay = (id: string) =>
    setDays((all) =>
      all.includes(id) ? all.filter((one) => one !== id) : [...all, id],
    )

  const toggleCalendar = (id: Calendar['id']) =>
    setCalendars((all) =>
      all.map((one) =>
        one.id === id ? { ...one, enabled: !one.enabled } : one,
      ),
    )

  /* Swapping with the neighbour rather than a full sort — two rows, and the
     buttons should mean exactly "up one" and "down one". */
  function move(index: number, by: -1 | 1) {
    setCtas((all) => {
      const next = [...all]
      const target = index + by
      if (target < 0 || target >= next.length) return all
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return (
    <SettingsPanel
      eyebrow="Profile"
      icon={<UserRound />}
      title="Your identity"
      description="This is how you appear on your MeetCard. Update your photo, contact details, and the actions people can take when they receive your card."
      footer={
        <SettingsFooter note="Changes save to your live card — the one people already have the link to." />
      }
    >
      {/* ---- Identity ---- */}
      <SettingsSection title="Identity" divided={false}>
        {/*
          A real `<input type="file">` driven by labels, rather than buttons
          that call `.click()` on a hidden one: the native control is already
          keyboard-operable and already announces itself, and reaching for
          `.click()` trades that away for nothing. Two labels, one input —
          the badge on the photo and the button beside it are the same
          control, so they are one tab stop, and the ring lands on the
          labelled one.
        */}
        <div className="settings__photo">
          <input
            ref={photoInput}
            id={photoInputId}
            type="file"
            accept="image/*"
            className="settings__file deck-visually-hidden"
            onChange={(changeEvent) => choosePhoto(changeEvent.target.files?.[0])}
          />

          <span className="settings__photo-frame">
            <Avatar
              name={`${firstName} ${lastName}`}
              src={photo ?? undefined}
              size="xl"
              decorative
            />
            {/* No text of its own — the button below names the input, and a
                second name here would be read as part of the same one. */}
            <label
              htmlFor={photoInputId}
              className="deck-icon-button deck-icon-button--secondary deck-icon-button--sm deck-icon-button--round settings__photo-edit"
            >
              <span className="deck-icon-button__icon" aria-hidden="true">
                <Camera />
              </span>
            </label>
          </span>

          <Stack gap={4} align="start">
            <label
              htmlFor={photoInputId}
              className="deck-button deck-button--secondary deck-button--sm settings__photo-upload"
            >
              <span className="deck-button__icon" aria-hidden="true">
                <Upload />
              </span>
              Upload new photo
            </label>
            <Text size="xs" tone="muted">
              Square, at least 400×400px. JPG or PNG.
            </Text>
          </Stack>
        </div>

        <div className="settings__pair">
          <Input
            label="First name"
            value={firstName}
            onChange={(changeEvent) => setFirstName(changeEvent.target.value)}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(changeEvent) => setLastName(changeEvent.target.value)}
          />
        </div>

        <PrefixInput
          label="Website"
          prefix="https://"
          icon={<Globe />}
          value={website}
          onValueChange={setWebsite}
        />

        <Textarea
          label="Bio"
          rows={3}
          value={bio}
          maxLength={BIO_LIMIT}
          description={`${bio.length}/${BIO_LIMIT} — the line under your name on the card.`}
          onChange={(changeEvent) => setBio(changeEvent.target.value)}
        />
      </SettingsSection>

      {/* ---- Cards ---- */}
      <SettingsSection
        id="cards"
        title="Your cards"
        description={`You have ${cards.length} cards. Each one has its own URL, tagline and details — pick a card to edit what it shows.`}
      >
        <ChoiceGroup
          label="Which card"
          hideLabel
          variant="segmented"
          options={cards.map((one) => ({ value: one.id, label: one.label }))}
          value={cardId}
          onChange={(next) => setCardId(next as typeof cardId)}
        />

        <PrefixInput
          label="Card URL"
          prefix="meetcard.io/"
          value={card.slug}
          description={card.slugHint}
          onValueChange={(slug) => updateCard({ slug })}
        />

        <Input
          label="Tagline"
          value={card.tagline}
          description="The line under your name on the card."
          onChange={(changeEvent) =>
            updateCard({ tagline: changeEvent.target.value })
          }
        />

        <div className="settings__pair">
          <Input
            label="Job title"
            value={card.title}
            onChange={(changeEvent) =>
              updateCard({ title: changeEvent.target.value })
            }
          />
          <Input
            label="Workplace"
            value={card.workplace}
            description="Taps through to the company profile on the card."
            onChange={(changeEvent) =>
              updateCard({ workplace: changeEvent.target.value })
            }
          />
        </div>

        <Input
          label="Location"
          iconStart={<MapPin />}
          value={card.location}
          onChange={(changeEvent) =>
            updateCard({ location: changeEvent.target.value })
          }
        />

        {isBusiness ? (
          <SettingsRow
            icon={<Building2 />}
            title="Cover image & brand colours"
            description={`Your business card inherits ${COMPANY.name}'s cover image, logo and brand colours.`}
            action={
              <Link href="/settings/company" underline="hover">
                Company settings
              </Link>
            }
          />
        ) : null}
      </SettingsSection>

      {/* ---- Contact ---- */}
      <SettingsSection title="Contact">
        <Input
          label="Phone"
          type="tel"
          iconStart={<Phone />}
          value={phone}
          onChange={(changeEvent) => setPhone(changeEvent.target.value)}
        />
      </SettingsSection>

      {/* ---- Social ---- */}
      <SettingsSection title="Social">
        <div className="settings__pair">
          <PrefixInput
            label="LinkedIn"
            prefix="linkedin.com/"
            value={linkedin}
            onValueChange={setLinkedin}
          />
          <PrefixInput
            label="GitHub"
            prefix="github.com/"
            value={github}
            onValueChange={setGithub}
          />
        </div>
      </SettingsSection>

      {/* ---- Book with ---- */}
      <SettingsSection
        id="book-with"
        title="Book with"
        description="Let people schedule time with you straight from your card."
        gap={12}
      >
        <div className="settings__band">
          <Switch
            label="Book a time with me"
            description="Shows a booking button on your personal and business cards."
            checked={booking}
            onChange={(changeEvent) => setBooking(changeEvent.target.checked)}
          />
        </div>

        {booking ? (
          <>
            <div className="settings__pair">
              <Input
                label="Button label"
                placeholder="Book a time"
                value={bookingLabel}
                onChange={(changeEvent) =>
                  setBookingLabel(changeEvent.target.value)
                }
              />
              <Input
                label="Booking link"
                type="url"
                placeholder="https://"
                value={bookingLink}
                onChange={(changeEvent) =>
                  setBookingLink(changeEvent.target.value)
                }
              />
            </div>

            <SettingsRow
              icon={<CalendarClock />}
              title="Calendar"
              description="Use the Google or Microsoft account you already sign in with, so Book with can show real availability and add booked meetings to your calendar."
            >
              <Stack as="ul" gap={8} className="settings__list">
                {calendars.map((calendar) => (
                  <li key={calendar.id}>
                    <SettingsRow
                      icon={providerIcons[calendar.id]}
                      title={
                        <>
                          {calendar.name}{' '}
                          <Badge
                            tone={calendar.enabled ? 'success' : 'warning'}
                            size="sm"
                            dot
                          >
                            {calendar.enabled
                              ? 'Calendar enabled'
                              : 'Needs permission'}
                          </Badge>
                          {calendar.enabled &&
                          calendar.id === bookingCalendar ? (
                            <Badge tone="brand" size="sm">
                              Booking calendar
                            </Badge>
                          ) : null}
                        </>
                      }
                      description={calendar.account}
                      action={
                        calendar.enabled ? (
                          <>
                            {calendar.id === bookingCalendar ? null : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setBookingCalendar(calendar.id)}
                              >
                                Use for bookings
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleCalendar(calendar.id)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleCalendar(calendar.id)}
                          >
                            Enable calendar
                          </Button>
                        )
                      }
                    />
                  </li>
                ))}
              </Stack>
            </SettingsRow>

            <SettingsRow
              icon={<Clock />}
              title="Availability"
              description="Scheduling rules applied on top of your calendar's busy times."
            >
              <Stack gap={16}>
                <div className="settings__pair">
                  <Select
                    label="Time zone"
                    options={TIME_ZONES}
                    value={timeZone}
                    onChange={(changeEvent) =>
                      setTimeZone(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Meeting duration"
                    options={DURATIONS}
                    value={duration}
                    onChange={(changeEvent) =>
                      setDuration(changeEvent.target.value)
                    }
                  />
                </div>

                <fieldset className="settings__fieldset">
                  <legend className="settings__legend">Available days</legend>
                  <div className="settings__days">
                    {DAYS.map((day) => (
                      <Tag
                        key={day.id}
                        selected={days.includes(day.id)}
                        onToggle={() => toggleDay(day.id)}
                      >
                        {day.label}
                      </Tag>
                    ))}
                  </div>
                </fieldset>

                <div className="settings__pair">
                  <Select
                    label="Working hours start"
                    options={HOURS}
                    value={startHour}
                    onChange={(changeEvent) =>
                      setStartHour(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Working hours end"
                    options={HOURS}
                    value={endHour}
                    onChange={(changeEvent) =>
                      setEndHour(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Buffer before"
                    options={BUFFERS}
                    value={bufferBefore}
                    onChange={(changeEvent) =>
                      setBufferBefore(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Buffer after"
                    options={BUFFERS}
                    value={bufferAfter}
                    onChange={(changeEvent) =>
                      setBufferAfter(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Minimum booking notice"
                    options={NOTICE}
                    value={notice}
                    onChange={(changeEvent) =>
                      setNotice(changeEvent.target.value)
                    }
                  />
                  <Select
                    label="Maximum booking window"
                    options={WINDOW}
                    value={horizon}
                    onChange={(changeEvent) =>
                      setHorizon(changeEvent.target.value)
                    }
                  />
                </div>
              </Stack>
            </SettingsRow>

            {/*
              The preview is a real `TimeSlotPicker`, the same component the
              public booking page uses, rather than a drawing of one. A
              preview that is not the thing it previews is how the two drift.
            */}
            <SettingsRow
              icon={<CalendarCheck />}
              title="Availability preview"
              /* The zone is not repeated here — each day names it beside its
                 own heading, which is where someone reading a time looks. */
              description="What visitors would see on your public booking page, using a sample of your calendar."
            >
              <div className="settings__preview">
                {PREVIEW_DAYS.map((day) => (
                  <TimeSlotPicker
                    key={day.label}
                    label={day.label}
                    slots={day.slots}
                    timeZone={timeZone}
                  />
                ))}
              </div>
            </SettingsRow>

            <SettingsRow
              icon={<ShieldCheck />}
              title="No double-bookings"
              description="Slots are filtered against your calendar when the page loads, then re-checked the moment a visitor confirms. If something landed on your calendar in between, the booking is stopped and they pick again."
            >
              <Stack gap={12}>
                <SettingsRow
                  title="Tomorrow · 10:00 AM"
                  description="That time was just booked. Choose another slot."
                  action={
                    <Badge tone="error" size="sm">
                      Unavailable
                    </Badge>
                  }
                />
                <Text size="xs" tone="muted">
                  Confirmed meetings are added to your{' '}
                  {enabledCalendar?.name ?? 'connected calendar'} with the
                  guest's details, and both parties get a confirmation.
                </Text>
              </Stack>
            </SettingsRow>
          </>
        ) : null}

        <div className="settings__band">
          <Switch
            label="Book with team"
            description={`Add ${COMPANY.name}'s shared booking button to your business card.`}
            checked={teamBooking}
            onChange={(changeEvent) =>
              setTeamBooking(changeEvent.target.checked)
            }
          />
          <Stack direction="row" gap={8} align="center" wrap style={{ marginBlockStart: 12 }}>
            <code className="settings__code">
              https://meetcard.io/{COMPANY.slug}/book/
            </code>
            <Text size="xs" tone="muted" as="span">
              Managed in{' '}
              <Link href="/settings/company" underline="hover">
                Company settings
              </Link>
              .
            </Text>
          </Stack>
        </div>
      </SettingsSection>

      {/* ---- Calls to action ---- */}
      <SettingsSection
        title="Calls to action"
        description="The two buttons shown on your card, in the order they appear."
        gap={12}
      >
        <Stack as="ul" gap={8} className="settings__list">
          {ctas.map((cta, index) => (
            <li key={cta.id} className="settings__cta">
              <span className="settings__cta-handle">
                <IconButton
                  label={`Move ${cta.label} up`}
                  variant="ghost"
                  size="sm"
                  icon={<ArrowUp />}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                />
                <IconButton
                  label={`Move ${cta.label} down`}
                  variant="ghost"
                  size="sm"
                  icon={<ArrowDown />}
                  disabled={index === ctas.length - 1}
                  onClick={() => move(index, 1)}
                />
              </span>

              <Input
                label={`Label for button ${index + 1}`}
                hideLabel
                placeholder="Label"
                value={cta.label}
                disabled={cta.managed}
                onChange={(changeEvent) =>
                  setCtas((all) =>
                    all.map((one) =>
                      one.id === cta.id
                        ? { ...one, label: changeEvent.target.value }
                        : one,
                    ),
                  )
                }
              />
              <Input
                label={`Link for button ${index + 1}`}
                hideLabel
                type="url"
                placeholder="https://"
                value={cta.url}
                disabled={cta.managed}
                onChange={(changeEvent) =>
                  setCtas((all) =>
                    all.map((one) =>
                      one.id === cta.id
                        ? { ...one, url: changeEvent.target.value }
                        : one,
                    ),
                  )
                }
              />
            </li>
          ))}
        </Stack>

        <p className="settings__note">
          <Lock aria-hidden="true" focusable="false" />
          Your booking button is managed above in Book with, so its label and
          link are edited there. It can still be reordered.
        </p>
      </SettingsSection>

      {/* ---- Privacy ---- */}
      <SettingsSection
        id="exchange"
        title="Card privacy"
        description="Choose how much of your card people see before they connect."
        gap={12}
      >
        <ChoiceGroup
          label="Card privacy"
          hideLabel
          variant="tile"
          columns={2}
          options={PRIVACY}
          value={privacy}
          onChange={setPrivacy}
        />
        <p className="settings__note">
          {privacy === 'public' ? (
            <Eye aria-hidden="true" focusable="false" />
          ) : (
            <EyeOff aria-hidden="true" focusable="false" />
          )}
          {privacy === 'public'
            ? 'Anyone with the link sees everything on the card, including your phone number.'
            : 'Your details stay hidden until someone taps to reveal, which is also when the exchange is recorded.'}
        </p>
      </SettingsSection>

      {/* ---- Additional controls ---- */}
      <SettingsSection title="Additional controls" gap={12}>
        <div className="settings__band">
          <Switch
            label="Require reciprocal exchange"
            description="Only reveal your contact details to people who share their card back."
            checked={reciprocal}
            onChange={(changeEvent) => setReciprocal(changeEvent.target.checked)}
          />
          {reciprocal ? (
            <p className="settings__note" style={{ marginBlockStart: 12 }}>
              <Handshake aria-hidden="true" focusable="false" />
              People who do not share back still see your name, photo and
              tagline — enough to remember who they met.
            </p>
          ) : null}
        </div>

        <div className="settings__band">
          <Switch
            label="Require authenticated reveal"
            description="Require viewers to sign in before they can reveal your full card."
            checked={authenticated}
            onChange={(changeEvent) =>
              setAuthenticated(changeEvent.target.checked)
            }
          />
        </div>
      </SettingsSection>
    </SettingsPanel>
  )
}
