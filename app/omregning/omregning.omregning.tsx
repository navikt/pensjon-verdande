import { redirect } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { OmregningRequest } from '~/types'
import type { Route } from './+types/omregning.omregning'

export const action = async ({ request }: Route.ActionArgs) => {
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
    skalBestilleBrev: updates.skalBestilleBrev,
    skalSamordne: updates.skalSamordne === 'true',
    skalDistribuereUforevedtak: updates.skalDistribuereUforevedtak === 'true',
    sendBrevBerorteSaker: updates.sendBrevBerorteSaker === 'true',
    brevkoderSoker: brevkoderSoker,
    brevkoderBerorteSaker: brevkoderBerorteSaker,
    prioritet: updates.prioritet,
  } as OmregningRequest

  const response = await apiPost<{ behandlingId: number }>(
    '/api/behandling/omregning/opprett',
    omregningRequest,
    request,
  )

  return redirect(`/behandling/${response?.behandlingId}`)
}
