import { createCookie } from 'react-router'

type Theme = 'dark' | 'light'

const themeCookie = createCookie('theme', {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
})

export async function getTheme(request: Request): Promise<Theme> {
  const cookieHeader = request.headers.get('cookie')
  const parsed = await themeCookie.parse(cookieHeader)
  return parsed === 'dark' ? 'dark' : 'light'
}

export async function setTheme(theme: Theme) {
  return themeCookie.serialize(theme)
}
