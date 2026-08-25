import { forwardRef } from 'react'
import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/cx'
import { useFieldIds } from '../../lib/useFieldIds'
import { Field, type ControlSize } from '../Field/Field'
import './Textarea.css'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode
  description?: ReactNode
  error?: ReactNode
  size?: ControlSize
  hideLabel?: boolean
  /** Allow the user to drag-resize. Vertical only by default. */
  resize?: 'none' | 'vertical'
  fieldClassName?: string
}

/**
 * A multi-line text field, for notes and longer free text.
 *
 * @example
 * <Textarea label="Meeting notes" rows={4} description="Only visible to you" />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      description,
      error,
      size = 'md',
      hideLabel = false,
      resize = 'vertical',
      rows = 4,
      id: providedId,
      required,
      className,
      fieldClassName,
      ...props
    },
    ref,
  ) {
    const { id, descriptionId, errorId, describedBy } = useFieldIds({
      id: providedId,
      hasDescription: Boolean(description),
      hasError: Boolean(error),
    })

    return (
      <Field
        htmlFor={id}
        label={label}
        description={description}
        error={error}
        descriptionId={descriptionId}
        errorId={errorId}
        required={required}
        hideLabel={hideLabel}
        className={fieldClassName}
      >
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cx(
            'deck-control',
            `deck-control--${size}`,
            'deck-textarea',
            `deck-textarea--resize-${resize}`,
            className,
          )}
          {...props}
        />
      </Field>
    )
  },
)
