import type { ActionFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
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