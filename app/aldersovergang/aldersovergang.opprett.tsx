import { redirect } from 'react-router'
import { opprettAldersovergang } from '~/aldersovergang/behandling.aldersovergang.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/aldersovergang.opprett'

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettAldersovergang(
    accessToken,
    +updates.behandlingsmaned,
    updates.kjoeretidspunkt as string,
    updates.begrensetUtplukk === 'true',
  )

  return redirect(`/behandling/${response.behandlingId}`)
}
