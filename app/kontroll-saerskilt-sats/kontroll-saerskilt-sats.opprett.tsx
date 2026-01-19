import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import {
  opprettKontrollereSaerskiltSatsBehandling,
} from '~/kontroll-saerskilt-sats/kontroll-saerskilt-sats.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettKontrollereSaerskiltSatsBehandling(accessToken, {
    kjoereMaaned: updates.kjoereMaaned as string,
    kontrollAar: updates.kontrollAar as string,
    oensketVirkMaaned: (updates.oensketVirkMaaned as string) || undefined,
    kjoeretidspunkt: (updates.kjoeretidspunkt as string) || undefined,
  })

  return redirect(`/behandling/${response.behandlingId}`)
}
