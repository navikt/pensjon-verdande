import type { ActionFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { hentMuligeAldersoverganger } from '~/services/batch.bpen005.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const accessToken = await requireAccessToken(request)
  const { kjoeretidspunkt } = await request.json()

  try {
    const result = await hentMuligeAldersoverganger(accessToken, kjoeretidspunkt)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Feil ved henting av aldersoverganger', error)
    return new Response('Feil', { status: 502 })
  }
}