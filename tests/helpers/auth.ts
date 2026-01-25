import type { Page } from '@playwright/test'

/**
 * Auth helpers for E2E tests
 * Mocks authentication so tests can run without real login
 */

export interface MockUser {
  accessToken: string
  accessTokenExpiresAt: string
}

/**
 * Sets up a mock authenticated session for E2E tests
 * This bypasses the actual OAuth2 flow
 */
export async function setupMockAuth(page: Page) {
  // Mock the session cookie with a fake user
  const mockUser: MockUser = {
    accessToken: 'mock-access-token-for-testing',
    accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  }

  // Set session cookie (same name as in auth.server.ts)
  await page.context().addCookies([
    {
      name: '__verdande_session',
      value: Buffer.from(JSON.stringify({ user: mockUser })).toString('base64'),
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Date.now() / 1000 + 3600,
    },
  ])
}

/**
 * Clears authentication session
 */
export async function clearMockAuth(page: Page) {
  await page.context().clearCookies()
}
