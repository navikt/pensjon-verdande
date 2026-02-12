import { redirect } from 'react-router'
import invariant from 'tiny-invariant'
import { authenticator, returnToCookie, sessionStorage } from '~/services/auth.server'
import { isDevelopment } from '~/services/env.server'
import { logger } from '~/services/logger.server'
import type { Route } from './+types/auth.callback'

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (!isDevelopment) {
    throw new Error('OAuth 2.0 code flyt er kun tilgjengelig ved lokal utvikling')
  }

  invariant(authenticator, `Skal ha 'authenticator' satt ved lokal utvikling`)
  invariant(returnToCookie, `Skal ha 'returnToCookie' satt ved lokal utvikling`)
  invariant(sessionStorage, `Skal ha 'returnToCookie' satt ved lokal utvikling`)

  try {
    const returnTo = (await returnToCookie.parse(request.headers.get('Cookie'))) ?? '/home'

    const user = await authenticator.authenticate('entra-id', request)

    const session = await sessionStorage.getSession(request.headers.get('cookie'))

    session.set('user', user)

    return redirect(returnTo, {
      headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
    })
  } catch (error) {
    logger.error('Feil ved autentisering', { error })

    throw error
  }
}
