import { isRouteErrorResponse, LinksFunction } from 'react-router'

import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from 'react-router';
import navStyles from '@navikt/ds-css/dist/index.css?url'

import appStylesHref from './app.css?url'

import { HStack, VStack } from '@navikt/ds-react'
import { LoaderFunctionArgs } from 'react-router';
import { env } from '~/services/env.server'
import { tryAccessToken } from '~/services/auth.server'
import { hentMe, hentTilgangskontrollMeta } from '~/services/brukere.server'
import IkkeTilgang from '~/components/feilmelding/IkkeTilgang'
import NavHeader from '~/components/nav-header/NavHeader'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { Route } from './+types/root';

export const links: LinksFunction = () => {
  return [
    ...(
      [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧝‍♀️</text></svg>' },
        { rel: 'stylesheet', href: navStyles },
        { rel: 'stylesheet', href: appStylesHref },
      ]),
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let accessToken = await tryAccessToken(request)

  return {
    env: env.env,
    me: accessToken ? await hentMe(accessToken) : undefined,
    tilgangskontrollMeta: accessToken ? await hentTilgangskontrollMeta(accessToken) : undefined
  }
}

export default function App() {
  const navigation = useNavigation()

  const { env, me } = useLoaderData<typeof loader>()

  let title = env === 'p' ? 'Verdande' : `(${env.toUpperCase()}) Verdande`

  return (
    <html lang='en'>
    <head>
      <title>{title}</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <Meta />
      <Links />
    </head>
    <body>
    <VStack gap='0' style={{ width: '100%' }}>
      {
        me ? (
          <NavHeader erProduksjon={env === 'p'} env={env} me={me}></NavHeader>
        ) : (
          <></>
        )
      }

      <HStack gap='0' wrap={false}>
        {
          me ? (
            <VenstreMeny me={me}></VenstreMeny>
          ) : (
            <></>
          )
        }

        <div
          className={navigation.state === 'loading' ? 'loading' : ''}
          id='detail'
        >
          <Outlet />
        </div>
      </HStack>
    </VStack>

    <ScrollRestoration />
    <Scripts />
    </body>
    </html>
  )
}

export function ErrorBoundary({
                                error,
                              }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      console.log(error)
      return (<IkkeTilgang error={error}></IkkeTilgang>)
    } else {
      return (
        <>
          <h1>
            {error.status} {error.statusText}
          </h1>
          <p>{error.data}</p>
        </>
      );
    }
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}