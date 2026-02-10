import invariant from 'tiny-invariant'
import Bruker from '~/brukere/Bruker'
import {
  fjernBrukertilgang,
  giBrukerTilgang,
  hentBruker,
  hentMe,
  hentTilgangskontrollMeta,
} from '~/brukere/brukere.server'
import { requireAccessToken } from '~/services/auth.server'
import type { Route } from './+types/$brukernavn'

export async function action({ params, request }: Route.ActionArgs) {
  const accesstoken = await requireAccessToken(request)

  invariant(params.brukernavn, 'Missing brukernavn param')

  const formData = await request.formData()

  if (request.method === 'PUT') {
    await giBrukerTilgang(accesstoken, params.brukernavn, formData.get('operasjon') as string)
  } else if (request.method === 'DELETE') {
    await fjernBrukertilgang(accesstoken, params.brukernavn, formData.get('operasjon') as string)
  } else {
    throw new Error(`Ugyldig HTTP-metode: ${request.method}`)
  }

  return null
}

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.brukernavn, 'Missing brukernavn param')

  return {
    bruker: params.brukernavn === 'me' ? await hentMe(request) : await hentBruker(request, params.brukernavn),
    tilgangskontrollmeta: await hentTilgangskontrollMeta(request),
    readOnly: params.brukernavn === 'me', // hack -- må styres av pen
  }
}

export default function Foo({ loaderData }: Route.ComponentProps) {
  const { bruker, tilgangskontrollmeta, readOnly } = loaderData
  console.log(tilgangskontrollmeta)

  return <Bruker bruker={bruker} tilgangskontrollmeta={tilgangskontrollmeta} readOnly={readOnly}></Bruker>
}
