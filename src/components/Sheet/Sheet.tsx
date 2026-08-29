import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import { IconButton } from '../IconButton/IconButton'
import './Sheet.css'

export interface SheetProps
  extends Omit<HTMLAttributes<HTMLDialogElement>, 'title' | 'onClose'> {
  open: boolean
  onClose: () => void
  /** Required: the sheet's accessible name. */
  title: ReactNode
  /** Visually hide the title, keeping it for assistive tech. */
  hideTitle?: boolean
  description?: ReactNode
  /** Pinned action row at the bottom. */
  footer?: ReactNode
  /**
   * `sheet` slides up from the bottom; `center` is a centered dialog; `side`
   * is a full-height drawer on the inline-end edge.
   *
   * `side` is for account and navigation surfaces, which are lists you run
   * your eye down rather than a decision you make and dismiss. It keeps its
   * edge at every width — a drawer that became a bottom sheet on a phone
   * would put a long list of destinations under the thumb and off the screen.
   */
  placement?: 'sheet' | 'center' | 'side'
  /** Allow dismissal by backdrop click. Defaults to true. */
  dismissOnBackdrop?: boolean
  closeLabel?: string
  children?: ReactNode
}

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M4 4l8 8M12 4l-8 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

/**
 * A modal surface that slides up from the bottom.
 *
 * This is the home of the Exchange action — "Show my card" and "Scan a card"
 * presented together, because they are two halves of one moment.
 *
 * Built on the native `<dialog>` element, so focus trapping, Escape to
 * dismiss, inertness of the page behind, and returning focus to whatever
 * opened it all come from the platform rather than hand-rolled listeners.
 *
 * @example
 * <Sheet open={open} onClose={close} title="Exchange">
 *   <Button fullWidth iconStart={<QrIcon />}>Show my card</Button>
 *   <Button fullWidth variant="secondary">Scan a card</Button>
 * </Sheet>
 */
export const Sheet = forwardRef<HTMLDialogElement, SheetProps>(function Sheet(
  {
    open,
    onClose,
    title,
    hideTitle = false,
    description,
    footer,
    placement = 'sheet',
    dismissOnBackdrop = true,
    closeLabel = 'Close',
    className,
    children,
    ...props
  },
  ref,
) {
  const innerRef = useRef<HTMLDialogElement>(null)
  useImperativeHandle(ref, () => innerRef.current as HTMLDialogElement)

  const { id: titleId, descriptionId } = useFieldIds({
    hasDescription: Boolean(description),
    hasError: false,
  })

  // Drive the native modal state from the `open` prop.
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  // The page behind a modal should not scroll. `showModal` makes it inert but
  // does not stop scrolling on iOS.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={innerRef}
      className={cx('deck-sheet', `deck-sheet--${placement}`, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Fires on Escape and on close(); keep React state in sync.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (!dismissOnBackdrop) return
        // A click landing on the dialog itself is the backdrop; clicks on
        // content are caught by the inner panel.
        if (event.target === innerRef.current) onClose()
      }}
      {...props}
    >
      <div className="deck-sheet__panel">
        <div className="deck-sheet__header">
          <div className="deck-sheet__heading">
            <h2
              id={titleId}
              className={cx(
                'deck-sheet__title',
                hideTitle && 'deck-visually-hidden',
              )}
            >
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="deck-sheet__description">
                {description}
              </p>
            ) : null}
          </div>

          <IconButton
            label={closeLabel}
            icon={<CloseIcon />}
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="deck-sheet__close"
          />
        </div>

        <div className="deck-sheet__body">{children}</div>

        {footer ? <div className="deck-sheet__footer">{footer}</div> : null}
      </div>
    </dialog>
  )
})
