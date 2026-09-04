import { useId } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { Button } from '../../components/Button/Button'
import { Card } from '../../components/Card/Card'
import { Divider } from '../../components/Divider/Divider'
import { Field } from '../../components/Field/Field'
import { Heading } from '../../components/Heading/Heading'
import { Stack } from '../../components/Stack/Stack'
import { Text } from '../../components/Text/Text'
import { cx } from '../../lib/cx'

/**
 * The chrome every Settings panel shares.
 *
 * Eight panels is enough that the header, the section rule and the save bar
 * have to be one thing rather than eight nearly-identical things — the moment
 * they are copied, one of them grows a different heading level or a different
 * gap and the area stops reading as a single page.
 *
 * These live here rather than in `src/components` deliberately. They are the
 * composition of a page, not parts of the system: `Card`, `Heading`, `Stack`
 * and `Divider` are doing all the actual work, and there is nothing here
 * another product would want to import.
 */

/* ---- Panel -------------------------------------------------------------- */

export interface SettingsPanelProps {
  /**
   * Which section this is, repeated from the nav. Omitted on a sub-page,
   * where the breadcrumb already says it and better — "Billing › Plans"
   * places you, where "BILLING" above "Available plans" only half does.
   */
  eyebrow?: string
  /** The eyebrow's glyph. Decorative — `eyebrow` is the name. */
  icon?: ReactNode
  /** What the panel is for, in the panel's own words. */
  title: string
  description: ReactNode
  /** Sits above the header — the breadcrumb on a sub-page. */
  before?: ReactNode
  /** The save bar, when the panel has one. */
  footer?: ReactNode
  children: ReactNode
}

/**
 * One section of Settings, framed.
 *
 * The heading is an `h2` under the page's own `h1`, which makes each section
 * heading inside it an `h3` and each row title an `h4`. That ordering is the
 * only reason the whole area is navigable by headings, so panels should reach
 * for `SettingsSection` rather than writing their own.
 */
export function SettingsPanel({
  eyebrow,
  icon,
  title,
  description,
  before,
  footer,
  children,
}: SettingsPanelProps) {
  return (
    <Card as="section" padding={24} className="settings__panel">
      <Stack gap={24}>
        <header className="settings__panel-header">
          {before}
          {eyebrow ? (
            <p className="settings__eyebrow">
              {icon ? (
                <span className="settings__eyebrow-icon" aria-hidden="true">
                  {icon}
                </span>
              ) : null}
              {eyebrow}
            </p>
          ) : null}
          <Heading level={2} size="lg" family="serif">
            {title}
          </Heading>
          <Text tone="muted" className="settings__lede">
            {description}
          </Text>
        </header>

        {children}

        {footer}
      </Stack>
    </Card>
  )
}

/* ---- Section ------------------------------------------------------------ */

export interface SettingsSectionProps {
  title: ReactNode
  /** One line under the heading, when the heading alone is not enough. */
  description?: ReactNode
  /** Controls that belong to the whole section, e.g. "Invite member". */
  actions?: ReactNode
  /** Draw a rule above. Every section but the first wants one. */
  divided?: boolean
  /** Anchor, so a cross-link can point at a section rather than a page. */
  id?: string
  gap?: 12 | 16 | 20
  children: ReactNode
}

/** A run of related settings under a small-caps heading. */
export function SettingsSection({
  title,
  description,
  actions,
  divided = true,
  id,
  gap = 16,
  children,
}: SettingsSectionProps) {
  return (
    <>
      {divided ? <Divider /> : null}
      <Stack as="section" gap={gap} id={id}>
        <div className="settings__section-head">
          <div>
            <Heading level={3} size="xs" className="settings__section-title">
              {title}
            </Heading>
            {description ? (
              <Text size="sm" tone="muted" className="settings__section-lede">
                {description}
              </Text>
            ) : null}
          </div>
          {actions ? (
            <div className="settings__section-actions">{actions}</div>
          ) : null}
        </div>
        {children}
      </Stack>
    </>
  )
}

/* ---- Row ---------------------------------------------------------------- */

