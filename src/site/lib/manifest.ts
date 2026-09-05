/**
 * The shapes Storybook writes into `storybook-static/`.
 *
 * Two files, both produced by `storybook build`:
 *
 *  - `index.json` — the story index. Authoritative for `title`, which is the
 *    only place the sidebar taxonomy ("Build/Atoms/Button") is spelled out.
 *  - `manifests/components.json` and `manifests/docs.json` — written by
 *    `@storybook/addon-mcp`. These carry everything a docs page needs that the
 *    index does not have: component descriptions, react-docgen prop tables,
 *    per-story descriptions, and a source snippet per story.
 *
 * Only the fields this site reads are typed. Both files declare a `v`, and
 * neither is a stable public API — `catalog.ts` checks the versions it was
 * written against so a Storybook upgrade that reshapes them fails loudly.
 */

/** `storybook-static/index.json` */
export interface StoryIndex {
  v: number
  entries: Record<string, StoryIndexEntry>
}

export interface StoryIndexEntry {
  id: string
  /** e.g. `Build/Atoms/Button`. The URL is derived from this. */
  title: string
  name: string
  importPath: string
  type: 'story' | 'docs'
  tags: string[]
}

/** `storybook-static/manifests/components.json` */
export interface ComponentsManifest {
  v: number
  components: Record<string, ComponentManifest>
}

export interface ComponentManifest {
  /** e.g. `build-atoms-button` — the story id up to the `--`. */
  id: string
  /** The component's export name, e.g. `Button`. */
  name: string
  /** Path to the stories file, e.g. `./src/components/Button/Button.stories.tsx`. */
  path: string
  description?: string
  jsDocTags?: Record<string, string[]>
  reactDocgen?: ReactDocgen
  stories: StoryManifest[]
  /** A ready-to-paste import line, e.g. `import { Button } from '@meetcard/deck';` */
  import?: string
}

export interface StoryManifest {
  /** e.g. `build-atoms-button--primary`. */
  id: string
  name: string
  /** The story's source, as Storybook's docs page shows it. */
  snippet?: string
  description?: string
}

export interface ReactDocgen {
  description?: string
  displayName?: string
  props?: Record<string, DocgenProp>
  /** Interfaces the props extend, e.g. `["ButtonHTMLAttributes"]`. */
  composes?: string[]
}

export interface DocgenProp {
  required?: boolean
  description?: string
  tsType?: { name: string; raw?: string }
  defaultValue?: { value: string; computed: boolean }
}

/** `storybook-static/manifests/docs.json` */
export interface DocsManifest {
  v: number
  docs: Record<string, DocManifest>
}

export interface DocManifest {
  id: string
  name: string
  /** e.g. `./src/docs/Foundations.mdx`. */
  path: string
  /** e.g. `Design System/Foundations`. */
  title: string
  /** The raw MDX source. */
  content: string
  summary?: string
}
