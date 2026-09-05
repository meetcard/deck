/**
 * The docs site's model of the design system.
 *
 * Everything on the site — routes, sidebar, previews, prop tables — is derived
 * here from what `storybook build` already writes to `storybook-static/`. There
 * is no second parse of the CSF files and no second react-docgen pass: the
 * manifests are Storybook's own output, so the site cannot drift from
 * Storybook's own docs.
 *
 * That does mean the manifests must exist before `astro build` runs. See
 * `scripts/ensure-manifest.mjs` and the `pre` scripts in package.json.
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { sanitize } from 'storybook/internal/csf'
import type {
  ComponentManifest,
  ComponentsManifest,
  DocManifest,
  DocsManifest,
  DocgenProp,
  StoryIndex,
  StoryManifest,
} from './manifest'

/**
 * Manifest schema versions this code was written against. Storybook does not
 * treat these files as a public API, so a bump is a signal to re-read them
 * rather than to ship a site full of blank pages.
 */
const EXPECTED_INDEX_V = 5
const EXPECTED_MANIFEST_V = 0

/**
 * Stories that exist to prove the local Vite playground still boots. They are
 * not part of Deck and do not get a public page.
 */
const EXCLUDED_TITLES = new Set(['Experience/Misc/Vite Smoke Test'])

/** Root title segment → first URL segment. */
const SECTIONS = {
  Build: 'components',
  Experience: 'experience',
  'Design System': 'docs',
} as const

/**
 * The names `@meetcard/deck` actually exports, read from `src/index.ts`.
 *
 * The manifest carries an `import` line of its own, but it is synthesised from
 * the package name and claims every component is importable — it offers
 * `import { PublicCard } from '@meetcard/deck'` for a screen that `index.ts`
 * has never exported. CONTRIBUTING.md is explicit that "a component is not
 * shipped until it is exported there", so that file is the only honest source
 * for this, and a page for an unexported component says so rather than
 * printing an import that would not resolve.
 *
 * Only value exports count. `export type { … }` blocks are stripped first, so
 * `ButtonProps` never reads as something you can call.
 */
function publicExports(): Set<string> {
  const source = readFileSync(new URL('src/index.ts', root), 'utf8')
  const values = source.replace(/export\s+type\s*\{[^}]*\}/g, '')
  const names = new Set<string>()
  for (const block of values.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const clause of block[1].split(',')) {
      // `Foo as Bar` is exported under `Bar`.
      const name = clause.split(/\bas\b/).at(-1)?.trim()
      if (name && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name)
    }
  }
  return names
}

/** Tags Storybook sets on everything; they say nothing about a component. */
const BORING_TAGS = new Set(['dev', 'test', 'manifest', 'autodocs', 'unattached-mdx'])

