import type { LoaderFunctionArgs } from '@remix-run/server-runtime/dist/routeModules'
import { authenticator } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/microsoft',
    successRedirect: '/dashboard',
  })
}
