import invariant from 'tiny-invariant'
import { authenticator, returnToCookie } from '~/services/auth.server'
import { isDevelopment } from '~/services/env.server'
import type { Route } from './+types/auth.microsoft'

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (!isDevelopment) {
    throw new Error('OAuth 2.0 code flyt er kun tilgjengelig ved lokal utvikling')
  }

  invariant(authenticator, `Skal ha 'authenticator' satt ved lokal utvikling`)
  invariant(returnToCookie, `Skal ha 'returnToCookie' satt ved lokal utvikling`)

  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') as string | null

  try {
    await authenticator.authenticate('entra-id', request)
  } catch (error) {
    if (!returnTo) throw error
    if (error instanceof Response && isRedirect(error)) {
      error.headers.append('Set-Cookie', await returnToCookie.serialize(returnTo))
      return error
    }
    throw error
  }
}

function isRedirect(response: Response) {
  if (response.status < 300 || response.status >= 400) return false
  return response.headers.has('Location')
}
