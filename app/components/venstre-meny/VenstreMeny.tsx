import {
  CalendarIcon,
  ChevronDownIcon,
  CircleIcon,
  CurrencyExchangeIcon,
  HouseIcon,
  NumberListIcon,
  PersonGroupIcon,
  SackPensionIcon,
  WrenchIcon,
} from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'
import type { JSX } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import type { MeResponse } from '~/brukere/brukere'

import styles from './venstre-meny.module.css'

export type Props = {
  me: MeResponse
  showIconMenu: boolean
}

const administrasjonMeny = [
  ['BEHANDLINGSERIE', `/behandlingserie`, 'Behandlingserie'],
  ['UGYLDIGGJOR_ETTEROPPGJOR_HISTORIKK_UFORE', `/etteroppgjor-historikk-ufore`, 'Etteroppgjørhistorikk Uføre'],
  ['INFOBANNER_PSAK', `/infobanner`, 'Infobanner i PSAK'],
  ['MANGLENDE_FOREIGN_KEY_INDEXER', `/manglende-foreign-key-indexer`, 'Manglende indekser for fjernnøkler'],
  ['LAAS_OPP_SAK', `/laas-opp-sak`, 'Lås opp sak'],
  ['LAASTE_VEDTAK', `/laaste-vedtak`, 'Låste vedtak'],
  ['LINKE_DNR_TIL_FNR', `/linke-dnr-fnr`, 'Linke Dnr Fnr'],
  ['VERIFISER_ANTALL_FRA_MOT', `/leveattester-sokos-spkmottak`, 'Verifiser antall fra MOT'],
]

const batcherMeny = [
  ['BATCH_KJORINGER', '/batcher', 'Alle batchkjøringer'],
  ['ADHOC_BREVBESTILLING', `/adhocbrev`, 'Adhoc brevbestilling'],
  ['AFP_ETTEROPPGJOR', '/afp-etteroppgjor', 'AFP Etteroppgjør'],
  ['ALDERSOVERGANG', '/aldersovergang', 'Aldersovergang'],
  ['BESTEM_ETTEROPPGJOER_RESULTAT', `/bestem-etteroppgjor-resultat`, 'Bestem etteroppgjør resultat'],
  ['FASTSETTE_INNTEKT_FOR_UFOERETRYGD', `/bpen091`, 'Fastsette inntekt for uføretrygd'],
  ['HENT_OPPLYSNINGER_FRA_SKATT', `/bpen096`, 'Hent opplysninger fra Skatt'],
  ['INNTEKTSKONTROLL', `/batch/inntektskontroll`, 'Inntektskontroll'],
  ['LEVER_SAMBOEROPPLYSNING', '/lever-samboeropplysning', 'Lever Samboeropplysning'],
  ['LOEPENDE_INNTEKTSAVKORTING', `/bpen090`, 'Løpende inntektsavkorting'],
  ['OMREGNING_VED_OPPTJENINGSENDRING', `/opptjening/manedlig/omregning`, 'Månedlig omregning ved opptjeningsendring'],
  ['OMREGNING_VED_ARLIG_OPPTJENINGSENDRING', `/opptjening/arlig/omregning`, 'Årlig omregning ved opptjeningsendring'],
  ['REGULERING_LES', `/batch/regulering`, 'Regulering'],
]

const omregningMeny = [
  ['OMREGN_YTELSER', '/omregning/behandlinger', 'Behandlinger'],
  ['OMREGN_YTELSER', '/omregning', 'Omregn ytelser'],
  ['OMREGN_YTELSER', '/omregningStatistikk', 'Omregn statistikk'],
]

const behandlingerMeny = [
  ['SE_BEHANDLINGER', '/behandlinger', 'Alle behandlinger'],
  ['SE_BEHANDLINGER', '/alderspensjon/forstegangsbehandling/soknader', 'Alderspensjonssøknader'],
  ['SE_BEHANDLINGER', '/behandlinger/DEBUG', 'I debug'],
  ['SE_BEHANDLINGER', '/behandlinger/FEILENDE', 'Feilende'],
  ['SE_BEHANDLINGER', '/behandlinger/FULLFORT', 'Fullførte'],
  ['SE_BEHANDLINGER', '/behandlinger/OPPRETTET', 'Opprettet'],
  ['SE_BEHANDLINGER', '/behandlinger/STOPPET', 'Stoppede'],
  ['SE_BEHANDLINGER', '/behandlinger/UNDER_BEHANDLING', 'Under behandling'],
]

