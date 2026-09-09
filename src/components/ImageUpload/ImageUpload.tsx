import { useId, useRef, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { Button } from '../Button/Button'
// The picker's trigger has to be a `<label>` — see below — so it borrows
// Button's appearance directly rather than rendering one.
import '../Button/Button.css'
import './ImageUpload.css'

export type ImageUploadShape = 'circle' | 'square' | 'cover'

export interface ImageUploadProps {
  /** What is being uploaded — "Profile photo", "Logo", "Cover image". */
  label: ReactNode
  /**
   * The constraints, in the reader's terms — "Square, at least 400×400px.
   * JPG or PNG." Say them before the upload, not in an error afterwards.
   */
  description?: ReactNode
  /** The current image, if there is one. */
  src?: string
  /**
   * `circle` for a person, `square` for a logo, `cover` for a wide banner.
   * The preview's shape is the clearest statement of how the image is
   * cropped, so it is shown at the aspect it will actually be used.
   */
  shape?: ImageUploadShape
  /** File types offered in the picker. Defaults to common web images. */
  accept?: string
  /** The chosen file, or `null` when the picker is dismissed. */
  onFileSelect?: (file: File | null) => void
  /** Renders a remove control. Omit when the image is not optional. */
  onRemove?: () => void
  /** The button's words. Defaults to "Replace" once there is an image. */
  actionLabel?: string
  disabled?: boolean
  className?: string
}

const PlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M3 16.5 8.25 11l4.5 4.5 3-3L21 18M3 5.25h18v13.5H3zM9 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * An image field: what it is, what it must be, what is there now, and how to
 * change it.
 *
 * The preview is shown at the shape the image will actually be cropped to,
 * because a square thumbnail of something that ships as a wide banner tells
 * you nothing about what you just uploaded.
 *
 * Built on a real `<input type="file">` driven by a `<label>`, so the picker
 * opens from the keyboard and the control is announced as a file input rather
 * than a button that mysteriously opens a dialog. The input keeps its own
 * accessible name even while the styled button is what you see.
 *
 * Deck has no upload pipeline — this hands you the `File` and gets out of the
 * way. Rendering the result is the caller's job.
 *
 * @example
 * <ImageUpload label="Profile photo" shape="circle" src={photo}
 *   description="Square, at least 400×400px. JPG or PNG."
 *   onFileSelect={setFile} />
 */
export function ImageUpload({
  label,
  description,
  src,
  shape = 'square',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  onFileSelect,
  onRemove,
  actionLabel,
  disabled,
  className,
}: ImageUploadProps) {
  const inputId = useId()
  const descriptionId = `${inputId}-description`
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setFileName(file?.name ?? null)
    onFileSelect?.(file)
  }

  function handleRemove() {
    /* Clearing the input matters: without it, re-picking the same file after
       a remove fires no `change` event and the image never comes back. */
    if (inputRef.current) inputRef.current.value = ''
    setFileName(null)
    onRemove?.()
  }

  const action = actionLabel ?? (src ? 'Replace' : 'Upload')

  return (
    <div
      className={cx(
        'deck-image-upload',
        `deck-image-upload--${shape}`,
        disabled && 'deck-image-upload--disabled',
        className,
      )}
    >
      <div className="deck-image-upload__preview">
        {src ? (
          /* Empty alt: the field's own label already says what this is, and
             a preview of an image you just chose adds nothing when spoken. */
          <img src={src} alt="" className="deck-image-upload__image" />
        ) : (
          <span className="deck-image-upload__placeholder" aria-hidden="true">
            <PlaceholderIcon />
          </span>
        )}
      </div>

      <div className="deck-image-upload__body">
        <span className="deck-image-upload__label">{label}</span>

        {description ? (
          <p id={descriptionId} className="deck-image-upload__description">
            {description}
          </p>
        ) : null}

        {fileName ? (
          /* Announced, because a file picker gives no other confirmation
             that the right file was chosen. */
          <p className="deck-image-upload__filename" role="status">
            {fileName}
          </p>
        ) : null}

        <div className="deck-image-upload__actions">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            className="deck-image-upload__input"
            aria-describedby={description ? descriptionId : undefined}
            onChange={handleChange}
          />
          {/* The label is the control: clicking or pressing it opens the
              picker, which is why this is a `<label>` wearing Button's
              appearance and not a Button that clicks a hidden input. Going
              through the label keeps the input's own name and its native
              keyboard behaviour, which a click-forwarding button loses. */}
          <label
            htmlFor={inputId}
            className={cx(
              'deck-button',
              'deck-button--secondary',
              'deck-button--sm',
              'deck-image-upload__trigger',
            )}
          >
            {action}
          </label>

          {src && onRemove ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
            >
              Remove
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
