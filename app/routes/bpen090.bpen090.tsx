import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen090 } from '~/services/batch.bpen090.server'



export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen090(accessToken, +updates.kjoremaaned, updates.begrensUtplukk === 'true', updates.dryRun === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
