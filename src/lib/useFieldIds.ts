import { useId } from 'react'

export interface FieldIds {
  id: string
  descriptionId: string
  errorId: string
  /** Value for `aria-describedby`, or undefined when there is nothing to point at. */
  describedBy: string | undefined
}

/**
 * Derives the stable, related ids a labelled control needs.
 *
 * Centralised so every Deck control announces its description and error the
 * same way — the wiring is easy to get subtly wrong per-component.
 */
export function useFieldIds(options: {
  id?: string
  hasDescription: boolean
  hasError: boolean
}): FieldIds {
  const generated = useId()
  const id = options.id ?? generated
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const describedBy =
    [
      options.hasDescription ? descriptionId : null,
      options.hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  return { id, descriptionId, errorId, describedBy }
}
