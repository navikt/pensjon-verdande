import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  let user = await authenticator.authenticate('entra-id', request)

  redirect('/auth/failed')
}
