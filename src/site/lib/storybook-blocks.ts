/**
 * A stand-in for `@storybook/addon-docs/blocks`, aliased in for the site build.
 *
 * The three pages in `src/docs/` are CSF docs: they open with
 * `<Meta title="…" />`, which is how Storybook attaches them to its sidebar.
 * Astro renders the same files as prose, where that tag has nothing to attach
 * to — and importing the real module would pull Storybook's manager UI into the
 * site bundle to render nothing.
 *
 * So the alias in astro.config.mjs points at this instead. The MDX stays valid
 * in both places, and there is one copy of the text rather than two.
 *
 * A grep confirmed `Meta` is the only block those files use. If a docs page
 * ever reaches for `Canvas`, `Story` or `Controls`, it will fail to resolve
 * here — which is the right failure: those blocks need Storybook's docs
 * context, and the page would have to be rethought for the site anyway.
 */
export const Meta = () => null
