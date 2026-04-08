import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import { stubServerModules } from './vite-plugins/stub-server-modules'

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
          exclude: ['app/responsive.test.tsx'],
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
      // Responsive viewport-tester (browser via Playwright)
      {
        resolve: {
          tsconfigPaths: true,
        },
        plugins: [stubServerModules()],
        test: {
          name: 'responsive',
          include: ['app/responsive.test.tsx'],
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
