import { useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import './CodeSnippet.css'

export interface CodeSnippetProps {
  /** The code, exactly as it should be pasted. Newlines are preserved. */
  code: string
  /** Names the block, e.g. "Inline embed". Shown unless `hideLabel`. */
  label: ReactNode
  /** Keep the label for screen readers but hide it visually. */
  hideLabel?: boolean
  /** A line under the label saying where this goes. */
  description?: ReactNode
  /** Accessible name for the copy control, before a copy succeeds. */
  copyLabel?: string
  id?: string
  className?: string
}

const CopyIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
    <path
      d="M7.5 7.5V4.75A1.25 1.25 0 0 1 8.75 3.5h6.5A1.25 1.25 0 0 1 16.5 4.75v6.5a1.25 1.25 0 0 1-1.25 1.25H12.5M4.75 7.5h6.5A1.25 1.25 0 0 1 12.5 8.75v6.5a1.25 1.25 0 0 1-1.25 1.25h-6.5A1.25 1.25 0 0 1 3.5 15.25v-6.5A1.25 1.25 0 0 1 4.75 7.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false">
    <path
      d="m5 10.5 3.5 3.5L15 6.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * A block of code to copy and paste — an embed tag, a webhook payload, a CLI
 * line.
 *
 * `CopyField`'s sibling for the case where the value is more than one line
 * and its shape matters. A single-line `input` collapses newlines and hides
 * everything past its own width, which is exactly wrong for a snippet whose
 * indentation and line breaks are the thing being copied.
 *
 * The code stays real, selectable `<code>` text rather than an input, so it
 * can be read, partially selected, and copied by hand when the clipboard API
 * is unavailable or denied. Wide lines scroll inside the block; the page
 * never does.
 *
 * @example
 * <CodeSnippet label="Inline embed" description="Paste into any page."
 *   code={'<script src="https://cdn.meetcard.io/embed.js" async></script>'} />
 */
export function CodeSnippet({
  code,
  label,
  hideLabel = false,
  description,
  copyLabel = 'Copy code',
  id: providedId,
  className,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)
  const { id, descriptionId, describedBy } = useFieldIds({
    id: providedId,
    hasDescription: Boolean(description),
    hasError: false,
  })

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Denied or unavailable — the code is selectable text, so copying it
      // by hand still works.
    }
  }

  return (
    <div className={cx('deck-code-snippet', className)}>
      <span
        id={`${id}-label`}
        className={cx('deck-field__label', hideLabel && 'deck-visually-hidden')}
      >
        {label}
      </span>

      {description ? (
        <p id={descriptionId} className="deck-field__description">
          {description}
        </p>
      ) : null}

      <div className="deck-code-snippet__frame">
        {/* `tabIndex` because the block scrolls: a region a mouse can pan
            must be reachable by keyboard, or its overflow is unreadable
            without one. `group` gives it a name to be announced by. */}
        <pre
          className="deck-code-snippet__pre"
          tabIndex={0}
          role="group"
          aria-labelledby={`${id}-label`}
          aria-describedby={describedBy}
        >
          <code id={id} className="deck-code-snippet__code">
            {code}
          </code>
        </pre>

        <button
          type="button"
          className={cx(
            'deck-code-snippet__copy',
            copied && 'deck-code-snippet__copy--copied',
          )}
          aria-label={copied ? 'Copied' : copyLabel}
          onClick={handleCopy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  )
}
