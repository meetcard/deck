import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
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

/*
 * The feeling icons are Lucide's flame, sun and snowflake (ISC), drawn inline
 * on a 24 grid at stroke 2 rather than imported. `lucide-react` is a dev
 * dependency here and never ships: `src/components` goes into `dist/deck.js`,
 * which is a zero-dependency bundle, and `grep -c lucide dist/deck.js` is a
 * check this repo intends to keep answering 0.
 *
 * These replace three hand-drawn 16-grid glyphs at stroke 1.5. The difference
 * is not decorative: at 14px a 1.5 stroke on a 16 grid renders thin and
 * slightly soft, and a snowflake simplified to three crossed lines is a
 * asterisk. Lucide's snowflake keeps its six barbs, which is what makes it
 * read as cold rather than as a footnote marker.
 */
const feelingIconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const FlameIcon = (
  <svg {...feelingIconProps}>
    <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
  </svg>
)

const SunIcon = (
  <svg {...feelingIconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

/*
 * Lucide's twelve segments, transcribed exactly rather than simplified. The
 * first attempt drew the axes as two full-length strokes through the middle
 * (`M2 12h20M12 2v20`) with the barbs laid over them, which is a different
 * icon: lucide's arms are kinked — each one steps off the axis where its
 * barbs meet it — so the six points radiate from a small open centre instead
 * of crossing at one. At 14px that difference is most of the character.
 */
const SnowflakeIcon = (
  <svg {...feelingIconProps}>
    <path d="m10 20-1.25-2.5L6 18" />
    <path d="M10 4 8.75 6.5 6 6" />
    <path d="m14 20 1.25-2.5L18 18" />
    <path d="m14 4 1.25 2.5L18 6" />
    <path d="m17 21-3-6h-4" />
    <path d="m17 3-3 6 1.5 3" />
    <path d="M2 12h6.5L10 9" />
    <path d="m20 10-1.5 2 1.5 2" />
    <path d="M22 12h-6.5L14 15" />
    <path d="m4 10 1.5 2L4 14" />
    <path d="m7 21 3-6-1.5-3" />
    <path d="m7 3 3 6h4" />
  </svg>
)

/*
 * Lucide's pencil, on the same 24 grid at stroke 2 as the feelings above it —
 * they sit within 100px of each other, and a 16-grid glyph at stroke 1.5
 * beside them reads as a lighter weight rather than a different icon.
 */
const PencilIcon = (
  <svg {...feelingIconProps}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
)

/** How the connection felt. Ordered warmest first, as the prompt implies. */
export type ConnectionFeeling = 'hot' | 'warm' | 'cold'

export interface PrivateNoteProps {
  /**
   * The note text. Controlled, and committed rather than live: this is the
   * saved note, and it changes when the writer saves rather than as they
   * type. While they are editing, the draft lives here.
   */
  value?: string
  /** Called with the new note on save. Never on keystroke, never on cancel. */
  onValueChange?: (value: string) => void
  feeling?: ConnectionFeeling
  onFeelingChange?: (feeling: ConnectionFeeling) => void
  /** Dismiss the note and return to the card's face. */
  onHide?: () => void
  hideLabel?: string
  /** Overrides the reassurance line, e.g. when notes do sync. */
  privacyLabel?: ReactNode
  /** The prompt shown on the closed field, and inside the open one. */
  placeholder?: string
  /** Open the editor on mount, for stories and deep links. */
  defaultEditing?: boolean
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
 * The note itself is closed until you mean to write. A standing textarea on
 * the back of a card is a chore with a cursor in it; a line of prose with a
 * pencil beside it is an invitation, and it gives the writing room back to
 * the card until it is wanted. Opening it brings Cancel and Save, which is
 * what makes the field safe to open: you can look, think better of it, and
 * leave without having changed the note.
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
  placeholder = 'How do you remember them?',
  defaultEditing = false,
  className,
}: PrivateNoteProps) {
  const headingId = useId()

  const [editing, setEditing] = useState(defaultEditing)
  /* Seeded at each open rather than kept in sync with `value`: the draft is
     the writer's, and a save elsewhere should not rewrite what they are in
     the middle of typing. */
  const [draft, setDraft] = useState(value ?? '')

  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  /* Focus follows the state change, in both directions — opening puts the
     cursor where the writing happens, and closing returns it to the control
     that was pressed rather than dropping it on the body.

     Keyed off the *transition*, so mounting with `defaultEditing` never
     grabs focus: a card that steals the cursor as it renders is worse than
     one that makes you click twice. */
  const wasEditing = useRef(editing)
  useEffect(() => {
    if (editing && !wasEditing.current) fieldRef.current?.focus()
    else if (!editing && wasEditing.current) triggerRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  const open = () => {
    setDraft(value ?? '')
    setEditing(true)
  }

  const cancel = () => {
    setDraft(value ?? '')
    setEditing(false)
  }

  const save = () => {
    onValueChange?.(draft)
    setEditing(false)
  }

  /* Nothing typed, nothing to save. The disabled Save is also the answer to
     "did that go through?" — it only lights up when there is a change. */
  const dirty = draft !== (value ?? '')

  const onFieldKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      /* Both, deliberately: `stopPropagation` keeps a card inside a Sheet
         from closing the Sheet, and `preventDefault` stops the browser's own
         close request doing the same over our heads. Escape here means
         "abandon this edit", which is the innermost thing it could mean. */
      event.preventDefault()
      event.stopPropagation()
      cancel()
      return
    }
    /* The shortcut anyone who writes in a box already has in their hands. */
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && dirty) {
      event.preventDefault()
      save()
    }
  }

  return (
    <section
      className={cx(
        'deck-private-note',
        editing && 'deck-private-note--editing',
        className,
      )}
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

      <h3
        className={cx(
          'deck-private-note__heading',
          editing && 'deck-visually-hidden',
        )}
        id={headingId}
      >
        How did this connection feel?
      </h3>

      <ChoiceGroup
        label="How did this connection feel?"
        hideLabel
        variant="segmented"
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

      {/* The rule is what makes the note a second question rather than a
          third option in the row above it. Open, the field's own border is
          already that line, and the card has no pixels to spend twice. */}
      {editing ? null : <hr className="deck-private-note__rule" />}

      {editing ? (
        <>
          <Textarea
            ref={fieldRef}
            label={placeholder}
            hideLabel
            placeholder={placeholder}
            rows={2}
            resize="none"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onFieldKeyDown}
            fieldClassName="deck-private-note__field"
          />

          <div className="deck-private-note__actions">
            <Button variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty}>
              Save
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          className="deck-private-note__trigger"
          onClick={open}
          /* The note's own words belong in the name — a screen reader should
             read what is written there, not a label about it. Built as one
             string rather than as a visually hidden prefix beside the text:
             adjacent inline elements are concatenated *without* a separator
             when the name is computed, which spelled it "Edit note:Wants an
             intro to Priya". */
          aria-label={
            value ? `Edit note: ${value}` : `Add a note: ${placeholder}`
          }
        >
          <span
            className={cx(
              'deck-private-note__preview',
              !value && 'deck-private-note__preview--empty',
            )}
          >
            {value || placeholder}
          </span>
          <span className="deck-private-note__pencil" aria-hidden="true">
            {PencilIcon}
          </span>
        </button>
      )}
    </section>
  )
}
