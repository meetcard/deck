/**
 * Renders one story, live, on a docs page.
 *
 * Storybook's portable-stories API does the work: `composeStories` applies the
 * story's args, decorators and parameters exactly as the Storybook preview
 * would, so a story shown here and the same story shown in Storybook are the
 * same render — there is no second implementation to keep in step.
 *
 * The project annotations come from `.storybook/annotations.tsx`, which is why
 * that file exists apart from `preview.tsx`: this is what puts every preview
 * inside `.deck-root` and honours `layout: 'fullscreen'`.
 *
 * Mounted with `client:only="react"`. `composeStories` and the `storybook/test`
 * instrumenter that most story files import at module scope are browser-shaped,
 * and server-rendering them buys nothing here — the frame reserves its height
 * in the Astro shell, so nothing moves when this arrives.
 */
import { useEffect, useState, type ComponentType } from 'react'
import { composeStories, setProjectAnnotations } from '@storybook/react-vite'
import annotations from '../../../.storybook/annotations'

setProjectAnnotations(annotations)

/**
 * Lazy on purpose. An eager glob would pull all 75 story files — and with them
 * every component in the system — into one bundle loaded by every page. Lazy,
 * Vite splits per file and a page fetches only the stories it shows.
 */
const storyModules = import.meta.glob<Record<string, unknown>>('/src/**/*.stories.tsx')

interface Props {
  /** Rooted stories path, e.g. `/src/components/Button/Button.stories.tsx`. */
  storiesPath: string
  /** Storybook story id, e.g. `build-atoms-button--primary`. */
  storyId: string
}

type Composed = ComponentType<Record<string, never>> & { id?: string }

export default function StoryCanvas({ storiesPath, storyId }: Props) {
  const [Story, setStory] = useState<Composed | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Derived during render, not in the effect: whether the glob has this path is
  // a fact about the props, so making it state would only start a second render
  // to reach the same conclusion.
  const load = storyModules[storiesPath]

  useEffect(() => {
    if (!load) return
    let live = true

    load()
      .then((module) => {
        if (!live) return
        const composed = composeStories(module as Parameters<typeof composeStories>[0])
        /*
         * Matched on id, not on export name. The manifest records a story's
         * display name ("With Icon"); `composeStories` keys by its export name
         * ("WithIcon"). Every composed story carries the same `id` Storybook
         * indexed it under, so that is the one value both sides agree on.
         */
        const match = Object.values(composed).find(
          (story) => (story as Composed).id === storyId,
        )
        if (!match) {
          setError(`${storyId} is not exported by ${storiesPath}.`)
          return
        }
        setStory(() => match as Composed)
      })
      .catch((cause: unknown) => {
        if (live) setError(cause instanceof Error ? cause.message : String(cause))
      })

    return () => {
      live = false
    }
  }, [load, storiesPath, storyId])

  if (!load) {
    return (
      <p className="story-canvas__error" role="status">
        This preview could not load. No story file at {storiesPath}.
      </p>
    )
  }

  if (error) {
    return (
      <p className="story-canvas__error" role="status">
        This preview could not load. {error}
      </p>
    )
  }

  if (!Story) {
    return <p className="story-canvas__loading" role="status">Loading preview…</p>
  }

  return <Story />
}
