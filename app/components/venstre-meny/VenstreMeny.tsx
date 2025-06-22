import { NavLink } from 'react-router'
import { MeResponse } from '~/types/brukere'
import { useState } from 'react'
import {
  CalendarIcon,
  ChevronDownIcon, CurrencyExchangeIcon,
  HouseIcon,
  MagnifyingGlassIcon, MenuElipsisVerticalCircleIcon,
  NumberListIcon,
  PersonGroupIcon,
  SackPensionIcon, WrenchIcon,
} from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

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
  ['ADHOC_BREVBESTILLING', `/adhocbrev`, 'Adhoc brevbestilling'],
  ['ALDERSOVERGANG', '/aldersovergang', 'Aldersovergang'],
  ['BATCH_KJORINGER', '/batcher', 'Alle batchkjøringer'],
  ['BESTEM_ETTEROPPGJOER_RESULTAT', `/bestem-etteroppgjor-resultat`, 'Bestem etteroppgjør resultat'],
  ['FASTSETTE_INNTEKT_FOR_UFOERETRYGD', `/bpen091`, 'Fastsette inntekt for uføretrygd'],
  ['GJENLEVENDEPENSJON_UTVIDET_RETT', `/gjp`, 'Gjenlevendepensjon - utvidet rett'],
  ['HENT_OPPLYSNINGER_FRA_SKATT', `/bpen096`, 'Hent opplysninger fra Skatt'],
  ['INNTEKTSKONTROLL', `/batch/inntektskontroll`, 'Inntektskontroll'],
  ['LEVER_SAMBOEROPPLYSNING', '/lever-samboeropplysning', 'Lever Samboeropplysning'],
  ['LOEPENDE_INNTEKTSAVKORTING', `/bpen090`, 'Løpende inntektsavkorting'],
  ['OMREGNING_VED_OPPTJENINGSENDRING', `/opptjening/kategoriserbruker`, 'Omregning ved opptjeningsendring'],
  ['REGULERING', `/batch/regulering`, 'Regulering'],
  ['REGULERING', `/batch/reguleringv2`, 'Regulering Next'],
]

let omregningMeny = [
  ['OMREGN_YTELSER', '/omregning/behandlinger', 'Behandlinger'],
  ['OMREGN_YTELSER', '/omregning', 'Omregn ytelser'],
  ['OMREGN_YTELSER', '/omregningStatistikk', 'Omregn statistikk'],
]

let behandlingerMeny = [
  ['SE_BEHANDLINGER', '/behandlinger', 'Alle behandlinger'],
  ['SE_BEHANDLINGER', '/behandlinger/DEBUG', 'I debug'],
  ['SE_BEHANDLINGER', '/behandlinger/FEILENDE', 'Feilende'],
  ['SE_BEHANDLINGER', '/behandlinger/FULLFORT', 'Fullførte'],
  ['SE_BEHANDLINGER', '/behandlinger/OPPRETTET', 'Opprettet'],
  ['SE_BEHANDLINGER', '/behandlinger/STOPPET', 'Stoppede'],
  ['SE_BEHANDLINGER', '/behandlinger/UNDER_BEHANDLING', 'Under behandling'],
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
      return (
        <li key={operasjon + link + label}>
          <Link as={NavLink} to={link} className="submenu-link" end style={{display: 'flex', justifyContent: 'flex-start'}}>
            <span className="meny-ikon"><MenuElipsisVerticalCircleIcon title={label} fontSize="1.5rem" /></span>
            <span className="meny-tekst">{label}</span>
          </Link>
        </li>
      )
    }
    return (<></>)
  }

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleMenuClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  function byggMeny(navn: string, menyElementer: string[][], idx: number, p0?: any) {
    let harTilgangTilMeny = menyElementer.some(([operasjon]) => harTilgang(operasjon))
    if (harTilgangTilMeny) {
      return (
        <li className={openIndex === idx ? 'open' : ''}
            >
          <Link id="filter-toggle" as="a" onClick={() => handleMenuClick(idx)} style={{display: 'flex', justifyContent: 'flex-start'}}>
            <span className="meny-ikon">{p0}</span>
            <span className="meny-tekst">{navn}</span>
            <ChevronDownIcon title='a11y-title' fontSize='1.5rem' style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </Link>
          <ul className='submenu'>
            {
              menyElementer.map(([operasjon, link, label]) => (tilgangNavLink(operasjon, link, label)))
            }
          </ul>
        </li>
      )
    } else {
      return (<></>)
    }
  }

  return (
    <div id="venstre-meny">
      <nav className="sticky-sidebar">
        <ul className='mainmenu'>
          <li>
            <Link as={NavLink} to={`/dashboard`} style={{display: 'flex', justifyContent: 'flex-start'}}>
              <span className="meny-ikon"><HouseIcon title='Hjem' fontSize='1.5rem' /></span>
              <span className="meny-tekst">Hjem</span>
            </Link>
          </li>

          <li>
            <Link as={NavLink} to={`/kalender`} style={{display: 'flex', justifyContent: 'flex-start'}}>
              <span className="meny-ikon"><CalendarIcon title='Kalender' fontSize='1.5rem' /></span>
              <span className="meny-tekst">Kalender</span>
            </Link>
          </li>

          {
            harTilgang('SE_BEHANDLINGER') ?
              (
                <li>
                  <Link as={NavLink} to={`/sok`} style={{display: 'flex', justifyContent: 'flex-start'}}>
                    <span className="meny-ikon"><MagnifyingGlassIcon title='Søk' fontSize='1.5rem' className={"meny-ikon"} /></span>
                    <span className="meny-tekst">Søk</span>
                  </Link>
                </li>
              ) : (
                <></>
              )
          }
          {
            harRolle('VERDANDE_ADMIN') ?
              (<li>
                <Link as={NavLink} to={`/brukere`} style={{display: 'flex', justifyContent: 'flex-start'}}>
                   <span className="meny-ikon"><PersonGroupIcon title='Brukere' fontSize='1.5rem' className={"meny-ikon"} /></span>
                  <span className="meny-tekst">Brukere</span>
                </Link>
              </li>)
              : (<></>)
          }

          {byggMeny('Større kjøringer', batcherMeny, 0, <SackPensionIcon title="Større kjøringer" fontSize="1.5rem" className={"meny-ikon"} />)}
          {byggMeny('Behandlinger', behandlingerMeny, 1, <NumberListIcon title="Behandlinger" fontSize="1.5rem" className={"meny-ikon"} />)}
          {byggMeny('Omregning', omregningMeny, 2, <CurrencyExchangeIcon title="Omregning" fontSize="1.5rem" className={"meny-ikon"} />)}
          {byggMeny('Vedlikehold', administrasjonMeny, 3, <WrenchIcon title="Vedlikehold" fontSize="1.5rem" className={"meny-ikon"} />)}

        </ul>

      </nav>
    </div>
  )
}