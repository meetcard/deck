import type { ReactNode } from 'react'
import { Button } from '../../../components/Button/Button'
import { Card } from '../../../components/Card/Card'
import { Heading } from '../../../components/Heading/Heading'
import { Stack } from '../../../components/Stack/Stack'
import { Text } from '../../../components/Text/Text'

export interface SettingsGroupProps {
  /** Small-caps heading above the card, e.g. "Identity". */
  title: string
  /** A line under the heading saying what this group is for. */
  description?: ReactNode
  /** A control on the heading row — "Invite member", "Add another company". */
  action?: ReactNode
  children: ReactNode
}

/**
 * A titled group of settings. The heading sits outside the card so a long
 * page reads as a list of sections you can skim, rather than one card with
 * everything in it.
 */
export function SettingsGroup({
  title,
  description,
  action,
  children,
}: SettingsGroupProps) {
  return (
    <section className="settings__group">
      <div className="settings__group-header">
        <Heading level={3} size="xs" className="settings__group-title">
          {title}
        </Heading>
        {action}
      </div>
      {description ? (
        <Text size="sm" tone="muted" className="settings__group-description">
          {description}
        </Text>
      ) : null}
      <Card>
        <Stack gap={0}>{children}</Stack>
      </Card>
    </section>
  )
}

export interface SettingsPanelProps {
  /** The nav's word for this section, upper-cased above the title. */
  eyebrow: string
  title: string
  description: ReactNode
  /**
   * A line above the eyebrow — the way back, on a panel that is one level
   * down from a nav destination rather than a destination itself.
   */
  before?: ReactNode
  children: ReactNode
  /**
   * Renders the save bar. Sections that apply immediately — Integrations,
   * Team — leave it off rather than showing a Save nothing is waiting on.
   */
  onSave?: () => void
  /** A line above the save bar, e.g. "Changes save to your live card." */
  saveNote?: ReactNode
}

/**
 * The frame every settings section wears: what you are looking at, what it
 * governs, and — where the section has a form — the bar that commits it.
 *
 * Whether a section saves explicitly is a real distinction, not decoration.
 * Profile edits a document and gets a Save; Integrations performs actions
 * that have already happened by the time you see them, and a Save button
 * there would be a lie about what the buttons above it did.
 */
export function SettingsPanel({
  eyebrow,
  title,
  description,
  before,
  children,
  onSave,
  saveNote,
}: SettingsPanelProps) {
  return (
    /* `deck-field-caps`: every field label in here reads as an eyebrow.
       Forty labels down one column are markers you scan past, not sentences
       you read — and it is what the product's own settings screens do. */
    <div className="settings__panel deck-field-caps">
      <Stack gap={24}>
        <Stack gap={4}>
          {before}
          <Text size="xs" tone="muted" className="settings__eyebrow">
            {eyebrow}
          </Text>
          <Heading level={2} size="lg" family="serif">
            {title}
          </Heading>
          <Text tone="muted">{description}</Text>
        </Stack>

        {children}

        {onSave ? (
          <div className="settings__save">
            {saveNote ? (
              <Text size="xs" tone="muted">
                {saveNote}
              </Text>
            ) : null}
            <div className="settings__save-actions">
              <Button variant="ghost">Cancel</Button>
              <Button onClick={onSave}>Save changes</Button>
            </div>
          </div>
        ) : null}
      </Stack>
    </div>
  )
}
