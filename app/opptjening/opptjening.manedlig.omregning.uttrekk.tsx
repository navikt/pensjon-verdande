import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettOpptjeningsendringMandeligUttrekk } from '~/opptjening/batch.opptjeningsendringManedligUttrekk.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettOpptjeningsendringMandeligUttrekk(accessToken, +updates.behandlingsmaned)

  return redirect(`/behandling/${response.behandlingId}`)
}
