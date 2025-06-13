import Bruker from '~/routes/brukere.$brukernavn/Bruker'
import {
  fjernBrukertilgang,
  giBrukerTilgang,
  hentBruker, hentMe,
  hentTilgangskontrollMeta,
} from '~/services/brukere.server'
import { requireAccessToken } from '~/services/auth.server'
import { ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'

export async function action({ params,
                               request,
                             }: ActionFunctionArgs) {
  const accesstoken = await requireAccessToken(request)

  invariant(params.brukernavn, 'Missing brukernavn param')

  let formData = await request.formData()

  if (request.method == 'PUT') {
    await giBrukerTilgang(
      accesstoken,
      params.brukernavn,
      formData.get('operasjon') as string,
    )
  } else if (request.method == 'DELETE') {
    await fjernBrukertilgang(
      accesstoken,
      params.brukernavn,
      formData.get('operasjon') as string
    )
  } else {
    throw new Error(`Ugyldig HTTP-metode: ${request.method}`)
  }

  return null
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.brukernavn, 'Missing brukernavn param')

  const accesstoken = await requireAccessToken(request)

  return {
    bruker: params.brukernavn === "me" ? await hentMe(accesstoken) : await hentBruker(accesstoken, params.brukernavn),
    tilgangskontrollmeta: await hentTilgangskontrollMeta(accesstoken),
    readOnly: params.brukernavn === "me", // hack -- må styres av pen
  }
}

export default function Foo() {
  const { bruker, tilgangskontrollmeta, readOnly } = useLoaderData<typeof loader>()

  return (
    <Bruker bruker={bruker} tilgangskontrollmeta={tilgangskontrollmeta} readOnly={readOnly}></Bruker>
  )
}