import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen014 } from '~/services/batch.bpen014server'



export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)
  const eps2g = formData.get('eps2g') === 'true'
  const gjenlevende = formData.get('gjenlevende') === 'true'

  let response = await opprettBpen014(accessToken, + updates.aar,eps2g, gjenlevende)

  return redirect(`/behandling/${response.behandlingId}`)
}