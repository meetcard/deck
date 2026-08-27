import { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar } from '../../components/Avatar/Avatar'
import { Button } from '../../components/Button/Button'
import { Sheet } from '../../components/Sheet/Sheet'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import './Exchange.css'

/* ---- Icons ------------------------------------------------------------ */

const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const HandshakeIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M1.8 8.2 4.4 5.6a1.4 1.4 0 0 1 2 0l1.2 1.2M14.2 8.2 11.6 5.6a1.4 1.4 0 0 0-2 0L6.4 8.8" />
    <path d="m6.4 8.8 1.4 1.4a1.2 1.2 0 0 0 1.7 0M8 12.4l.9.9a1.2 1.2 0 0 0 1.7-1.7" />
  </svg>
)

const CheckIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
)

const NoteIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M9 1.8H4a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.8Z" />
    <path d="M9 1.8V5.8h4M5.5 9h5M5.5 11.5h3" />
  </svg>
)

const CalendarIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="2" y="3" width="12" height="11" rx="1.5" />
    <path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
  </svg>
)

const SaveIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M8 2v7.5M5 7l3 3 3-3M2.5 12.5v1h11v-1" />
  </svg>
)

/* ---- Model ------------------------------------------------------------ */

export interface ExchangePerson {
  name: string
  role: string
  company: string
  avatarSrc?: string
}

/**
 * `greeting` and `trading` are the two beats of the animation; `done` is the
 * receipt. They are one state machine rather than a boolean plus a timer so
 * that the reduced-motion path is expressible as "start at `done`" instead of
 * "run the same sequence faster".
 */
type Stage = 'greeting' | 'trading' | 'done'

/** How long each animated beat holds, in ms. `done` is terminal. */
const BEAT: Record<Exclude<Stage, 'done'>, number> = {
  greeting: 900,
  trading: 1000,
}

const NEXT: Record<Exclude<Stage, 'done'>, Stage> = {
  greeting: 'trading',
  trading: 'done',
}

/* ---- Card ------------------------------------------------------------- */

/**
 * The small card that flies during the exchange.
 *
 * Deliberately not `PersonCard`: that is the full business-card artifact and
 * the canonical child of `CardPile`, sized to real card proportions with
 * room for contact actions and a private note. Here the card is a motion
 * affordance — it is rotated, half-occluded, and on screen for under a
 * second — so it carries only what survives at that size. Type and colour
 * still come from Deck so it does not drift from the real thing.
 */
function FlyingCard({
  person,
  side,
}: {
  person: ExchangePerson
  side: 'mine' | 'theirs'
}) {
  return (
    <div className={`exchange-card exchange-card--${side}`}>
      <Avatar name={person.name} src={person.avatarSrc} size="sm" decorative />
      <div className="exchange-card__body">
        <Text size="sm" weight="semibold">
          {person.name}
        </Text>
        <Text size="xs" tone="muted">
          {person.role}
        </Text>
        <Text size="xs" tone="muted" className="exchange-card__company">
          {person.company}
        </Text>
      </div>
    </div>
  )
}

/* ---- Page ------------------------------------------------------------- */

export interface ExchangeProps {
  /** The signed-in person, whose card is shared. */
  me?: ExchangePerson
  /** Whose card is being collected — the public card you opened. */
  them?: ExchangePerson
  /** Open the sheet on mount, for stories and deep links. */
  defaultOpen?: boolean
  /** Skip the animation and land on the receipt. Stories set this directly;
   *  at runtime `prefers-reduced-motion` does the same thing. */
  skipAnimation?: boolean
}

const ME: ExchangePerson = {
  name: 'Alex Rivera',
  role: 'Design Lead',
  company: 'Northwind Studio',
}

const THEM: ExchangePerson = {
  name: 'Ben Ackles',
  role: 'Product Marketing',
  company: 'MeetCard',
}

/**
 * Exchange — trading cards with someone whose public card you have open.
 *
 * The sheet opens already exchanging. There is no confirm step, because the
 * tap on "Exchange cards" *was* the confirmation: asking twice would make a
 * two-second moment into a four-second one while two people stand there. For
 * the same reason there is no form — the signed-in identity is assumed and
 * offered back for correction ("Not you?") rather than requested up front.
 *
 * The animation is doing work, not decorating: two cards leaning together and
 * then crossing is what makes a *mutual* exchange legible. A spinner would
 * say "waiting" and not say "both directions".
 *
 * Under `prefers-reduced-motion` it renders the receipt immediately. Deck
 * collapses durations to 0ms in that mode, which for a sequence that carries
 * state would flash all three captions in one frame — so this skips the beats
 * rather than shortening them.
 */
