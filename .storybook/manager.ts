import { addons } from 'storybook/manager-api'
import { deckTheme } from './theme'

addons.setConfig({
  theme: deckTheme,
  sidebar: {
    showRoots: true,
  },
})
