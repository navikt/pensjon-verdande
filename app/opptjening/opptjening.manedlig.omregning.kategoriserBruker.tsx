import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { opprettOpptjeningsendring } from '~/opptjening/batch.opptjeningsendring.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettOpptjeningsendring(accessToken, +updates.behandlingsmaned)

  return redirect(`/behandling/${response.behandlingId}`)
}
