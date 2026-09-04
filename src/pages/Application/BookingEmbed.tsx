import { useState } from 'react'
import { Check, Code, Copy } from 'lucide-react'
import { ChoiceGroup } from '../../components/ChoiceGroup/ChoiceGroup'
import { IconButton } from '../../components/IconButton/IconButton'
import { SettingsRow } from './SettingsPanel'

/**
 * How the widget presents itself on someone else's page: laid into the flow
 * of the page, or a button that opens the booker over it.
 */
export type EmbedDisplay = 'inline' | 'button'

const DISPLAYS = [
  { value: 'inline', label: 'Inline' },
  { value: 'button', label: 'Button' },
]

/** Where the widget's script is served from. */
const EMBED_SRC = 'https://cdn.meetcard.io/embed.js'

/**
 * The two lines someone pastes into their own page.
 *
 * Built here rather than stored, so the snippet cannot disagree with the
 * controls above it: changing the display re-renders the string, and there is
 * no second copy of it to fall out of date.
 */
function embedSnippet(
  type: 'person' | 'team',
  identifier: string,
  display: EmbedDisplay,
): string {
  /* A person's widget resolves a handle; a team's resolves the company. Same
     element either way — the attribute is what says which booker it opens. */
  const subject = type === 'person' ? 'handle' : 'company'

  return [
    `<script src="${EMBED_SRC}" async></script>`,
    `<meetcard-book type="${type}" ${subject}="${identifier}" display="${display}"></meetcard-book>`,
  ].join('\n')
}

export interface BookingEmbedProps {
  /** Whose calendar the widget books — one person's, or the team's. */
  type: 'person' | 'team'
  /** The handle a person's widget resolves, or the company's identifier. */
  identifier: string
  /** Which display the snippet opens on. */
  defaultDisplay?: EmbedDisplay
}

/**
 * Put the booker on your own website.
 *
 * The same band on Profile and on Company, because it is the same offer made
 * about two different bookers — and a second copy of it would be the place the
 * two quietly grew different wording.
 *
 * The snippet is generated from the controls rather than typed out, which is
 * the only reason the display toggle can sit above it: what you read is what
 * you would paste, at every moment, without a "regenerate" step to forget.
 *
 * Copying follows `CopyField`'s pattern — the icon and the control's name both
 * change on success, so the confirmation is not a colour. The code is real
 * text in a `<pre>`, so it stays selectable when the clipboard is unavailable
 * or denied.
 */
export function BookingEmbed({
  type,
  identifier,
  defaultDisplay = 'inline',
}: BookingEmbedProps) {
  const [display, setDisplay] = useState<EmbedDisplay>(defaultDisplay)
  const [copied, setCopied] = useState(false)

  const snippet = embedSnippet(type, identifier, display)

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard denied or unavailable — the snippet stays selectable in the
      // block as a manual fallback, which is why it is text and not an image.
    }
  }

  return (
    <SettingsRow
      icon={<Code />}
      title="Embed on your website"
      description="Add a booking widget to any page."
      action={
        <ChoiceGroup
          label="Embed type"
          hideLabel
          variant="segmented"
          options={DISPLAYS}
          value={display}
          onChange={(next) => setDisplay(next as EmbedDisplay)}
        />
      }
    >
      <div className="settings__snippet">
        {/*
          Wrapped rather than scrolled sideways. A `<pre>` that scrolls is a
          region a keyboard cannot reach without a tab stop of its own, and in
          a settings column two-thirds of the snippet would be off the edge —
          `pre-wrap` keeps the line breaks that matter and folds the rest.
        */}
        <pre className="settings__snippet-code">
          <code>{snippet}</code>
        </pre>

        <IconButton
          className="settings__snippet-copy"
          label={copied ? 'Copied' : 'Copy embed code'}
          variant="ghost"
          size="sm"
          icon={copied ? <Check /> : <Copy />}
          onClick={copy}
        />
      </div>
    </SettingsRow>
  )
}
