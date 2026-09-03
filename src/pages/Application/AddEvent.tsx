import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { Banner } from '../../components/Banner/Banner'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { Heading } from '../../components/Heading/Heading'
import { IconButton } from '../../components/IconButton/IconButton'
import { Input } from '../../components/Input/Input'
import { Link } from '../../components/Link/Link'
import { Stack } from '../../components/Stack/Stack'
import { Switch } from '../../components/Switch/Switch'
import { Text } from '../../components/Text/Text'
import { Textarea } from '../../components/Textarea/Textarea'
import { LinkButton } from './LinkButton'
import type { EventInvolvement } from './eventsData'
import './AddEvent.css'

const INVOLVEMENTS: EventInvolvement[] = ['Attending', 'Speaking', 'Hosting']

interface DraftSlot {
  /** Local key. The time is editable, so it cannot be the key. */
  id: string
  time: string
  title: string
}

export interface AddEventProps {
  /** The signed-in person, pre-filled as the host. */
  hostName?: string
  hostRole?: string
}

/**
 * Add an event — naming a room so the cards you collect there stay together.
 *
 * The form is ordered the way you would describe an event out loud: what it
 * is, when, where, what it looks like, what happens at it. Everything past
 * the name is optional, and the submit says so by being the only thing
 * gated — you can create "Founders Dinner" now and fill in the venue when
 * someone books it.
 *
 * The cover is read locally with `URL.createObjectURL`, so the preview is the
 * actual picture at the actual crop rather than a placeholder standing in for
 * one. It is never uploaded anywhere; Deck has no server, and the object URL
 * is released when it is replaced or cleared.
 *
 * The frame is landscape, matching `EventHero`. Asking for a portrait image
 * and then cropping it to a wide cover is asking someone to compose a picture
 * for a shape they will never see.
 *
 * Nothing persists. Submitting confirms in place rather than pretending to
 * navigate, because there is no router here and a form that clears itself and
 * says nothing is indistinguishable from one that failed.
 */
