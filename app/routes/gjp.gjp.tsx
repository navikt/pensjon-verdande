import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettGjpUtvidetrett } from '~/services/batch.gjp-utvidetrett.server'



export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettGjpUtvidetrett(accessToken, updates.dryRun === 'true', +updates.venteperiodeDager, updates.sakIdFilter ? +updates.sakIdFilter : null)

  return redirect(`/behandling/${response.behandlingId}`)
}