export default function VenstreMeny(props: Props) {
  const me = props.me

  let currentIndex = 0

  function indexSupplier() {
    currentIndex += 1
    return currentIndex
  }

  function harRolle(rolle: string) {
    if (!me) {
      return false
    }
    return me.verdandeRoller.find((it) => it.toUpperCase() === rolle.toUpperCase())
  }

  function harTilgang(operasjon: string) {
    if (!me) {
      return false
    }
    return me.tilganger.find((it) => it === operasjon)
  }

  function createMenuItem(operasjon: string, link: string, label: string) {
    return (
      <li key={operasjon + link + label}>
        <NavLink
          to={link}
          end
          style={{ display: 'flex', justifyContent: 'flex-start' }}
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          <span className={styles.menyIkon}>
            <CircleIcon title={label} fontSize="1.5rem" />
          </span>
          <span className={styles.menyTekst}>{label}</span>
        </NavLink>
      </li>
    )
  }

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleMenuClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  function byggMeny(navn: string, menyElementer: string[][], indexSupplier: () => number, p0?: JSX.Element) {
    const harTilgangTilMeny = menyElementer.some(([operasjon]) => harTilgang(operasjon))
    if (harTilgangTilMeny) {
      const idx: number = indexSupplier()

      return (
        <li key={`meny-${navn}`} className={openIndex === idx ? styles.open : ''}>
          <Link as="a" onClick={() => handleMenuClick(idx)} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <span className={styles.menyIkon}>{p0}</span>
            <span className={styles.menyTekst}>{navn}</span>
            <ChevronDownIcon
              title="a11y-title"
              fontSize="1.5rem"
              style={{
                marginLeft: 'auto',
                transition: 'transform 0.2s',
                transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Link>
          <ul className={styles.submenu}>
            {menyElementer
              .filter(([operasjon]) => harTilgang(operasjon))
              .map(([operasjon, link, label]) => createMenuItem(operasjon, link, label))}
          </ul>
        </li>
      )
    } else {
      return undefined
    }
  }

  return (
    <nav id={styles.venstreMeny} className={`aksel-theme dark ${props.showIconMenu ? styles.kunIkoner : ''}`}>
      <nav className={''}>
        <ul className={styles.mainmenu}>
          <li>
            <NavLink
              to={`/dashboard`}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <span className={styles.menyIkon}>
                <HouseIcon title="Hjem" fontSize="1.5rem" />
              </span>
              <span className={styles.menyTekst}>Hjem</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to={`/kalender`}
              style={{ display: 'flex', justifyContent: 'flex-start' }}
              className={({ isActive }) => (isActive ? styles.active : '')}
            >
              <span className={styles.menyIkon}>
                <CalendarIcon title="Kalender" fontSize="1.5rem" />
              </span>
              <span className={styles.menyTekst}>Kalender</span>
            </NavLink>
          </li>

          {harRolle('VERDANDE_ADMIN') && (
            <li>
              <NavLink
                to={`/brukere`}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                <span className={styles.menyIkon}>
                  <PersonGroupIcon title="Brukere" fontSize="1.5rem" className={styles.menyIkon} />
                </span>
                <span className={styles.menyTekst}>Brukere</span>
              </NavLink>
            </li>
          )}

          {byggMeny(
            'Større kjøringer',
            batcherMeny,
            indexSupplier,
            <SackPensionIcon title="Større kjøringer" fontSize="1.5rem" className={styles.menyIkon} />,
          )}
          {byggMeny(
            'Behandlinger',
            behandlingerMeny,
            indexSupplier,
            <NumberListIcon title="Behandlinger" fontSize="1.5rem" className={styles.menyIkon} />,
          )}
          {byggMeny(
            'Omregning',
            omregningMeny,
            indexSupplier,
            <CurrencyExchangeIcon title="Omregning" fontSize="1.5rem" className={styles.menyIkon} />,
          )}
          {byggMeny(
            'Vedlikehold',
            administrasjonMeny,
            indexSupplier,
            <WrenchIcon title="Vedlikehold" fontSize="1.5rem" className={styles.menyIkon} />,
          )}
        </ul>
      </nav>
    </nav>
  )
}
