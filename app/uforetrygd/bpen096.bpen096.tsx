import { type ActionFunctionArgs, redirect } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen096 } from '~/uforetrygd/batch.bpen096.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen096(accessToken, +updates.maksAntallSekvensnummer, +updates.sekvensnummerPerBehandling, updates.dryRun === 'true', updates.debug === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
