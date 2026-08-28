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
    /*
     * Coverage must be collected across BOTH projects at once. The two halves
     * measure different code: the story runs exercise components as they
     * render, the unit specs exercise the pure helpers no component calls.
     * Running one alone reports the other's code as dead — `--project
     * storybook` alone puts `foundations/tokens` at 33% functions, because
     * only `spaceVar` is reached from a component and `mediaQuery` and
     * `colorVar` are tested in `tokens.test.ts`, which that project never
     * loads. `npm run test:coverage` is the only invocation that reports a
     * true number; a bare `--project` run is for iterating, not for reading
     * coverage off.
     */
    coverage: {
      provider: 'v8',
      // A fixed denominator, so the totals mean the same thing on every run
      // rather than shifting with whichever modules a given project imported.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/**/index.ts',
        'src/test/**',
        'src/site/**',
        'src/docs/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      reporter: ['text-summary', 'html', 'json-summary'],
    },
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
