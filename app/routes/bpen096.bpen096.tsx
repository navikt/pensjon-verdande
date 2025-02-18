import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen096 } from '~/services/batch.bpen096.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen096(accessToken, +updates.maksAntallSekvensnummer, +updates.sekvensnummerPerAktivitet, updates.dryRun === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
