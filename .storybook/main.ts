import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Root order in the sidebar follows discovery order here, not an
  // alphabetical or explicit sort — this is Design System, then Experience,
  // then Build on purpose: learn it, see it working, then build with it.
  "stories": [
    // Same reasoning one level down, inside Design System: what this is,
    // then what it is made of, then the rules it is held to. Named one by
    // one because the glob that follows would discover them by filename and
    // open the section on Foundations — the middle of the argument. The
    // glob stays after them so a new page still appears without being
    // listed; matching a file twice collapses to one entry in the index.
    "../src/docs/Introduction.mdx",
    "../src/docs/Foundations.mdx",
    "../src/docs/Principles.mdx",
    "../src/**/*.mdx",
    "../src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/*.stories.@(js|jsx|mjs|ts|tsx)",
    // Every component story sets its own `title: 'Build/<Kind>/<Name>'`
    // (Atoms/Molecules/Organisms), so this is a plain glob rather than a
    // titlePrefix entry — the prefix would double up with the explicit title.
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  // The preview iframe (Vite) already serves ../public automatically; the
  // manager shell (esbuild) does not, and needs this to pick up
  // ../public/favicon.svg as its own favicon instead of Storybook's default.
  "staticDirs": ["../public"],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/react-vite"
};
export default config;