export interface SettingsRowProps {
  /** Decorative glyph in the leading tile. */
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** The control this row is about — a Button, a Badge, a Select. */
  action?: ReactNode
  /** Anything that unfolds beneath the row, inside the same band. */
  children?: ReactNode
  /** Marks the row as the destructive one on the page. */
  tone?: 'default' | 'danger'
  className?: string
}

/**
 * A bordered band: what the setting is on the left, what you do about it on
 * the right.
 *
 * The workhorse of this area — a provider, a session, an invoice and a
 * dangerous button are all this shape. Its title is a `<p>` rather than a
 * heading, because a list of twelve of them is a list, not twelve sections;
 * rows that really are section-like pass their own heading as `title`.
 */
export function SettingsRow({
  icon,
  title,
  description,
  action,
  children,
  tone = 'default',
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cx(
        'settings__row',
        tone === 'danger' && 'settings__row--danger',
        className,
      )}
    >
      <div className="settings__row-main">
        {icon ? (
          <span className="settings__row-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="settings__row-text">
          <p className="settings__row-title">{title}</p>
          {description ? (
            <p className="settings__row-description">{description}</p>
          ) : null}
        </div>
        {action ? <div className="settings__row-action">{action}</div> : null}
      </div>
      {children ? <div className="settings__row-body">{children}</div> : null}
    </div>
  )
}

/* ---- Prefixed input ----------------------------------------------------- */

export interface PrefixInputProps {
  label: ReactNode
  /** The fixed part, e.g. "meetcard.io/". Not editable. */
  prefix: string
  value: string
  onValueChange: (value: string) => void
  description?: ReactNode
  /** Decorative glyph before the prefix. */
  icon?: ReactNode
  placeholder?: string
  type?: 'text' | 'url' | 'email' | 'tel'
}

/**
 * A field whose value is only the tail of a URL.
 *
 * `Input`'s `iconStart` is a 40px slot meant for a glyph, and "linkedin.com/"
 * does not fit in it — so the border and focus ring move to a wrapper and the
 * input inside goes bare. `Field` still does the label, description and id
 * wiring, which is the part worth keeping.
 *
 * The prefix is not `aria-hidden`: it is what makes the field's value make
 * sense, so it is wired into the input's `aria-describedby` and read out with
 * it rather than left as decoration sighted users get for free.
 */
export function PrefixInput({
  label,
  prefix,
  value,
  onValueChange,
  description,
  icon,
  placeholder,
  type = 'text',
}: PrefixInputProps) {
  const base = useId()
  const id = `${base}-input`
  const prefixId = `${base}-prefix`
  const descriptionId = description ? `${base}-description` : undefined

  return (
    <Field
      htmlFor={id}
      label={label}
      description={description}
      descriptionId={descriptionId}
    >
      <span className="settings__prefix">
        {icon ? (
          <span className="settings__prefix-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="settings__prefix-text" id={prefixId}>
          {prefix}
        </span>
        <input
          id={id}
          type={type}
          className="settings__prefix-input"
          value={value}
          placeholder={placeholder}
          aria-describedby={cx(prefixId, descriptionId)}
          onChange={(changeEvent: ChangeEvent<HTMLInputElement>) =>
            onValueChange(changeEvent.target.value)
          }
        />
      </span>
    </Field>
  )
}

/* ---- Save bar ----------------------------------------------------------- */

export interface SettingsFooterProps {
  /** What saving actually does, said plainly next to the button. */
  note?: ReactNode
  /** Nothing has changed, so there is nothing to save or discard. */
  disabled?: boolean
  onSave?: () => void
  onCancel?: () => void
  saveLabel?: string
}

/**
 * Cancel and Save, at the foot of a panel that edits something.
 *
 * Panels that only toggle things — Notifications, Integrations — still get one,
 * because a page that saves silently and a page that failed to save look
 * identical, and the prototype's own answer is to say so in the bar.
 */
export function SettingsFooter({
  note,
  disabled = false,
  onSave,
  onCancel,
  saveLabel = 'Save changes',
}: SettingsFooterProps) {
  return (
    <div className="settings__footer">
      {note ? (
        <Text size="sm" tone="muted">
          {note}
        </Text>
      ) : null}
      <div className="settings__footer-actions">
        <Button variant="ghost" disabled={disabled} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={disabled} onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  )
}
