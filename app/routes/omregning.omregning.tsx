import { ActionFunctionArgs, redirect } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { opprettOmregningbehandling } from '~/services/batch.omregning.bpen093'
import { OmregningRequest } from '~/types'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const omregningRequest = {
    behandlingsnokkel: formData.get("behandlingsnokkel") as String,
    omregningstidspunkt: formData.get("omregningstidspunkt") as String,
    omregneAFP: formData.get('omregneAFP') as unknown as Boolean,
    behandleApneKrav: formData.get('behandleApneKrav') as unknown as Boolean,
    brukFaktoromregning: formData.get('brukFaktoromregning') as unknown as Boolean,
    brukKjoreplan: formData.get('brukKjoreplan') as unknown as Boolean,
    opprettAlleOppgaver: formData.get('opprettAlleOppgaver') as unknown as Boolean,
    sjekkYtelseFraAvtaleland: formData.get('sjekkYtelseFraAvtaleland') as unknown as Boolean,
    kravGjelder: formData.get("kravGjelder") as String,
    kravArsak: formData.get("kravArsak") as String,
    toleransegrenseSett: formData.get("toleransegrenseSett") as String,
    oppgaveSett: formData.get("oppgaveSett") as String,
  } as OmregningRequest

  const accessToken = await requireAccessToken(request)

  let response = await opprettOmregningbehandling(accessToken,omregningRequest)

  return redirect(`/behandling/${response.behandlingId}`)
}
