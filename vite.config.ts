/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = import.meta.dirname

/**
 * Root config: local playground app plus the two test projects.
 *
 *  - `unit`      — Testing Library specs (`*.test.tsx`) in jsdom. Fast, and
 *                  where behaviour/keyboard/a11y assertions live.
 *  - `storybook` — every story rendered in real Chromium via Playwright,
 *                  running each story's `play` function.
 *
 * `npm test` runs both. The library build lives in `vite.lib.config.ts`.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: false,
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          // Runs the stories defined in .storybook as tests.
          // https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
