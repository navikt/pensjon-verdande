import type { ActionFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import type { OmregningRequest } from '~/types'
import { opprettOmregningbehandling } from '~/services/batch.omregning.bpen093'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  console.log("brevkodeSoker: ", updates.brevkodeSoker)
  console.log("brevkodeBerorteSaker: ", updates.brevkodeBerorteSaker)
  
  const omregningRequest = {
    behandlingsnokkel: updates.behandlingsnokkel,
    omregningstidspunkt: updates.omregningstidspunkt,
    omregneAFP: updates.omregneAFP === 'true',
    behandleApneKrav: updates.behandleApneKrav === 'true',
    brukFaktoromregning: updates.brukFaktoromregning === 'true',
    brukKjoreplan: updates.brukKjoreplan === 'true',
    opprettAlleOppgaver: updates.opprettAlleOppgaver === 'true',
    sjekkYtelseFraAvtaleland: updates.sjekkYtelseFraAvtaleland === 'true',
    brukPpen015: updates.brukPpen015 === 'true',
    kravGjelder: updates.kravGjelder,
    kravArsak: updates.kravArsak,
    toleransegrenseSett: updates.toleransegrenseSett,
    oppgaveSett: updates.oppgaveSett,
    oppgavePrefiks: updates.oppgavePrefiks,
    utsattTil: updates.datetimepicker as string,
    skalSletteIverksettingsoppgaver: updates.skalSletteIverksettingsoppgaver === 'true',
    skalBestilleBrev: updates.skalBestilleBrevOgSamordne === 'true',
    skalSamordne: updates.skalBestilleBrevOgSamordne === 'true',
    skalDistribuereUforevedtak: updates.skalDistribuereUforevedtak === 'true',
    sendBrevBerorteSaker: updates.sendBrevBerorteSaker === 'true',
    brevkodeSoker: updates.brevkodeSoker,
    brevkodeBerorteSaker: updates.brevkodeBerorteSaker,
  } as unknown as OmregningRequest

  const accessToken = await requireAccessToken(request)

  let response = await opprettOmregningbehandling(accessToken, omregningRequest)

  return redirect(`/behandling/${response.behandlingId}`)
}
