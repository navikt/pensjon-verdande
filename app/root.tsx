import type { LinksFunction } from '@remix-run/node'

import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import navInternalStyles from '@navikt/ds-css-internal/dist/index.css'
import navStyles from '@navikt/ds-css/dist/index.css'

import appStylesHref from './app.css'

import { cssBundleHref } from '@remix-run/css-bundle'
import { Accordion, HStack, InternalHeader, Spacer, VStack } from '@navikt/ds-react'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { env } from '~/services/env.server'
import { getNAVident } from '~/services/auth.server'

export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [
        { rel: 'stylesheet', href: cssBundleHref },
        { rel: 'stylesheet', href: navStyles },
        { rel: 'stylesheet', href: navInternalStyles },
        { rel: 'stylesheet', href: appStylesHref },
      ]
      : []),
  ]
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const navIdent = await getNAVident(request)

  return json({
    env: env.env,
    navIdent: navIdent,
  })
}

export default function App() {
  const navigation = useNavigation()

  const { env, navIdent } = useLoaderData<typeof loader>()

  return (
    <html lang='en'>
    <head>
      <title>Verdande</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <Meta />
      <Links />
    </head>
    <body>
    <VStack gap='0' style={{ width: '100%' }}>
      {env === 'p' ? (
        <InternalHeader className={'navds-tag--error-filled'}>
          <InternalHeader.Title as='h1'>Verdande</InternalHeader.Title>
          <InternalHeader.Title as='h1'>
            P R O D U K S J O N !
          </InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name={navIdent ? navIdent : ''} />
        </InternalHeader>
      ) : (
        <InternalHeader>
          <InternalHeader.Title as='h1'>Verdande</InternalHeader.Title>
          <Spacer />
          <InternalHeader.User name={navIdent ? navIdent : ''} />
        </InternalHeader>
      )}
      <HStack gap='0' wrap={false}>
        <div id='sidebar'>
          <nav>
            <Accordion size="small" headingSize="xsmall">
              <Accordion.Item>
                <NavLink to={`/dashboard`}>Dashboard</NavLink>
              </Accordion.Item>

              <Accordion.Item>
                <NavLink to={`/sok`}>Søk</NavLink>
              </Accordion.Item>


              <Accordion.Item defaultOpen>
                <Accordion.Header>Batcher</Accordion.Header>
                <Accordion.Content>
                  <ul>
                    <li>
                      <NavLink to={`/batcher`}>Kjøringer</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/aldersovergang`}>Aldersovergang</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/lever-samboeropplysning`}>Lever Samboeropplysning</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/adhocbrev`}>Adhoc brevbestilling</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/bpen096`}>Hent opplysninger fra Skatt</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/bpen091`}>Fastsette inntekt for uføretrygd</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/rtv-brev-sammenligning`}>Hent opplysninger fra Skatt</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/overfortilkabal`}>Klager til kabal</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/omsorgsopptjening`}>Omsorgsopptjening uttrekk</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/omregning`}>Omregning - BPEN093</NavLink>
                    </li>
                    <li>
                      {env != 'p' ? (
                        <NavLink to={`/batch/regulering`}>Regulering</NavLink>
                      ) : (
                        <div />
                      )}
                    </li>
                  </ul>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item defaultOpen>
                <Accordion.Header>Behandlinger</Accordion.Header>
                <Accordion.Content>
                  <ul>
                    <li><NavLink to={`/behandlinger`} end>
                      Alle Behandlinger
                    </NavLink></li>
                    <li>
                      <NavLink to={`/behandlinger/FEILENDE`}>
                        Feilende
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={`/behandlinger/DEBUG`}>I debug</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/behandlinger/STOPPET`}>Stoppede</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/behandlinger/UNDER_BEHANDLING`}>
                        Under behandling
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={`/behandlinger/OPPRETTET`}>
                        Opprettet
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to={`/behandlinger/FULLFORT`}>
                        Fullførte
                      </NavLink>
                    </li>
                  </ul>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item defaultOpen>
                <Accordion.Header>
                  Adminverktøy
                </Accordion.Header>
                <Accordion.Content>
                  <NavLink to={`/laaste-vedtak`}>Låste vedtak</NavLink>
                </Accordion.Content>
              </Accordion.Item>
            </Accordion>

          </nav>
        </div>

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
    <LiveReload />
    </body>
    </html>
  )
}
