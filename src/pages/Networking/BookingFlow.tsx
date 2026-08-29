import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BookingCelebration } from '../../components/BookingCelebration/BookingCelebration'
import { BookingSummary } from '../../components/BookingSummary/BookingSummary'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import type { ChoiceOption } from '../../components/ChoiceGroup/ChoiceGroup'
import { DayStrip } from '../../components/DayStrip/DayStrip'
import { Heading } from '../../components/Heading/Heading'
import { Input } from '../../components/Input/Input'
import { Stack } from '../../components/Stack/Stack'
import { Stepper } from '../../components/Stepper/Stepper'
import type { Step } from '../../components/Stepper/Stepper'
import { Text } from '../../components/Text/Text'
import { Textarea } from '../../components/Textarea/Textarea'
import { TimeSlotPicker } from '../../components/TimeSlotPicker/TimeSlotPicker'
import './BookingFlow.css'

/* ---- Demo data -------------------------------------------------------- */

export interface TeamMember {
  id: string
  name: string
  role: string
  /** Topics this person handles, matched against the purpose step. */
  topics: string[]
  /** Human-readable next opening, e.g. "Thu 9:30 AM". */
  nextAvailable: string
}

const TEAM: TeamMember[] = [
  {
    id: 'priya',
    name: 'Priya Shah',
    role: 'Account Executive',
    topics: ['sales', 'partnership'],
    nextAvailable: 'Thu 9:30 AM',
  },
  {
    id: 'marcus',
    name: 'Marcus Lee',
    role: 'Solutions Engineer',
    topics: ['demo', 'sales'],
    nextAvailable: 'Thu 11:00 AM',
  },
  {
    id: 'ana',
    name: 'Ana Duarte',
    role: 'Head of Partnerships',
    topics: ['partnership'],
    nextAvailable: 'Fri 2:00 PM',
  },
]

const TOPICS = [
  { value: 'sales', label: 'Sales inquiry' },
  { value: 'demo', label: 'Product demo' },
  { value: 'partnership', label: 'Partnership' },
]

const DURATIONS: ChoiceOption[] = [
  { value: '15', label: '15 min', description: 'Quick question' },
  { value: '30', label: '30 min', description: 'Most popular' },
  { value: '45', label: '45 min', description: 'Deep dive' },
]

const DAYS = [
  { date: '2026-09-01', slotCount: 2 },
  { date: '2026-09-02', slotCount: 6 },
  { date: '2026-09-03', slotCount: 9 },
  { date: '2026-09-04', slotCount: 4 },
  { date: '2026-09-05', slotCount: 0 },
  { date: '2026-09-08', slotCount: 7 },
  { date: '2026-09-09', slotCount: 3 },
  { date: '2026-09-10', slotCount: 0 },
  { date: '2026-09-11', slotCount: 5 },
]

const SLOTS = [
  { time: '09:00' },
  { time: '09:30' },
  { time: '10:00', taken: true },
  { time: '10:30' },
  { time: '11:00' },
  { time: '13:00' },
  { time: '14:00' },
  { time: '14:30', taken: true },
  { time: '15:30' },
  { time: '17:00' },
  { time: '17:30' },
]

const TIME_ZONE = 'America/Denver'

/* ---- Icons ------------------------------------------------------------ */

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="3.5" width="12" height="10.5" rx="1.5" />
    <path d="M2 6.5h12M5.5 2v3M10.5 2v3" />
  </svg>
)

const VideoIcon = () => (
  <svg {...iconProps}>
    <rect x="1.5" y="4" width="9" height="8" rx="1.5" />
    <path d="m10.5 8 4-2.5v5L10.5 8Z" />
  </svg>
)

const PersonIcon = () => (
  <svg {...iconProps}>
    <circle cx="8" cy="5.5" r="2.5" />
    <path d="M3 13.5a5 5 0 0 1 10 0" />
  </svg>
)

/* ---- Flow ------------------------------------------------------------- */

export type BookingMode = 'individual' | 'team'

