import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen096 } from '~/services/batch.bpen096.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen096(accessToken)

  return redirect(`/behandling/${response.behandlingId}`)
}
