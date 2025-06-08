import type { ActionFunctionArgs } from 'react-router';
import { requireAccessToken } from '~/services/auth.server'
import { oppdaterOmregningInput } from '~/services/batch.omregning.bpen093'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const omregnedeSaker = (formData.get('saksnummerListe') as string)
    .split('\n')
    .map((t: string) => t.trim())
    .filter((t: string) => t !== '')
    .map(Number)
  console.log("Saker", omregnedeSaker)

  let requestPen: { saker: number[] } = {
    saker: omregnedeSaker,
  }

  return await oppdaterOmregningInput(accessToken, requestPen)
}