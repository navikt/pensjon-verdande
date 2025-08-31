import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettOpptjeningsendringArligUttrekk } from '~/opptjening/batch.opptjeningsendringArligUttrekkserver'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const response = await opprettOpptjeningsendringArligUttrekk(accessToken)

  return redirect(`/behandling/${response.behandlingId}`)
}