export interface BookingFlowProps {
  /**
   * `individual` books a named person directly; `team` inserts a step that
   * routes to whoever on the team handles the chosen topic.
   */
  mode?: BookingMode
  /** Person being booked, for `individual`. */
  personName?: string
  companyName?: string
  /**
   * Play the celebration on the booked step. Off lands straight on the same
   * confirmation without the motion — which is also what
   * `prefers-reduced-motion` does regardless of this setting.
   */
  celebrate?: boolean
}

type StepId = 'purpose' | 'availability' | 'team' | 'details' | 'booked'

/**
 * The MeetCard booking wizard, in both of its shapes.
 *
 * Team booking is not a separate flow — it is the individual flow with one
 * extra step, and once a team member is chosen the two converge completely:
 * the header resolves from the company to that person, and every remaining
 * step is identical. Modelling it as one component with a `mode` is what
 * keeps the two from drifting apart.
 */
export function BookingFlow({
  mode = 'individual',
  personName = 'Ben Ackles',
  companyName = 'MeetCard',
  celebrate = true,
}: BookingFlowProps) {
  const isTeam = mode === 'team'

  const [stepId, setStepId] = useState<StepId>('purpose')
  const [topic, setTopic] = useState<string>()
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState<string>()
  const [day, setDay] = useState<string>()
  const [time, setTime] = useState<string>()
  const [memberId, setMemberId] = useState<string>()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const steps: Step[] = useMemo(
    () =>
      [
        { id: 'purpose', label: 'Purpose' },
        { id: 'availability', label: 'Availability' },
        ...(isTeam ? [{ id: 'team', label: 'Team' }] : []),
        { id: 'details', label: 'Details' },
        { id: 'booked', label: 'Booked', terminal: true },
      ] as Step[],
    [isTeam],
  )

  /** Team members who handle the chosen topic. */
  const matches = useMemo(
    () => (topic ? TEAM.filter((m) => m.topics.includes(topic)) : TEAM),
    [topic],
  )
  const member = TEAM.find((m) => m.id === memberId)

  /*
   * Who the booking is with. In team mode this starts as the company and
   * resolves to a person at the team step — the single clearest signal that
   * the two flows have converged.
   */
  const subject = isTeam
    ? member
      ? `${member.name} at ${companyName}`
      : companyName
    : `${personName} at ${companyName}`

  const topicLabel = TOPICS.find((t) => t.value === topic)?.label ?? ''

  /*
   * Routing is explained at the moment of choosing, not after: picking a
   * topic in team mode says who it will reach, so the Team step confirms an
   * expectation instead of springing a stranger on you.
   */
  const topicOptions: ChoiceOption[] = TOPICS.map((option) => {
    if (!isTeam) return option
    const owners = TEAM.filter((m) => m.topics.includes(option.value))
    return {
      ...option,
      hint:
        owners.length === 1
          ? `Routes to ${owners[0].name}.`
          : `${owners.length} people can help with this.`,
    }
  })

  const dayLabel = day
    ? new Date(`${day}T12:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''
  const timeLabel = time
    ? new Date(`2026-01-01T${time}:00`).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  const summaryItems = [
    {
      icon: <CalendarIcon />,
      label: dayLabel,
      detail: `${timeLabel} · ${duration} min`,
      onEdit: () => setStepId('availability'),
      editLabel: 'Change date and time',
    },
    ...(member
      ? [
          {
            icon: <PersonIcon />,
            label: member.name,
            detail: `${member.role} · ${topicLabel}`,
            onEdit: () => setStepId('team'),
            editLabel: 'Change team member',
          },
        ]
      : []),
    {
      icon: <VideoIcon />,
      label: 'Video call',
      detail: `Link sent with your confirmation · ${TIME_ZONE}`,
    },
  ]

  /* Each step names what it needs, its CTA, and where it goes next. */
  const flow: Record<
    StepId,
    { ready: boolean; cta: string; next: StepId } | undefined
  > = {
    purpose: {
      ready: Boolean(topic),
      cta: 'Find a time that works',
      next: 'availability',
    },
    availability: {
      ready: Boolean(duration && day && time),
      cta: isTeam ? 'See who can help' : 'Finally, your details',
      next: isTeam ? 'team' : 'details',
    },
    team: {
      ready: Boolean(memberId),
      cta: 'Finally, your details',
      next: 'details',
    },
    details: {
      ready: Boolean(firstName && lastName && email),
      cta: 'Confirm booking',
      next: 'booked',
    },
    booked: undefined,
  }

  const current = flow[stepId]

  /* Only steps already completed are navigable, so the stepper can't skip
     ahead past a decision the next step depends on. */
  const currentIndex = steps.findIndex((s) => s.id === stepId)
  const handleStepSelect = (id: string) => {
    if (steps.findIndex((s) => s.id === id) < currentIndex) {
      setStepId(id as StepId)
    }
  }

  let body: ReactNode = null

  if (stepId === 'purpose') {
    body = (
      <Stack gap={24}>
        <ChoiceGroup
          label="What are you looking to discuss?"
          required
          options={topicOptions}
          value={topic}
          onChange={setTopic}
        />
        <Textarea
          label="What would you like to accomplish?"
          placeholder="Briefly describe what you're trying to accomplish and what a successful meeting would look like."
          rows={4}
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </Stack>
    )
  }

  if (stepId === 'availability') {
    /*
     * Revealed in sequence rather than all at once: a day strip is only
     * meaningful once a duration is set, and times only once a day is. Each
     * answer earns the next question.
     */
    body = (
      <Stack gap={24}>
        <ChoiceGroup
          label="How long do you need?"
          variant="tile"
          options={DURATIONS}
          value={duration}
          onChange={(value) => {
            setDuration(value)
            setTime(undefined)
          }}
        />
        {duration && (
          /* The zone label lives on the time picker below rather than here —
             it is times that are zone-sensitive to read, and stacking the
             same label twice within one step just adds noise. */
          <DayStrip
            days={DAYS}
            value={day}
            onChange={(value) => {
              setDay(value)
              setTime(undefined)
            }}
            today="2026-09-01"
          />
        )}
        {duration && day && (
          <TimeSlotPicker
            slots={SLOTS}
            value={time}
            onChange={setTime}
            timeZone={TIME_ZONE}
          />
        )}
      </Stack>
    )
  }

  if (stepId === 'team') {
    body = (
      <ChoiceGroup
        label="Choose a team member"
        description={
          topicLabel
            ? `Everyone below handles ${topicLabel.toLowerCase()}.`
            : undefined
        }
        variant="tile"
        columns={Math.min(matches.length, 3) as 2 | 3}
        value={memberId}
        onChange={setMemberId}
        options={matches.map((m) => ({
          value: m.id,
          label: m.name,
          /* The next opening is what makes this a real choice rather than a
             list of names — otherwise everyone looks equally available. */
          description: `${m.role} · next ${m.nextAvailable}`,
        }))}
      />
    )
  }

  if (stepId === 'details') {
    body = (
      <Stack gap={24}>
        <BookingSummary items={summaryItems} />
        <div className="deck-booking__name-row">
          <Input
            label="First name"
            required
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <Input
            label="Last name"
            required
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Stack>
    )
  }

  if (stepId === 'booked') {
    body = (
      <BookingCelebration
        skipAnimation={!celebrate}
        caption={`A calendar invite is on its way to ${email || 'your inbox'}.`}
        summary={
          // The recap loses its edit controls here: the booking is made, so a
          // "Change" button would offer something this step cannot do.
          <BookingSummary items={summaryItems.map(({ onEdit: _onEdit, ...item }) => item)} />
        }
      />
    )
  }

  return (
    <div className="deck-booking">
      <Card className="deck-booking__card" padding={32}>
        <Stack gap={24}>
          <Stack gap={4}>
            <Text
              size="xs"
              tone="muted"
              className="deck-booking__eyebrow"
            >
              Book with
            </Text>
            {/* Serif is Deck's signature moment — reserved for the name you
                are actually booking, which is the page's whole subject. */}
            <Heading level={1} size="xl" family="serif">
              {subject}
            </Heading>
          </Stack>

          <Stepper
            steps={steps}
            currentStepId={stepId}
            onSelect={handleStepSelect}
            label="Booking progress"
          />

          {body}

          {current && (
            <Button
              size="lg"
              fullWidth
              disabled={!current.ready}
              onClick={() => setStepId(current.next)}
            >
              {current.cta}
            </Button>
          )}
        </Stack>
      </Card>
    </div>
  )
}
