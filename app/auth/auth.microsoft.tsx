import { type ActionFunctionArgs, redirect } from 'react-router'
import { authenticator } from '~/services/auth.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  await authenticator.authenticate('entra-id', request)

  redirect('/auth/failed')
}
