import type { LoaderFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { authenticator, commitSession, getSession } from '~/services/auth.server'
import { logger } from '~/services/logger.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await authenticator.authenticate('entra-id', request)

    const session = await getSession(request.headers.get('cookie'))

    session.set('user', user)

    return redirect('/dashboard', {
      headers: { 'Set-Cookie': await commitSession(session) },
    })
  } catch (error) {
    logger.error({ err: error }, 'Feil ved autentisering')

    if (error instanceof Response) {
      throw error
    } else if (error instanceof Error) {
      return redirect('/auth/failed')
    } else {
      throw error
    }
  }
}
