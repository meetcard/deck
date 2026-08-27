/**
 * Renders the Open Graph image from scripts/og/og-image.html.
 *
 * The wordmark is injected from `deckWordmarkSvg` rather than copied into the
 * template, so the social card cannot drift from the site header and the
 * Storybook sidebar the way the wordmark previously did.
 *
 * Run: node scripts/og/render.mjs
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, '../..')

// 1200x630 is the canonical Open Graph ratio (1.91:1) — what Facebook,
// LinkedIn, Slack and X all crop toward.
const WIDTH = 1200
const HEIGHT = 630
const OUT = path.join(repo, 'public/og-image.png')

const wordmark = fs
  .readFileSync(path.join(repo, 'src/foundations/brand/deckWordmark.ts'), 'utf8')
  .match(/export const deckWordmarkSvg = `\n?([\s\S]*?)\n`/)[1]

const html = fs
  .readFileSync(path.join(here, 'og-image.html'), 'utf8')
  .replace('<!-- deckWordmarkSvg injected here -->', wordmark)

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2, // retina-sharp on high-DPI previews
})
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: OUT, type: 'png' })
await browser.close()

const { size } = fs.statSync(OUT)
console.log(`wrote ${path.relative(repo, OUT)} — ${WIDTH}x${HEIGHT}@2x, ${(size / 1024).toFixed(0)}KB`)
