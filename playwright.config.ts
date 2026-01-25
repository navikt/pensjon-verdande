import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for pensjon-verdande E2E tests
 * Tests user flows at behavior level, not implementation details
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'ENV=test npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Load test environment variables
      ENV: 'test',
      IS_LOCAL_ENV: 'true',
      AZURE_APP_CLIENT_ID: 'test-client-id',
      AZURE_APP_CLIENT_SECRET: 'test-client-secret',
      AZURE_OPENID_CONFIG_ISSUER: 'https://login.microsoftonline.com/test/v2.0',
      AZURE_OPENID_CONFIG_TOKEN_ENDPOINT: 'http://localhost:3001/oauth2/v2.0/token',
      AZURE_CALLBACK_URL: 'http://localhost:3000/auth/microsoft/callback',
      PEN_URL: 'http://localhost:3001',
      PEN_SCOPE: 'api://test/.default',
      PEN_APPLICATION: 'pensjon-pen',
      PEN_SERVICE_NAME: 'pensjon-pen',
      LOKI_API_BASE_URL: 'http://localhost:3100',
      ALDE_LINK_ENABLED: 'false',
      ALDE_BEHANDLING_URL_TEMPLATE: 'http://test/{behandlingId}',
      PSAK_SAK_URL_TEMPLATE: 'http://test/{sakId}',
      TEMPO_DATA_SOURCE: 'test',
    },
  },
})
