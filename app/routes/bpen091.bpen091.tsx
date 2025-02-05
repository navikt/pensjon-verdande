import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen091 } from '~/services/batch.bpen091.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen091(accessToken, +updates.behandlingsAr)

  return redirect(`/behandling/${response.behandlingId}`)
}
