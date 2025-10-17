import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { opprettOpptjeningsendringMandeligOmregning } from '~/opptjening/manedlig/opptjening.manedlig.omregning.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
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
