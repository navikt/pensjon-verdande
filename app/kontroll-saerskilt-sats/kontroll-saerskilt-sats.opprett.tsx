import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import {
  opprettKontrollereSaerskiltSatsBehandling,
} from '~/kontroll-saerskilt-sats/kontroll-saerskilt-sats.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const response = await opprettKontrollereSaerskiltSatsBehandling({
    kjoereMaaned: updates.kjoereMaaned as string,
    kontrollAar: updates.kontrollAar as string,
    oensketVirkMaaned: updates.oensketVirkMaaned ? (updates.oensketVirkMaaned as string) : undefined,
    kjoeretidspunkt: updates.kjoeretidspunkt ? (updates.kjoeretidspunkt as string) : undefined,
  }, request)

  return redirect(`/behandling/${response.behandlingId}`)
}
