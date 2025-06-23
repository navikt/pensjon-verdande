import {
  createCookie,
  isRouteErrorResponse,
  Links,
  LinksFunction,
  LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from 'react-router'
import navStyles from '@navikt/ds-css/dist/index.css?url'
import darkStyles from '@navikt/ds-css/dist/darkside/index.css?url'

import appStylesHref from './app.css?url'

import { Box, HStack, Theme, VStack } from '@navikt/ds-react'
import { env } from '~/services/env.server'
import { tryAccessToken } from '~/services/auth.server'
import { hentMe, hentTilgangskontrollMeta } from '~/services/brukere.server'
import IkkeTilgang from '~/components/feilmelding/IkkeTilgang'
import NavHeader from '~/components/nav-header/NavHeader'
import VenstreMeny from '~/components/venstre-meny/VenstreMeny'
import { Route } from './+types/root'
import { useState } from 'react'

export const links: LinksFunction = () => {
  return [
    ...(
      [
        { rel: 'icon', href: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧝‍♀️</text></svg>' },
        { rel: 'stylesheet', href: navStyles },
        { rel: 'stylesheet', href: darkStyles },
        { rel: 'stylesheet', href: appStylesHref },
      ]),
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let accessToken = await tryAccessToken(request)

  let darkmode = await createCookie("darkmode").parse(request.headers.get('cookie'))

  return {
    env: env.env,
    me: accessToken ? await hentMe(accessToken) : undefined,
    tilgangskontrollMeta: accessToken ? await hentTilgangskontrollMeta(accessToken) : undefined,
    darkmode: darkmode === 'true' || darkmode === true,
  }
}

export default function App() {
  const navigation = useNavigation()

  const { env, me, darkmode } = useLoaderData<typeof loader>()
  const [isDarkmode, setIsDarkmode] = useState<boolean>(darkmode)

  function setDarkmode(darkmode: boolean) {
    setIsDarkmode(darkmode)
    document.cookie = `darkmode=${encodeURIComponent(btoa(darkmode.toString()))}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

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
    <Theme theme={isDarkmode ? 'dark' : 'light'}>
    <VStack gap='0' style={{ width: '100vw' }}>
      {
        me ? (
          <NavHeader erProduksjon={env === 'p'} env={env} me={me} darkmode={isDarkmode} setDarkmode={setDarkmode}></NavHeader>
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

        <Box.New
          className={navigation.state === 'loading' ? 'loading' : ''}
          id='detail'
        >
          <Outlet />
        </Box.New>
      </HStack>
    </VStack>
    </Theme>

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