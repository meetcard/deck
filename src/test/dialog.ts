import { expect, waitFor } from 'storybook/test'

/**
 * The open dialog on the page, once it is actually open.
 *
 * `Sheet` drives the native modal from a `useEffect` — `showModal()` is a
 * passive effect, which React flushes *after* the render a `play` function is
 * waiting on. So at the moment play starts, the dialog can be mounted but not
 * yet open. On a fast machine the effect always wins that race, which is why
 * a plain `querySelector('dialog[open]')` passed locally for so long; on a
 * loaded CI or Chromatic capture machine it loses, the selector returns
 * `null`, and the assertion fails as `expect(null).toHaveAttribute("open")`.
 *
 * The fix is to retry the *query*, not an element captured before the wait —
 * a `dialog[open]` selector evaluated once can never become non-null however
 * long you wait on it afterwards.
 *
 * Scoped to `[open]` because a page may mount several sheets at once: My
 * Cards has both the share sheet and the new-card sheet in the DOM, and
 * taking the first `dialog` would silently assert against the closed one.
 */
export async function findOpenDialog(
  canvasElement: HTMLElement,
): Promise<HTMLDialogElement> {
  return waitFor(() => {
    const dialog =
      canvasElement.ownerDocument.querySelector<HTMLDialogElement>(
        'dialog[open]',
      )
    expect(dialog).not.toBeNull()
    return dialog as HTMLDialogElement
  })
}
