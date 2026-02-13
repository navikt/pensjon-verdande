import { Theme } from '@navikt/ds-react'
import type { Decorator, Preview } from '@storybook/react'
import '@navikt/ds-css'
import '../app/app.css'

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light'
  return (
    <Theme theme={theme}>
      <Story />
    </Theme>
  )
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Aksel theme (light/dark)',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
  decorators: [withTheme],
}

export default preview
