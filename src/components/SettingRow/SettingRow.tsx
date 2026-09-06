import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Switch } from '../Switch/Switch'
import './SettingRow.css'

export interface SettingRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onChange'> {
  /** What the setting is called. Becomes the switch's label in toggle form. */
  title: ReactNode
  /** What turning it on actually does. */
  description?: ReactNode
  /**
   * Present for a toggle row: renders a `Switch` at the row's end whose
   * label is this row's own title, so tapping the words works too.
   */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /**
   * The row's end slot when it is not a toggle — a `Button`, a `Badge`, a
   * `Select`. Ignored when `checked` is given; a row has one control.
   */
  control?: ReactNode
  /**
   * Content below the row, indented under it — the follow-on choice a
   * setting reveals, or the detail it needs to explain itself.
   */
  children?: ReactNode
  disabled?: boolean
}

/**
 * One preference: what it is called, what it does, and the control that
 * changes it.
 *
 * Settings screens are mostly this row repeated, so it is a component rather
 * than a layout each page reinvents. Consecutive rows draw their own divider,
 * which means a group is just rows inside a `Card` — no wrapper element and
 * no separator to remember.
 *
 * Passing `checked` renders the switch **and** the label together, so the
 * title is the switch's accessible name and its `<label>`: the words are part
 * of the hit target, and assistive tech hears the setting once rather than
 * twice. Reach for `control` for everything that is not on/off.
 *
 * @example
 * <Card>
 *   <SettingRow title="New connection" description="When someone adds you."
 *     checked={alerts} onCheckedChange={setAlerts} />
 *   <SettingRow title="Export my data" description="Cards and notes as JSON."
 *     control={<Button variant="secondary">Export</Button>} />
 * </Card>
 */
export const SettingRow = forwardRef<HTMLDivElement, SettingRowProps>(
  function SettingRow(
    {
      title,
      description,
      checked,
      onCheckedChange,
      control,
      children,
      disabled,
      className,
      ...props
    },
    ref,
  ) {
    const isToggle = checked !== undefined

    return (
      <div
        ref={ref}
        className={cx(
          'deck-setting-row',
          isToggle && 'deck-setting-row--toggle',
          disabled && 'deck-setting-row--disabled',
          className,
        )}
        {...props}
      >
        <div className="deck-setting-row__main">
          {isToggle ? (
            /* The Switch renders its own label and description; the CSS
               above puts them before the control rather than after it, so
               the row reads title-first like every other row here while the
               markup keeps `label`/`aria-describedby` intact. */
            <Switch
              label={title}
              description={description}
              checked={checked}
              disabled={disabled}
              onChange={(event) => onCheckedChange?.(event.target.checked)}
            />
          ) : (
            <>
              <div className="deck-setting-row__text">
                <span className="deck-setting-row__title">{title}</span>
                {description ? (
                  <p className="deck-setting-row__description">{description}</p>
                ) : null}
              </div>
              {control ? (
                <div className="deck-setting-row__control">{control}</div>
              ) : null}
            </>
          )}
        </div>

        {children ? (
          <div className="deck-setting-row__detail">{children}</div>
        ) : null}
      </div>
    )
  },
)
