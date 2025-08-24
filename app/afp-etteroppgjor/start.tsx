import { ActionFunctionArgs, redirect } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { startAfpEtteroppgjor } from '~/afp-etteroppgjor/afp-etteroppgjor.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  let formData = Object.fromEntries(await request.formData())

  let response = await startAfpEtteroppgjor(accessToken, {
    kjøreår: +(formData.kjorear as string),
  })

  return redirect(`/behandling/${response.behandlingId}`)
}

