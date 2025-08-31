import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettAdhocBrevBehandling } from '~/adhocbrev/batch.adhocBrev.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettAdhocBrevBehandling(accessToken, updates.brevmal as string, updates.ekskluderAvdoed === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
