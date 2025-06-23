import { ActionFunctionArgs, redirect } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { startAfpEtteroppgjor } from '~/routes/afp-etteroppgjor/afp-etteroppgjor.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let response = await startAfpEtteroppgjor(accessToken)

  return redirect(`/behandling/${response.behandlingId}`)
}

