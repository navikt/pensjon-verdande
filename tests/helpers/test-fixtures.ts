import { test as base } from '@playwright/test'
import { setupServer } from 'msw/node'
import { handlers } from '../mocks/handlers'

/**
 * Playwright test fixture with MSW server
 * This automatically starts/stops MSW server for each test
 */

const server = setupServer(...handlers)

let serverStarted = false

export const test = base.extend({
  // Start MSW server before all tests
  page: async ({ page }, use) => {
    // Start server once per worker
    if (!serverStarted) {
      server.listen({ onUnhandledRequest: 'bypass' })
      serverStarted = true
    }

    await use(page)
  },
})

// Stop server after all tests
base.afterAll(() => {
  if (serverStarted) {
    server.close()
  }
})

export { expect } from '@playwright/test'
