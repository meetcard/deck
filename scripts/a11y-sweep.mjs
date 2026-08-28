/**
 * Accessibility sweep across every story, in both color schemes.
 *
 * `npm test` runs axe on each story via the Storybook a11y addon, but only
 * in the browser's default (light) scheme. Deck's dark palette is derived
 * rather than published by design, so it needs its own check — this loads
 * every story twice and reports any axe violation.
 *
 * Usage:
 *   npm run storybook          # in another terminal
 *   npm run test:a11y
 *
 * Or against a production build:
 *   npm run build-storybook
 *   node scripts/a11y-sweep.mjs --static storybook-static
 */
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, normalize } from 'node:path'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const AXE_PATH = require.resolve('axe-core/axe.min.js')

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

/**
 * Serves a built Storybook so CI can sweep without a dev server. Written
 * inline rather than pulling in a static-server dependency for one job.
 */
function serveStatic(dir) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      const rel = normalize(path === '/' ? '/index.html' : path).replace(
        /^(\.\.[/\\])+/,
        '',
      )
      try {
        const body = await readFile(join(dir, rel))
        res.writeHead(200, {
          'content-type': MIME[extname(rel)] ?? 'application/octet-stream',
        })
        res.end(body)
      } catch {
        res.writeHead(404).end('not found')
      }
    })
    server.listen(0, () =>
      resolve({
        url: `http://localhost:${server.address().port}`,
        close: () => new Promise((r) => server.close(r)),
      }),
    )
  })
}

/** How long to wait for a story to finish rendering and playing. */
const STORY_READY_TIMEOUT = 15_000

const staticFlag = process.argv.indexOf('--static')
const staticDir = staticFlag !== -1 ? process.argv[staticFlag + 1] : null

/**
 * Page-scope rules that cannot hold for a component rendered in isolation.
 * Kept in sync with the `a11y.config.rules` list in .storybook/preview.tsx.
 */
const DISABLED_RULES = [
  'landmark-one-main',
  'page-has-heading-one',
  'region',
  'bypass',
]

/**
 * Stories that legitimately cannot pass, with the reason. Keep this list
 * short and always explain why — it is an accessibility waiver, not a
 * convenience hatch.
 */
const WAIVERS = {
  'build-atoms-text--tones':
    'shows the `disabled` tone as a standalone swatch; WCAG 1.4.3 exempts ' +
    'text in a disabled control, which axe cannot infer out of context',
}

async function main() {
  const server = staticDir ? await serveStatic(staticDir) : null
  const BASE = server?.url ?? process.env.STORYBOOK_URL ?? 'http://localhost:6006'

  const indexRes = await fetch(`${BASE}/index.json`).catch(() => null)
  if (!indexRes?.ok) {
    console.error(
      `Could not reach Storybook at ${BASE}.\n` +
        'Start it with `npm run storybook`, pass `--static storybook-static`, ' +
        'or set STORYBOOK_URL.',
    )
    await server?.close()
    process.exit(1)
  }

  const index = await indexRes.json()
  const stories = Object.values(index.entries ?? {}).filter(
    (entry) => entry.type === 'story',
  )

  const browser = await chromium.launch()
  const failures = []
  let checked = 0

  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme: scheme })
    const page = await context.newPage()
    // Installed before any navigation so the flag is armed before the
    // preview boots and emits.
    await page.addInitScript(() => {
      window.__deckStoryFinished = false
      const attach = () => {
        const channel = window.__STORYBOOK_ADDONS_CHANNEL__
        if (!channel) return false
        channel.on('storyFinished', () => {
          window.__deckStoryFinished = true
        })
        return true
      }
      if (!attach()) {
        const poll = setInterval(() => {
          if (attach()) clearInterval(poll)
        }, 10)
      }
    })

    for (const story of stories) {
      await page.goto(
        `${BASE}/iframe.html?id=${story.id}&viewMode=story`,
        { waitUntil: 'load' },
      )
      // Stories with a play function are still mid-flow at load, and a
      // control caught mid-transition reports the colours of neither end.
      // Storybook emits `storyFinished` after play has run and its own
      // wait-for-animations phase has settled, so that is the real
      // ready signal; the timeout keeps a hung story from hanging CI.
      await page
        .waitForFunction(() => window.__deckStoryFinished === true, null, {
          timeout: STORY_READY_TIMEOUT,
        })
        .catch(() => {
          console.log(
            `~ SLOW ${story.id} [${scheme}] — checked before it settled`,
          )
        })
      await page.addScriptTag({ path: AXE_PATH })

      // The a11y addon runs its own axe pass on story load, and axe refuses
      // to run concurrently — retry until its pass has finished.
      const result = await page.evaluate(async (disabled) => {
        const rules = Object.fromEntries(
          disabled.map((id) => [id, { enabled: false }]),
        )
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

        let run
        for (let attempt = 0; attempt < 20; attempt += 1) {
          try {
            run = await window.axe.run(document, { rules })
            break
          } catch (error) {
            if (!/already running/i.test(String(error))) throw error
            await sleep(150)
          }
        }
        if (!run) throw new Error('axe stayed busy for 3s')

        return run.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target.join(' '),
            message: n.any.concat(n.all).map((c) => c.message).join('; '),
          })),
        }))
      }, DISABLED_RULES)

      checked += 1
      if (result.length === 0) continue

      if (WAIVERS[story.id]) {
        console.log(`~ WAIVED ${story.id} [${scheme}] — ${WAIVERS[story.id]}`)
        continue
      }

      failures.push({ story: story.id, scheme, violations: result })
    }

    await context.close()
  }

  await browser.close()
  await server?.close()

  console.log(
    `\nChecked ${checked} story renders (${stories.length} stories x 2 schemes).`,
  )

  if (failures.length === 0) {
    console.log('No accessibility violations.')
    return
  }

  console.error(`\n${failures.length} story render(s) with violations:\n`)
  for (const f of failures) {
    console.error(`FAIL ${f.story} [${f.scheme}]`)
    for (const v of f.violations) {
      console.error(`  ${v.id} (${v.impact})`)
      for (const n of v.nodes) console.error(`    ${n.target}\n      ${n.message}`)
    }
    console.error('')
  }
  process.exit(1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
