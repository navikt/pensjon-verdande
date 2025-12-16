import type { ActionFunctionArgs } from 'react-router'
import { redirect } from 'react-router'
import { opprettAldersovergang } from '~/aldersovergang/behandling.aldersovergang.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const begrensetUtplukk = updates.begrensetUtplukk === 'true'
  const begrensetUtplukkFnrListe =
    begrensetUtplukk && typeof updates.begrensetUtplukkFnrListe === 'string' && updates.begrensetUtplukkFnrListe
      ? (JSON.parse(updates.begrensetUtplukkFnrListe) as string[])
      : null

  const response = await opprettAldersovergang(
    accessToken,
    +updates.behandlingsmaned,
    updates.kjoeretidspunkt as string,
    begrensetUtplukk,
    begrensetUtplukkFnrListe,
  )

  return redirect(`/behandling/${response.behandlingId}`)
}
