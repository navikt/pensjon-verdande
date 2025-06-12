import { LinksFunction } from 'react-router'

import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from 'react-router';
import navStyles from '@navikt/ds-css/dist/index.css?url'

import appStylesHref from './app.css?url'

import { Accordion, ActionMenu, HStack, InternalHeader, Spacer, VStack } from '@navikt/ds-react'
import { LoaderFunctionArgs } from 'react-router';
import { env } from '~/services/env.server'
import { getNAVident } from '~/services/auth.server'
import {
  BarChartIcon, BookIcon, ExternalLinkIcon,
  MenuGridIcon,
} from '@navikt/aksel-icons'

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
  const navIdent = await getNAVident(request)

  return {
    env: env.env,
    navIdent: navIdent,
  }
}

export default function App() {
  const navigation = useNavigation()

  const { env, navIdent } = useLoaderData<typeof loader>()

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
      <InternalHeader className={env === 'p' ? 'navds-tag--error-filled' : ''}>
        <InternalHeader.Title as='h1'>
          Verdande
          {env != 'p' ? (
          <span className="header-environment-postscript">
            {env.toUpperCase()}
          </span>
            ) : (<></>)
          }
        </InternalHeader.Title>
        {env === 'p' ? (
          <InternalHeader.Title as='h1'>
            P R O D U K S J O N !
          </InternalHeader.Title>
        ) : (<></>)
        }
        <Spacer />

        <ActionMenu>
          <ActionMenu.Trigger>
            <InternalHeader.Button>
              <MenuGridIcon
                fontSize="1.5rem"
                title="Systemer og oppslagsverk"
              />
            </InternalHeader.Button>
          </ActionMenu.Trigger>
          <ActionMenu.Content>
            <ActionMenu.Group label="Behandlingsløsningen">
              <ActionMenu.Item
                icon={<BookIcon />}
              >
                <a
                  target="_blank"
                  href={"https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html"}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  Dokumentasjon
                </a>
                <ExternalLinkIcon/>

              </ActionMenu.Item>
              <ActionMenu.Item
                icon={<BarChartIcon />}
              >
                <a
                  target="_blank"
                  href={"https://grafana.nav.cloud.nais.io/goto/mgXUC1LHg?orgId=1"}
                  style={{ textDecoration: "none", color: "black" }}
                >
                  Grafanadashboard
                </a>
                <ExternalLinkIcon/>
              </ActionMenu.Item>
            </ActionMenu.Group>
          </ActionMenu.Content>
        </ActionMenu>

        <InternalHeader.User name={navIdent ? navIdent : ''} />
      </InternalHeader>
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
                      <NavLink to={`/bpen090`}>Løpende inntektsavkorting</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/bestem-etteroppgjor-resultat`}>Bestem etteroppgjør resultat</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/bpen091`}>Fastsette inntekt for uføretrygd</NavLink>
                    </li>

                    <li>
                      <NavLink to={`/batch/regulering`}>Regulering</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/batch/reguleringv2`}>Regulering Next</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/opptjening/kategoriserbruker`}>Omregning ved opptjeningsendring</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/gjp`}>Gjenlevendepensjon - utvidet rett</NavLink>
                    </li>
                    <li>
                      <NavLink to={`/batch/inntektskontroll`}>Inntektskontroll</NavLink>
                    </li>
                    <li>
                      <Accordion.Item defaultOpen={false}>
                        <Accordion.Header>
                          Omregning
                        </Accordion.Header>
                        <Accordion.Content>
                          <NavLink to={`/omregning`}>Omregn ytelser</NavLink>
                          <NavLink to={`/omregningStatistikk`}>Omregn statistikk</NavLink>
                        </Accordion.Content>
                      </Accordion.Item>
                    </li>
                  </ul>
                </Accordion.Content>
              </Accordion.Item>

              <Accordion.Item defaultOpen>
                <Accordion.Header>Behandlinger</Accordion.Header>
                <Accordion.Content>
                  <ul>
                    <li><NavLink to={`/behandlinger`} end>
                      Alle behandlinger
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
                  <NavLink to={`/infobanner`}>Infobanner i PSAK</NavLink>
                  <NavLink to={`/laaste-vedtak`}>Låste vedtak</NavLink>
                  <NavLink to={`/laas-opp-sak`}>Lås opp sak</NavLink>
                  <NavLink to={`/linke-dnr-fnr`}>Linke Dnr Fnr</NavLink>
                  <NavLink to={`/leveattester-sokos-spkmottak`}>Verifiser antall fra MOT</NavLink>
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
    </body>
    </html>
  )
}
