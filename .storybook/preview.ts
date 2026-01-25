import type { Preview } from '@storybook/react'
import '@navikt/ds-css'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../tests/mocks/handlers'

// Initialize MSW
initialize()

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: {
      handlers: handlers,
    },
  },
  loaders: [mswLoader],
}

export default preview
