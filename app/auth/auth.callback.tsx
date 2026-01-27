import type { LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import invariant from 'tiny-invariant'
import { authenticator, returnToCookie, sessionStorage } from '~/services/auth.server'
import { isLocalEnv } from '~/services/env.server'
import { logger } from '~/services/logger.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (!isLocalEnv) {
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
