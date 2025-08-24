import {ActionFunctionArgs, redirect} from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import 'chart.js/auto'
import { opprettOppdaterSakBehandlingPEN } from '~/oppdatersakstatus/oppdatersakstatus.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const data = await request.json()
  let response= await opprettOppdaterSakBehandlingPEN(accessToken, data.startDato)
  return redirect(`/behandling/${response.behandlingId}`)
}
