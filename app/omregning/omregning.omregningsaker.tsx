import { oppdaterOmregningInput } from '~/omregning/batch.omregning.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/omregning.omregningsaker'

export const action = async ({ request }: Route.ActionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const omregnedeSaker = (formData.get('saksnummerListe') as string)
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)

  const requestPen: { saker: number[] } = {
    saker: omregnedeSaker,
  }

  return await oppdaterOmregningInput(accessToken, requestPen)
}
