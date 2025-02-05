import type { ActionFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettAdhocBrevBehandling } from '~/services/batch.adhocBrev.server'


export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  let response = await opprettAdhocBrevBehandling(accessToken, updates.brevmal as string)

  return redirect(`/behandling/${response.behandlingId}`)
}
