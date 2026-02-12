import { redirect } from 'react-router'
import { opprettOpptjeningsendringMandeligOmregning } from '~/opptjening/manedlig/opptjening.manedlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/opptjening.manedlig.omregning.opprett'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettOpptjeningsendringMandeligOmregning(
    accessToken,
    +updates.behandlingsmaned,
    updates.kjoeretidspunkt as string,
    updates.avsjekkForKjoring === 'true',
  )

  return redirect(`/behandling/${response.behandlingId}`)
}
