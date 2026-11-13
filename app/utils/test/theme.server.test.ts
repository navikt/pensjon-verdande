import { describe, expect, it } from 'vitest'
import { getTheme, setTheme } from '../theme.server'

describe('tema', () => {
  it.each([
    { input: 'dark', expected: 'dark' },
    { input: 'light', expected: 'light' },
    { input: 'invalid', expected: 'light' },
  ])(
    'lagrer tema "$input" i cookie og leser det tilbake som "$expected" slik at brukerens temavalg persisteres mellom sidevisninger',
    async ({ input, expected }) => {
      // @ts-expect-error - Vi tester både gyldige og ugyldige input, så vi ignorerer TypeScript-feilen her
      const cookie = await setTheme(input)
      const cookieHeader = cookie.split(';')[0]
      const theme = await getTheme(new Request('http://localhost', { headers: { cookie: cookieHeader } }))
      expect(theme).toBe(expected)
    },
  )
})
