import type { ActionFunctionArgs } from 'react-router'
import { oppdaterOmregningInput } from '~/omregning/batch.omregning.server'
import { requireAccessToken } from '~/services/auth.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const omregnedeSaker = (formData.get('saksnummerListe') as string)
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)
  console.log('Saker', omregnedeSaker)

  const requestPen: { saker: number[] } = {
    saker: omregnedeSaker,
  }

  return await oppdaterOmregningInput(accessToken, requestPen)
}
