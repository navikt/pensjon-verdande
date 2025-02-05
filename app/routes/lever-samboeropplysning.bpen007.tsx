import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen007 } from '~/services/batch.bpen007.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen007(accessToken, +updates.behandlingsAr)

  return redirect(`/behandling/${response.behandlingId}`)
}
