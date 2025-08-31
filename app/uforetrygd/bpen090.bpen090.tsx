import { type ActionFunctionArgs, redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen090 } from '~/uforetrygd/batch.bpen090.server'



export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen090(accessToken, +updates.kjoremaaned, updates.begrensUtplukk === 'true', updates.dryRun === 'true', +updates.prioritet)

  return redirect(`/behandling/${response.behandlingId}`)
}
