import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Replaces .server.ts file contents with no-op stubs so server-only code
 * (process.env, Node APIs, auth) never runs in the browser.
 * Shared between Storybook config and vitest responsive project.
 */
function stubServerModules(): Plugin {
  return {
    name: 'stub-server-modules',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('.server.')) return

      const stubs: string[] = []
      const names = new Set<string>()

      for (const m of code.matchAll(/export\s+enum\s+(\w+)\s*\{[^}]*\}/g)) {
        stubs.push(`export enum ${m[1]} {}`)
        names.add(m[1])
      }

      for (const m of code.matchAll(/export\s+class\s+(\w+)/g)) {
        stubs.push(`export class ${m[1]} {}`)
        names.add(m[1])
      }

      for (const m of code.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function)\s+(\w+)/g)) {
        if (!names.has(m[1])) {
          stubs.push(`export const ${m[1]} = () => {}`)
          names.add(m[1])
        }
      }

      for (const m of code.matchAll(/export\s*\{([^}]+)\}/g)) {
        for (const part of m[1].split(',')) {
          const alias = part
            .trim()
            .split(/\s+as\s+/)
            .pop()
            ?.trim()
          if (alias && !names.has(alias)) {
            stubs.push(`export const ${alias} = () => {}`)
            names.add(alias)
          }
        }
      }

      if (/export\s+default/.test(code)) stubs.push('export default () => {}')

      return { code: stubs.join('\n'), map: null }
    },
  }
}

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
