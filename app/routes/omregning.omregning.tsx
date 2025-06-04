import type { ActionFunctionArgs} from '@remix-run/node';
import { redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import type { OmregningRequest } from '~/types'
import { opprettOmregningbehandling } from '~/services/batch.omregning.bpen093'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)

  const brevkoderSoker = {
    AlderGammeltRegelverk: updates.brevkodeSokerAlderGammeltRegelverk,
    AlderNyttRegelverk: updates.brevkodeSokerAlderNyttRegelverk,
    Uforetrygd: updates.brevkodeSokerUforetrygd,
    Barnepensjon: updates.brevkodeSokerBarnepensjon,
    AFP: updates.brevkodeSokerAFP,
    Gjenlevendepensjon: updates.brevkodeSokerGjenlevendepensjon,
    AFPPrivat: updates.brevkodeSokerAFPPrivat,
  }

  const brevkoderBerorteSaker = {
    AlderGammeltRegelverk: updates.brevkodeBerorteSakerAlderGammeltRegelverk,
    AlderNyttRegelverk: updates.brevkodeBerorteSakerAlderNyttRegelverk,
    Uforetrygd: updates.brevkodeBerorteSakerUforetrygd,
    Barnepensjon: updates.brevkodeBerorteSakerBarnepensjon,
    AFP: updates.brevkodeBerorteSakerAFP,
    Gjenlevendepensjon: updates.brevkodeBerorteSakerGjenlevendepensjon,
    AFPPrivat: updates.brevkodeBerorteSakerAFPPrivat,
  }

  const omregningRequest = {
    behandlingsnokkel: updates.behandlingsnokkel,
    omregningstidspunkt: updates.omregningstidspunkt,
    omregneAFP: updates.omregneAFP === 'true',
    behandleApneKrav: updates.behandleApneKrav === 'true',
    brukFaktoromregning: updates.brukFaktoromregning === 'true',
    opprettAlleOppgaver: updates.opprettAlleOppgaver === 'true',
    sjekkYtelseFraAvtaleland: updates.sjekkYtelseFraAvtaleland === 'true',
    kravGjelder: updates.kravGjelder,
    kravArsak: updates.kravArsak,
    toleransegrenseSett: updates.toleransegrenseSett,
    oppgaveSett: updates.oppgaveSett,
    oppgavePrefiks: updates.oppgavePrefiks,
    skalSletteIverksettingsoppgaver: updates.skalSletteIverksettingsoppgaver === 'true',
    skalBestilleBrev: updates.skalBestilleBrev === 'true',
    skalSamordne: updates.skalSamordne === 'true',
    skalDistribuereUforevedtak: updates.skalDistribuereUforevedtak === 'true',
    sendBrevBerorteSaker: updates.sendBrevBerorteSaker === 'true',
    brevkoderSoker: brevkoderSoker,
    brevkoderBerorteSaker: brevkoderBerorteSaker,
    skalIverksettOnline: updates.skalIverksettOnline === 'true',
  }  as OmregningRequest

  const accessToken = await requireAccessToken(request)

  let response = await opprettOmregningbehandling(accessToken, omregningRequest)

  return redirect(`/behandling/${response.behandlingId}`)
}