export function AddEvent({
  hostName = 'Alex Rivera',
  hostRole = 'Design Lead, Northwind Studio',
}: AddEventProps) {
  const coverInputId = useId()
  const coverInput = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [host, setHost] = useState(hostName)
  const [role, setRole] = useState(hostRole)
  const [involvement, setInvolvement] = useState<EventInvolvement>('Attending')

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [expected, setExpected] = useState('')
  const [addToCalendar, setAddToCalendar] = useState(true)

  const [venue, setVenue] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  const [cover, setCover] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [slots, setSlots] = useState<DraftSlot[]>([])
  const [created, setCreated] = useState<string | null>(null)

  const named = name.trim().length > 0

  function chooseCover(file: File | undefined) {
    if (!file) return
    // Released before it is replaced — an object URL holds the file alive
    // until it is revoked, and a form someone fiddles with for a minute
    // should not pin five images in memory.
    if (cover) URL.revokeObjectURL(cover)
    setCover(URL.createObjectURL(file))
  }

  function clearCover() {
    if (cover) URL.revokeObjectURL(cover)
    setCover(null)
    if (coverInput.current) coverInput.current.value = ''
  }

  const addSlot = () =>
    setSlots((all) => [
      ...all,
      { id: `slot-${Date.now()}-${all.length}`, time: '', title: '' },
    ])

  const updateSlot = (id: string, patch: Partial<DraftSlot>) =>
    setSlots((all) =>
      all.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
    )

  const removeSlot = (id: string) =>
    setSlots((all) => all.filter((slot) => slot.id !== id))

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault()
    if (!named) return
    setCreated(name.trim())
  }

  return (
    <div className="add-event">
      <form className="add-event__form" onSubmit={handleSubmit} noValidate>
        <Stack gap={20} className="add-event__container">
          <Link
            className="add-event__back"
            href="/events"
            tone="muted"
            underline="hover"
          >
            <ArrowLeft size={16} aria-hidden="true" focusable="false" />
            Events
          </Link>

          <Stack gap={8}>
            <p className="add-event__eyebrow">
              <Sparkles size={14} aria-hidden="true" focusable="false" />
              New event
            </p>
            <Heading level={1} size="xl" family="serif">
              Add an event
            </Heading>
            <Text tone="muted" className="add-event__lede">
              Give the room a name so the cards you exchange there stay grouped
              together.
            </Text>
          </Stack>

          {/*
            The confirmation lives here rather than replacing the form: this
            page cannot navigate, and a form that empties itself in silence
            looks exactly like one that failed.
          */}
          {created ? (
            <Banner
              tone="success"
              title={`“${created}” is ready`}
              onDismiss={() => setCreated(null)}
              actions={
                <LinkButton href="/events" size="sm" variant="secondary">
                  Back to events
                </LinkButton>
              }
            >
              Nothing was saved — Deck has no data layer. In the product this
              is where the event gets its page and starts collecting cards.
            </Banner>
          ) : null}

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <Heading level={2} size="xs" className="add-event__section-title">
                Basics
              </Heading>

              <Input
                label="Event name"
                placeholder="RevOps Summit"
                required
                value={name}
                onChange={(input) => setName(input.target.value)}
              />

              <div className="add-event__pair">
                <Input
                  label="Host"
                  value={host}
                  onChange={(input) => setHost(input.target.value)}
                />
                <Input
                  label="Host role"
                  placeholder="Organizer"
                  value={role}
                  onChange={(input) => setRole(input.target.value)}
                />
              </div>

              <ChoiceGroup
                label="Your role"
                variant="segmented"
                value={involvement}
                onChange={(value) => setInvolvement(value as EventInvolvement)}
                options={INVOLVEMENTS.map((value) => ({ value, label: value }))}
              />
            </Stack>
          </Card>

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <Heading level={2} size="xs" className="add-event__section-title">
                When
              </Heading>

              <Input
                label="Date"
                placeholder="Tuesday, May 18, 2027"
                iconStart={
                  <CalendarDays size={16} aria-hidden="true" focusable="false" />
                }
                value={date}
                onChange={(input) => setDate(input.target.value)}
              />

              <div className="add-event__triple">
                <Input
                  label="Start time"
                  placeholder="9:00 AM"
                  iconStart={
                    <Clock size={16} aria-hidden="true" focusable="false" />
                  }
                  value={startTime}
                  onChange={(input) => setStartTime(input.target.value)}
                />
                <Input
                  label="End time"
                  placeholder="4:30 PM"
                  iconStart={
                    <Clock size={16} aria-hidden="true" focusable="false" />
                  }
                  value={endTime}
                  onChange={(input) => setEndTime(input.target.value)}
                />
                <Input
                  label="Expected attendees"
                  placeholder="120"
                  inputMode="numeric"
                  value={expected}
                  onChange={(input) => setExpected(input.target.value)}
                />
              </div>

              <div className="add-event__toggle">
                <Switch
                  label="Add to my calendar"
                  description="Puts a hold on your calendar with the venue details."
                  checked={addToCalendar}
                  onChange={(input) => setAddToCalendar(input.target.checked)}
                />
              </div>
            </Stack>
          </Card>

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <Heading level={2} size="xs" className="add-event__section-title">
                Where
              </Heading>

              <Input
                label="Venue"
                placeholder="Austin Convention Center"
                iconStart={
                  <MapPin size={16} aria-hidden="true" focusable="false" />
                }
                value={venue}
                onChange={(input) => setVenue(input.target.value)}
              />

              <div className="add-event__pair">
                <Input
                  label="Address"
                  placeholder="500 E Cesar Chavez St"
                  value={address}
                  onChange={(input) => setAddress(input.target.value)}
                />
                <Input
                  label="City"
                  placeholder="Austin, Texas"
                  value={city}
                  onChange={(input) => setCity(input.target.value)}
                />
              </div>
            </Stack>
          </Card>

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <div className="add-event__section-heading">
                <Heading level={2} size="xs" className="add-event__section-title">
                  Cover image
                </Heading>
                <div className="add-event__section-actions">
                  {/*
                    A real `<input type="file">` with a label styled as a
                    button, rather than a button that clicks a hidden input:
                    the native control is already keyboard-operable and
                    already announces itself, and reaching for `.click()`
                    trades that away for nothing.
                  */}
                  <input
                    ref={coverInput}
                    id={coverInputId}
                    className="deck-visually-hidden add-event__file"
                    type="file"
                    accept="image/*"
                    onChange={(input) => chooseCover(input.target.files?.[0])}
                  />
                  <label
                    className="deck-button deck-button--secondary deck-button--sm"
                    htmlFor={coverInputId}
                  >
                    <span className="deck-button__icon" aria-hidden="true">
                      <Upload />
                    </span>
                    Upload
                  </label>
                  {cover ? (
                    <Button variant="ghost" size="sm" onClick={clearCover}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>

              <Text size="xs" tone="muted">
                Landscape image, 1680×960 recommended. Cropped to fill the
                cover on your event&rsquo;s page.
              </Text>

              <div className="add-event__cover">
                {cover ? (
                  <img
                    className="add-event__cover-photo"
                    src={cover}
                    alt="The cover you chose"
                  />
                ) : (
                  <span className="add-event__cover-empty">
                    No cover image yet
                  </span>
                )}
              </div>
            </Stack>
          </Card>

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <Heading level={2} size="xs" className="add-event__section-title">
                About
              </Heading>
              <Textarea
                label="Description"
                rows={5}
                placeholder="What happens in this room, and who should you look for?"
                description="Separate paragraphs with a blank line."
                value={description}
                onChange={(input) => setDescription(input.target.value)}
              />
            </Stack>
          </Card>

          <Card padding={24} className="add-event__section">
            <Stack gap={16}>
              <div className="add-event__section-heading">
                <Heading level={2} size="xs" className="add-event__section-title">
                  Schedule
                </Heading>
                <Button
                  variant="secondary"
                  size="sm"
                  iconStart={<Plus />}
                  onClick={addSlot}
                >
                  Add slot
                </Button>
              </div>

              {slots.length === 0 ? (
                <Text size="sm" tone="muted" className="add-event__no-slots">
                  No schedule yet. Add a slot to outline the day.
                </Text>
              ) : (
                <ul className="add-event__slots">
                  {slots.map((slot, index) => (
                    <li key={slot.id} className="add-event__slot">
                      <Input
                        label={`Slot ${index + 1} time`}
                        hideLabel
                        placeholder="9:00 AM"
                        value={slot.time}
                        onChange={(input) =>
                          updateSlot(slot.id, { time: input.target.value })
                        }
                      />
                      <Input
                        label={`Slot ${index + 1} description`}
                        hideLabel
                        placeholder="Doors and coffee"
                        value={slot.title}
                        onChange={(input) =>
                          updateSlot(slot.id, { title: input.target.value })
                        }
                      />
                      {/* Named for the slot it removes, so a screen reader
                          hears five distinct controls rather than five
                          identical ones. */}
                      <IconButton
                        label={`Remove slot ${index + 1}`}
                        variant="ghost"
                        icon={<Trash2 />}
                        onClick={() => removeSlot(slot.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Stack>
          </Card>

          <div className="add-event__submit">
            {/* The only gate is a name. Everything else can be filled in on
                the event's own page once it exists. */}
            <Button type="submit" disabled={!named}>
              Create event
            </Button>
            <LinkButton href="/events" variant="ghost">
              Cancel
            </LinkButton>
          </div>
        </Stack>
      </form>
    </div>
  )
}
