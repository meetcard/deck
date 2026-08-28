import { useId } from 'react'
import type { ReactNode } from 'react'
import { Button } from '../Button/Button'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import { Textarea } from '../Textarea/Textarea'
import { cx } from '../../lib/cx'
import './PrivateNote.css'

const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const LockIcon = (
  <svg {...iconProps} aria-hidden="true">
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
    <path d="M5.75 7V5.25a2.25 2.25 0 0 1 4.5 0V7" />
  </svg>
)

const FlameIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M8 1.8s3.2 2.6 3.2 5.6a3.2 3.2 0 0 1-6.4 0c0-1 .4-1.8.9-2.5.3.9.9 1.4.9 1.4s-.3-2.9 1.4-4.5Z" />
  </svg>
)

const SunIcon = (
  <svg {...iconProps} aria-hidden="true">
    <circle cx="8" cy="8" r="2.9" />
    <path d="M8 1.5v1.4M8 13.1v1.4M2.6 2.6l1 1M12.4 12.4l1 1M1.5 8h1.4M13.1 8h1.4M2.6 13.4l1-1M12.4 3.6l1-1" />
  </svg>
)

const SnowflakeIcon = (
  <svg {...iconProps} aria-hidden="true">
    <path d="M8 1.6v12.8M2.5 4.8l11 6.4M2.5 11.2l11-6.4" />
    <path d="M6.4 3.1 8 4.7l1.6-1.6M6.4 12.9 8 11.3l1.6 1.6" />
  </svg>
)

/** How the connection felt. Ordered warmest first, as the prompt implies. */
export type ConnectionFeeling = 'hot' | 'warm' | 'cold'

export interface PrivateNoteProps {
  /** The note text. Controlled. */
  value?: string
  onValueChange?: (value: string) => void
  feeling?: ConnectionFeeling
  onFeelingChange?: (feeling: ConnectionFeeling) => void
  /** Dismiss the note and return to the card's face. */
  onHide?: () => void
  hideLabel?: string
  /** Overrides the reassurance line, e.g. when notes do sync. */
  privacyLabel?: ReactNode
  className?: string
}

const FEELINGS: { value: ConnectionFeeling; label: string; icon: ReactNode }[] =
  [
    { value: 'hot', label: 'Hot', icon: FlameIcon },
    { value: 'warm', label: 'Warm', icon: SunIcon },
    { value: 'cold', label: 'Cold', icon: SnowflakeIcon },
  ]

/**
 * The back of a business card — what you scribble on it after meeting someone.
 *
 * Two questions, in the order you can actually answer them. The feeling is a
 * single tap while you are still standing there; the note is for later, when
 * you remember the thing that will bring the person back to mind. Making the
 * tap first means the card is never left blank just because there was no time
 * to write.
 *
 * The privacy line is not decoration. A note about a person, attached to that
 * person's card, is the kind of thing people hesitate over — saying plainly
 * that it stays on this device is what makes it usable.
 *
 * Dashed borders throughout, to read as something written rather than
 * published — the card's front is set type, this is a pencil mark.
 *
 * @example
 * <PrivateNote
 *   value={note}
 *   onValueChange={setNote}
 *   feeling={feeling}
 *   onFeelingChange={setFeeling}
 *   onHide={flipBack}
 * />
 */
export function PrivateNote({
  value,
  onValueChange,
  feeling,
  onFeelingChange,
  onHide,
  hideLabel = 'Hide',
  privacyLabel = 'Private to you · This device only',
  className,
}: PrivateNoteProps) {
  const headingId = useId()

  return (
    <section
      className={cx('deck-private-note', className)}
      aria-labelledby={headingId}
    >
      <header className="deck-private-note__bar">
        <p className="deck-private-note__privacy">
          <span className="deck-private-note__lock" aria-hidden="true">
            {LockIcon}
          </span>
          {privacyLabel}
        </p>
        {onHide ? (
          <Button variant="ghost" size="sm" onClick={onHide}>
            {hideLabel}
          </Button>
        ) : null}
      </header>

      <h3 className="deck-private-note__heading" id={headingId}>
        How did this connection feel?
      </h3>

      <ChoiceGroup
        label="How did this connection feel?"
        hideLabel
        variant="pill"
        value={feeling}
        onChange={(next) => onFeelingChange?.(next as ConnectionFeeling)}
        options={FEELINGS.map(({ value: v, label, icon }) => ({
          value: v,
          label: (
            <span className="deck-private-note__feeling">
              <span
                className={`deck-private-note__feeling-icon deck-private-note__feeling-icon--${v}`}
                aria-hidden="true"
              >
                {icon}
              </span>
              {label}
            </span>
          ),
        }))}
        className="deck-private-note__feelings"
      />

      <Textarea
        label="How do you remember them?"
        hideLabel
        placeholder="How do you remember them?"
        rows={3}
        resize="none"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
        fieldClassName="deck-private-note__field"
      />
    </section>
  )
}
