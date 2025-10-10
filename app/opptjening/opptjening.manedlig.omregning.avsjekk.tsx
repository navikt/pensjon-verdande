import type { ActionFunctionArgs } from 'react-router'
import { opprettAvsjekk } from '~/opptjening/opptjening.manedlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  await opprettAvsjekk(accessToken)

  return null
}
