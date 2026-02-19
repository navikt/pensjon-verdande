import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // Eksisterende enhetstester (Node)
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit',
          include: ['app/**/*.test.{ts,tsx}'],
        },
      },
      // Storybook smoke-tester (browser via Playwright)
      {
        plugins: [tsconfigPaths(), storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: '.storybook/vitest.setup.ts',
        },
      },
    ],
  },
})
