/**
 * Setup for the `unit` Vitest project (jsdom + Testing Library).
 *
 * Registers the jest-dom matchers (`toBeVisible`, `toHaveAccessibleName`, …)
 * and their types, and clears the DOM between tests.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
