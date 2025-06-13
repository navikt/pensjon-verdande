import { Accordion } from '@navikt/ds-react'
import { NavLink } from 'react-router'
import { MeResponse } from '~/types/brukere'

export type Props = {
  me: MeResponse,
}


let administrasjonMeny = [
  ['INFOBANNER_PSAK', `/infobanner`, 'Infobanner i PSAK'],
  ['LAAS_OPP_SAK', `/laas-opp-sak`, 'Lås opp sak'],
  ['LAASTE_VEDTAK', `/laaste-vedtak`, 'Låste vedtak'],
  ['LINKE_DNR_TIL_FNR', `/linke-dnr-fnr`, 'Linke Dnr Fnr'],
  ['VERIFISER_ANTALL_FRA_MOT', `/leveattester-sokos-spkmottak`, 'Verifiser antall fra MOT'],
]

const batcherMeny = [
  [ 'BATCH_KJORINGER', '/batcher', 'Alle batchkjøringer' ],
  [ 'ALDERSOVERGANG', '/aldersovergang', 'Aldersovergang' ],
  [ 'LEVER_SAMBOEROPPLYSNING', '/lever-samboeropplysning', 'Lever Samboeropplysning' ],
  [ 'ADHOC_BREVBESTILLING', `/adhocbrev`, 'Adhoc brevbestilling' ],
  [ 'HENT_OPPLYSNINGER_FRA_SKATT', `/bpen096`, 'Hent opplysninger fra Skatt' ],
  [ 'LOEPENDE_INNTEKTSAVKORTING', `/bpen090`, 'Løpende inntektsavkorting' ],
  [ 'BESTEM_ETTEROPPGJOER_RESULTAT', `/bestem-etteroppgjor-resultat`, 'Bestem etteroppgjør resultat' ],
  [ 'FASTSETTE_INNTEKT_FOR_UFOERETRYGD', `/bpen091`, 'Fastsette inntekt for uføretrygd' ],
  [ 'REGULERING', `/batch/regulering`, 'Regulering' ],
  [ 'REGULERING', `/batch/reguleringv2`, 'Regulering Next' ],
  [ 'OMREGNING_VED_OPPTJENINGSENDRING', `/opptjening/kategoriserbruker`, 'Omregning ved opptjeningsendring' ],
  [ 'GJENLEVENDEPENSJON_UTVIDET_RETT', `/gjp`, 'Gjenlevendepensjon - utvidet rett' ],
  [ 'INNTEKTSKONTROLL', `/batch/inntektskontroll`, 'Inntektskontroll' ],
]

let omregningMeny = [
  ['OMREGN_YTELSER', '/omregning/behandlinger', 'Behandlinger'],
  ['OMREGN_YTELSER', '/omregning', 'Omregn ytelser'],
  ['OMREGN_YTELSER', '/omregningStatistikk', 'Omregn statistikk'],
]

let behandlingerMeny = [
  ['SE_BEHANDLINGER', '/behandlinger', 'Alle behandlinger'],
  ['SE_BEHANDLINGER', '/behandlinger/FEILENDE', 'Feilende'],
  ['SE_BEHANDLINGER', '/behandlinger/DEBUG', 'I debug'],
  ['SE_BEHANDLINGER', '/behandlinger/STOPPET', 'Stoppede'],
  ['SE_BEHANDLINGER', '/behandlinger/UNDER_BEHANDLING', 'Under behandling'],
  ['SE_BEHANDLINGER', '/behandlinger/OPPRETTET', 'Opprettet'],
  ['SE_BEHANDLINGER', '/behandlinger/FULLFORT', 'Fullførte'],
]

export default function VenstreMeny(props: Props) {
  let me = props.me

  function harRolle(rolle: string) {
    if (!me) {
      return false
    }
    return me.verdandeRoller.find(it => it.toUpperCase() == rolle.toUpperCase())
  }

  function harTilgang(operasjon: string) {
    if (!me) {
      return false
    }
    // TODO: Fjern harRolle-fallback når brukere har fått tilgangskontroll satt opp i Verdande
    return harRolle('NDU') || harRolle('VERDANDE') || me.tilganger.find(it => it == operasjon)
  }

  function tilgangNavLink(operasjon: string, link: string, label: string) {
    if (harTilgang(operasjon)) {
      return (<li key={operasjon + link + label}><NavLink to={link}>{label}</NavLink></li>)
    } return (<></>)
  }

  function byggMeny(navn: string, menyElementer: string[][]) {
    let harTilgangTilMeny = menyElementer.some(([operasjon]) => harTilgang(operasjon))

    if (harTilgangTilMeny) {
      return (
        <Accordion.Item defaultOpen key={navn}>
          <Accordion.Header>{navn}</Accordion.Header>
          <Accordion.Content>
            <ul>
              {
                menyElementer.map(([operasjon, link, label]) => (tilgangNavLink(operasjon, link, label)))
              }
            </ul>
          </Accordion.Content>
        </Accordion.Item>
      )
    } else {
      return (<></>)
    }
  }

  return (
    <div id='sidebar'>
      <nav>
        <Accordion size="small" headingSize="xsmall">
          <Accordion.Item>
            <NavLink to={`/dashboard`}>Dashboard</NavLink>
          </Accordion.Item>

          {
            harTilgang('SE_BEHANDLINGER') ?
              (
                <Accordion.Item>
                  <NavLink to={`/sok`}>Søk</NavLink>
                </Accordion.Item>
              ) : (
                <></>
              )
          }

          {
            harRolle('VERDANDE_ADMIN') ?
              (<Accordion.Item>
                <NavLink to={`/brukere`}>Brukere</NavLink>
              </Accordion.Item>)
              : (<></>)
          }

          {byggMeny('Administrasjon', administrasjonMeny)}
          {byggMeny("Batcher", batcherMeny)}
          {byggMeny("Behandlinger", behandlingerMeny)}
          {byggMeny("Omregning", omregningMeny)}

        </Accordion>

      </nav>
    </div>
  )
}