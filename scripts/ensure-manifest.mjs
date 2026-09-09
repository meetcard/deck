/**
 * Make sure Storybook's manifests exist before the docs site builds.
 *
 * The site in `src/site/` generates every route from three files Storybook
 * writes — `storybook-static/index.json` and `storybook-static/manifests/
 * {components,docs}.json`. `storybook-static/` is gitignored, so a fresh clone
 * has none of them and `astro dev` would fail on the first import.
 *
 * This builds Storybook only when they are missing, so the common case (they
 * are already there) costs nothing. `build:site` does not use this — CI always
 * wants a fresh build, so it runs `build-storybook` outright.
 *
 * Usage:
 *   node scripts/ensure-manifest.mjs          # build if missing
 *   node scripts/ensure-manifest.mjs --force  # build regardless
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const REQUIRED = [
  'storybook-static/index.json',
  'storybook-static/manifests/components.json',
  'storybook-static/manifests/docs.json',
]

const root = new URL('../', import.meta.url)
const force = process.argv.includes('--force')
const missing = REQUIRED.filter((path) => !existsSync(new URL(path, root)))

if (!force && missing.length === 0) {
  console.log('Storybook manifests present — skipping build.')
  process.exit(0)
}

if (missing.length > 0) {
  console.log(`Missing ${missing.join(', ')} — building Storybook first.`)
}

const build = spawnSync('npm', ['run', 'build-storybook'], {
  cwd: fileURLToPath(root),
  stdio: 'inherit',
})

if (build.status !== 0) {
  console.error('\nStorybook build failed, so the docs site has nothing to read.')
  process.exit(build.status ?? 1)
}

const stillMissing = REQUIRED.filter((path) => !existsSync(new URL(path, root)))
if (stillMissing.length > 0) {
  console.error(
    `\nStorybook built, but ${stillMissing.join(', ')} was not written.\n` +
      `The component manifest comes from @storybook/addon-mcp — check it is\n` +
      `still listed in .storybook/main.ts.`,
  )
  process.exit(1)
}