export interface PropRow {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

export interface StoryEntry {
  /** Storybook's story id, e.g. `build-atoms-button--primary`. */
  id: string
  name: string
  /** URL fragment for deep-linking to this story on its page. */
  anchor: string
  snippet?: string
  description?: string
}

interface PageBase {
  id: string
  /**
   * Display name — the last segment of the title, e.g. `Button`, `Add Event`.
   *
   * Not the export name. For a component the two agree, but a screen is titled
   * `Experience/Application/Add Event` and exported as `AddEvent`, and the
   * spaced form is the one written for people to read.
   */
  name: string
  /** Full Storybook title, e.g. `Build/Atoms/Button`. */
  title: string
  /** Middle title segment — `Atoms`, `Networking`, … */
  group: string
  href: string
  /** The matching page in Storybook, for the escape-hatch link. */
  storybookHref: string
}

export interface ShowcasePage extends PageBase {
  kind: 'component' | 'screen'
  /** The identifier you would import, e.g. `AddEvent`. */
  exportName: string
  /** Import specifier of the stories file, rooted at `/src/…` for the island. */
  storiesPath: string
  description?: string
  examples: string[]
  /** Undefined when the component is not exported from `src/index.ts`. */
  importLine?: string
  /** False for screens and for components not yet in the public API. */
  published: boolean
  tags: string[]
  stories: StoryEntry[]
  props: PropRow[]
  composes: string[]
  params: Record<string, string>
}

export interface DocPage extends PageBase {
  kind: 'doc'
  slug: string
  /** Rooted MDX path, e.g. `/src/docs/Foundations.mdx`. */
  path: string
  content: string
  params: { slug: string }
}

/**
 * Project root.
 *
 * Not derived from `import.meta.url`: Astro bundles this module into
 * `dist/site/.prerender/chunks/`, so a path relative to the module resolves
 * against the output directory at build time and reads `dist/storybook-static/`.
 * Astro already requires being run from the project root — that is where it
 * looks for `astro.config.mjs` — so the working directory is the stable anchor.
 */
const root = pathToFileURL(`${process.cwd()}/`)

function read<T>(relativePath: string, what: string): T {
  const url = new URL(relativePath, root)
  try {
    return JSON.parse(readFileSync(url, 'utf8')) as T
  } catch (cause) {
    throw new Error(
      `Cannot build the docs site: ${what} is missing at ${relativePath}.\n` +
        `It is written by Storybook, and storybook-static/ is gitignored, so a\n` +
        `fresh clone has to build it first:\n\n  npm run build-storybook\n\n` +
        `\`npm run dev:site\` and \`npm run build:site\` do this for you.`,
      { cause },
    )
  }
}

function checkVersion(what: string, actual: number, expected: number) {
  if (actual !== expected) {
    throw new Error(
      `${what} is version ${actual}, but this site reads version ${expected}. ` +
        `Storybook has reshaped it — re-read src/site/lib/manifest.ts against ` +
        `the new output before trusting the pages it generates.`,
    )
  }
}

const index = read<StoryIndex>('storybook-static/index.json', 'the story index')
const componentsManifest = read<ComponentsManifest>(
  'storybook-static/manifests/components.json',
  'the component manifest',
)
const docsManifest = read<DocsManifest>(
  'storybook-static/manifests/docs.json',
  'the docs manifest',
)

checkVersion('index.json', index.v, EXPECTED_INDEX_V)
checkVersion('components.json', componentsManifest.v, EXPECTED_MANIFEST_V)
checkVersion('docs.json', docsManifest.v, EXPECTED_MANIFEST_V)

/**
 * Component id → title.
 *
 * The component manifest knows a component's export name (`Button`) but not
 * where it sits in the sidebar; only the index carries `title`. Story ids are
 * `<componentId>--<storyName>`, so the component id is the part before `--`.
 */
const titleById = new Map<string, string>()
const tagsById = new Map<string, string[]>()
for (const entry of Object.values(index.entries)) {
  const componentId = entry.id.split('--')[0]
  if (!titleById.has(componentId)) titleById.set(componentId, entry.title)
  const meaningful = entry.tags.filter((tag) => !BORING_TAGS.has(tag))
  const seen = tagsById.get(componentId) ?? []
  tagsById.set(componentId, [...new Set([...seen, ...meaningful])])
}

const exported = publicExports()

/**
 * A title segment as a URL segment.
 *
 * `sanitize` alone is not enough. It lowercases and hyphenates, but it does not
 * split camel case, so `PersonCard` becomes `personcard` — which is how
 * Storybook's own story ids read, and is exactly the sort of URL this site
 * exists to stop handing out. Screens escape it only because their titles are
 * already spaced ("Public Card"), and there is no reason a component's URL
 * should be less readable than a screen's for that accident.
 *
 * So the word boundaries are restored first, then `sanitize` does the rest.
 * The result deliberately differs from the story id — `person-card` here,
 * `personcard` in Storybook — which costs nothing, because a page links to
 * Storybook by the id in the manifest and never by this slug.
 */
function slugify(segment: string): string {
  const spaced = segment
    // `personCard` / `Person1Card` → `person Card`
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // `QRCode` → `QR Code`, without breaking `QR` itself
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return sanitize(spaced)
}

/** `Build/Atoms/Button` → `/components/atoms/button/` */
function hrefFor(title: string): string {
  const [root, ...rest] = title.split('/')
  const section = SECTIONS[root as keyof typeof SECTIONS]
  if (!section) {
    throw new Error(
      `Story title "${title}" starts with "${root}", which has no section in ` +
        `SECTIONS. Add it there, or move the story under an existing root.`,
    )
  }
  return `/${[section, ...rest.map(slugify)].join('/')}/`
}

function propRows(component: ComponentManifest): PropRow[] {
  const props = component.reactDocgen?.props ?? {}
  return Object.entries(props)
    .map(([name, prop]: [string, DocgenProp]) => ({
      name,
      type: prop.tsType?.raw ?? prop.tsType?.name ?? '—',
      required: prop.required ?? false,
      defaultValue: prop.defaultValue?.value,
      description: prop.description || undefined,
    }))
    // Required props first — they are the ones a caller cannot skip — then
    // alphabetical, so a long table is scannable.
    .sort((a, b) =>
      a.required === b.required
        ? a.name.localeCompare(b.name)
        : Number(b.required) - Number(a.required),
    )
}

function storyEntries(stories: StoryManifest[]): StoryEntry[] {
  return stories.map((story) => ({
    id: story.id,
    name: story.name,
    anchor: sanitize(story.name),
    snippet: story.snippet,
    description: story.description,
  }))
}

function toShowcase(component: ComponentManifest): ShowcasePage | null {
  const title = titleById.get(component.id)
  if (!title || EXCLUDED_TITLES.has(title)) return null

  const [root, group, ...rest] = title.split('/')
  const leaf = rest.at(-1) ?? group
  const kind = root === 'Build' ? 'component' : 'screen'

  return {
    kind,
    id: component.id,
    name: leaf,
    exportName: component.name,
    title,
    group,
    href: hrefFor(title),
    storybookHref: `/storybook/?path=/docs/${component.id}--docs`,
    // The manifest writes `./src/…`; the island's `import.meta.glob` keys are
    // rooted at `/src/…`.
    storiesPath: component.path.replace(/^\.\//, '/'),
    description: component.description,
    examples: component.jsDocTags?.example ?? [],
    importLine: exported.has(component.name)
      ? `import { ${component.name} } from '@meetcard/deck'`
      : undefined,
    published: exported.has(component.name),
    tags: (tagsById.get(component.id) ?? []).sort(),
    stories: storyEntries(component.stories),
    props: propRows(component),
    composes: component.reactDocgen?.composes ?? [],
    params:
      kind === 'component'
        ? { tier: slugify(group), component: slugify(leaf) }
        : { area: slugify(group), screen: slugify(leaf) },
  }
}

function toDoc(doc: DocManifest): DocPage {
  const slug = slugify(doc.title.split('/').slice(1).join('/'))
  return {
    kind: 'doc',
    id: doc.id,
    name: doc.title.split('/').at(-1) ?? doc.name,
    title: doc.title,
    group: 'Design System',
    href: `/docs/${slug}/`,
    storybookHref: `/storybook/?path=/docs/${doc.id}`,
    slug,
    path: doc.path.replace(/^\.\//, '/'),
    content: doc.content,
    params: { slug },
  }
}

const showcases = Object.values(componentsManifest.components)
  .map(toShowcase)
  .filter((page): page is ShowcasePage => page !== null)
  .sort((a, b) => a.title.localeCompare(b.title))

export const componentPages = showcases.filter((p) => p.kind === 'component')
export const screenPages = showcases.filter((p) => p.kind === 'screen')

export const docPages = Object.values(docsManifest.docs)
  .map(toDoc)
  // Introduction, then Foundations, then Design principles — the order
  // .storybook/main.ts spells out, for the same reason it does there: what
  // this is, then what it is made of, then the rules it is held to.
  .sort((a, b) => docOrder(a) - docOrder(b))

function docOrder(doc: DocPage): number {
  const order = ['introduction', 'foundations', 'design-principles']
  const at = order.indexOf(doc.slug)
  return at === -1 ? order.length : at
}

export interface NavGroup {
  label: string
  href?: string
  items: { label: string; href: string }[]
}

export interface NavSection {
  label: string
  href: string
  groups: NavGroup[]
}

/** Groups a set of pages by their middle title segment, in title order. */
function groupPages(pages: (ShowcasePage | DocPage)[]): NavGroup[] {
  const groups = new Map<string, NavGroup>()
  for (const page of pages) {
    const group = groups.get(page.group) ?? { label: page.group, items: [] }
    group.items.push({ label: page.name, href: page.href })
    groups.set(page.group, group)
  }
  return [...groups.values()]
}

/**
 * The sidebar, in the same order as Storybook's: learn it, see it working,
 * then build with it.
 */
export function navTree(): NavSection[] {
  return [
    {
      label: 'Design System',
      href: docPages[0]?.href ?? '/docs/introduction/',
      groups: [{ label: 'Design System', items: docPages.map((d) => ({ label: d.name, href: d.href })) }],
    },
    { label: 'Experience', href: '/experience/', groups: groupPages(screenPages) },
    { label: 'Build', href: '/components/', groups: groupPages(componentPages) },
  ]
}
