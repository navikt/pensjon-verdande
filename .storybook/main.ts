import type { StorybookConfig } from '@storybook/react-vite'
import { stubServerModules } from '../vite-plugins/stub-server-modules'

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    config.plugins = config.plugins || []
    config.plugins.push(stubServerModules())
    return config
  },
}

export default config
