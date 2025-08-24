import type { ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettAldersovergang } from '~/aldersovergang/behandling.aldersovergang.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettAldersovergang(accessToken, +updates.behandlingsmaned, updates.kjoeretidspunkt as string, updates.begrensetUtplukk === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
