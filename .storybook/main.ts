import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Root order in the sidebar follows discovery order here, not an
  // alphabetical or explicit sort — this is Meet Deck, then Experience,
  // then Build on purpose: learn it, see it working, then build with it.
  "stories": [
    "../src/**/*.mdx",
    "../src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/*.stories.@(js|jsx|mjs|ts|tsx)",
    // Component stories are auto-titled from their folder name, so the root
    // segment comes from this prefix rather than an explicit `title`
    // repeated across every file.
    {
      directory: "../src/components",
      titlePrefix: "Build",
      files: "**/*.stories.@(js|jsx|mjs|ts|tsx)"
    }
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