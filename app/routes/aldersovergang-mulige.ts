import type { LoaderFunctionArgs } from 'react-router'
import { requireAccessToken } from '~/services/auth.server'
import { hentMuligeAldersoverganger } from '~/services/batch.bpen005.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const accessToken = await requireAccessToken(request)

  try {
    const result = await hentMuligeAldersoverganger(accessToken)
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