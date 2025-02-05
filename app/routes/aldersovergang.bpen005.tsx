import type { ActionFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettBpen005 } from '~/services/batch.bpen005.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettBpen005(accessToken, +updates.behandlingsmaned, updates.begrensetUtplukk === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}
