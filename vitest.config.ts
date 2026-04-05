import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // Eksisterende enhetstester (Node)
      {
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          name: 'unit',
          include: ['app/**/*.test.{ts,tsx}'],
        },
      },
      // Storybook smoke-tester (browser via Playwright)
      {
        resolve: {
          tsconfigPaths: true,
        },
        plugins: [storybookTest({ configDir: '.storybook' })],
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
