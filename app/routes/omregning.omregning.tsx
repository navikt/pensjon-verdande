import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { OmregningRequest } from '~/types'
import { opprettOmregningbehandling } from '~/services/batch.omregning.bpen093'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const omregningRequest = {
    behandlingsnokkel: formData.get('behandlingsnokkel') as String,
    omregningstidspunkt: formData.get('omregningstidspunkt') as String,
    omregneAFP: formData.get('omregneAFP') != null,
    behandleApneKrav: formData.get('behandleApneKrav') != null,
    brukFaktoromregning: formData.get('brukFaktoromregning') != null,
    brukKjoreplan: formData.get('brukKjoreplan') != null,
    opprettAlleOppgaver: formData.get('opprettAlleOppgaver') != null,
    sjekkYtelseFraAvtaleland: formData.get('sjekkYtelseFraAvtaleland') != null,
    kravGjelder: formData.get('kravGjelder') as String,
    kravArsak: formData.get('kravArsak') as String,
    toleransegrenseSett: formData.get('toleransegrenseSett') as String,
    oppgaveSett: formData.get('oppgaveSett') as String,
  } as OmregningRequest

  const accessToken = await requireAccessToken(request)

  let response = await opprettOmregningbehandling(accessToken, omregningRequest)

  return redirect(`/behandling/${response.behandlingId}`)
}
