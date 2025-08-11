import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen055MandeligUttrekk } from '~/services/batch.bpen055ManedligUttrekkserver'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen055MandeligUttrekk(accessToken, +updates.behandlingsmaned)

  return redirect(`/behandling/${response.behandlingId}`)
}
