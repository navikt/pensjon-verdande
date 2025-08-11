import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen055ArligUttrekk } from '~/services/batch.bpen055ArligUttrekkserver'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen055ArligUttrekk(accessToken)

  return redirect(`/behandling/${response.behandlingId}`)
}
