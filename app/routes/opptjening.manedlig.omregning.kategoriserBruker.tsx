import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen055 } from '~/services/batch.bpen055server'



export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen055(accessToken, +updates.behandlingsmaned)

  return redirect(`/behandling/${response.behandlingId}`)
}