export function Exchange({
  me = ME,
  them = THEM,
  defaultOpen = false,
  skipAnimation = false,
}: ExchangeProps) {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const instant = skipAnimation || prefersReducedMotion

  const [open, setOpen] = useState(defaultOpen)
  // Lazy, and seeded from `instant`: opening via `defaultOpen` never runs
  // `start`, so without this the beats play even when they were skipped.
  const [stage, setStage] = useState<Stage>(() => (instant ? 'done' : 'greeting'))
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const start = useCallback(() => {
    setStage(instant ? 'done' : 'greeting')
    setOpen(true)
  }, [instant])

  // Advance through the beats. Re-runs on each stage change, so one timer is
  // ever outstanding and closing the sheet clears it.
  useEffect(() => {
    if (!open || stage === 'done') return
    timer.current = setTimeout(() => setStage(NEXT[stage]), BEAT[stage])
    return () => clearTimeout(timer.current)
  }, [open, stage])

  const close = () => {
    clearTimeout(timer.current)
    setOpen(false)
  }

  const title =
    stage === 'greeting'
      ? 'Shaking hands…'
      : stage === 'trading'
        ? 'Exchanging cards…'
        : 'Cards exchanged'

  const description =
    stage === 'done'
      ? `You and ${them.name.split(' ')[0]} now have each other's contact.`
      : 'Both cards are being shared — no typing needed.'

  return (
    <div className="exchange-page">
      <Button iconStart={HandshakeIcon} onClick={start}>
        Exchange cards
      </Button>

      <Sheet
        open={open}
        onClose={close}
        title={title}
        description={description}
        placement="center"
      >
        {/*
          The caption changes while the sheet stays open, so the title alone
          would not be announced. This live region carries the stage to a
          screen reader; the cards themselves are decorative during motion.
        */}
        <p className="exchange__status" role="status" aria-live="polite">
          {title}
        </p>

        {stage === 'done' ? (
          <Stack gap={16}>
            <p className="exchange__badge">
              <span className="exchange__badge-icon">{CheckIcon}</span>
              Exchange complete
            </p>

            <div className="exchange__receipt">
              <div className="exchange__slot">
                <Text size="xs" tone="muted" className="exchange__slot-label">
                  You received
                </Text>
                <FlyingCard person={them} side="theirs" />
              </div>
              <div className="exchange__slot">
                <Text size="xs" tone="muted" className="exchange__slot-label">
                  You shared
                </Text>
                <FlyingCard person={me} side="mine" />
              </div>
            </div>

            <p className="exchange__saved">
              <span className="exchange__badge-icon">{CheckIcon}</span>
              Saved to both MeetCard networks
            </p>

            {/* The moment should lead somewhere: these are what you actually
                do next, while you are still standing in front of them. */}
            <div className="exchange__next">
              <Button variant="secondary" iconStart={NoteIcon}>
                Add note
              </Button>
              <Button variant="secondary" iconStart={CalendarIcon}>
                Book time
              </Button>
              <Button variant="secondary" iconStart={SaveIcon}>
                Save contact
              </Button>
            </div>

            <Button fullWidth onClick={close}>
              Done
            </Button>
          </Stack>
        ) : (
          <Stack gap={16}>
            <div
              className={`exchange__stage exchange__stage--${stage}`}
              aria-hidden="true"
            >
              <FlyingCard person={me} side="mine" />
              <FlyingCard person={them} side="theirs" />
              <span className="exchange__seal">{HandshakeIcon}</span>
            </div>

            <p className="exchange__identity">
              <span className="exchange__badge-icon">{CheckIcon}</span>
              Signed in as <strong>{me.name.split(' ')[0]}</strong> ·{' '}
              {me.company}
            </p>

            <Button variant="ghost" size="sm">
              Not you? Share a different card
            </Button>
          </Stack>
        )}
      </Sheet>
    </div>
  )
}
