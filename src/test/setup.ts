/**
 * Setup for the `unit` Vitest project (jsdom + Testing Library).
 *
 * Registers the jest-dom matchers (`toBeVisible`, `toHaveAccessibleName`, …)
 * and their types, clears the DOM between tests, and fills in the one DOM
 * capability jsdom lacks that Deck depends on.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/*
 * jsdom implements `<dialog>` but not its modal methods, so any component
 * built on the native element throws on mount. Sheet is that component, and
 * everything modal in Deck composes it — so this belongs to the environment
 * rather than being restated by each test file that happens to open a dialog.
 *
 * Deliberately minimal: it makes `open` reflect reality and fires `close`,
 * which is all the assertions need. Focus trapping and the top layer are real
 * browser behaviour and are covered by the Chromium story tests instead.
 */
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(
    this: HTMLDialogElement,
  ) {
    this.open = true
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
}

afterEach(() => {
  cleanup()
})
