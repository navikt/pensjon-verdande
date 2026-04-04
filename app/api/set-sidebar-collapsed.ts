import { createCookie, data } from 'react-router'
import type { Route } from './+types/set-sidebar-collapsed'

const cookie = createCookie('sidebar-collapsed', {
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
})

export const action = async ({ request }: Route.ActionArgs) => {
  const value = (await request.formData()).get('value')

  if (value !== 'true' && value !== 'false') {
    return data({ error: 'Invalid value' }, { status: 400 })
  }

  return data(null, { headers: { 'Set-Cookie': await cookie.serialize(value) } })
}
