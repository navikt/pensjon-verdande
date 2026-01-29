import {
  CalendarIcon,
  ChevronDownIcon,
  CircleIcon,
  CurrencyExchangeIcon,
  HandShakeHeartIcon,
  HouseIcon,
  NumberListIcon,
  PersonGroupIcon,
  PersonRectangleIcon,
  ReceiptIcon,
  SackPensionIcon,
  WrenchIcon,
} from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'
import type { JSX } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import type { MeResponse } from '~/brukere/brukere'
import { BEHANDLING_STATUS_MAP } from '~/common/decode'
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
  ['OPPDATER_BARN_BRUK', '/vedlikehold-barn', 'Vedlikehold barn'],
]

const batcherMeny = [
  ['BATCH_KJORINGER', '/batcher', 'Alle batchkjøringer'],
  ['ADHOC_BREVBESTILLING', `/adhocbrev`, 'Adhoc brevbestilling'],
  ['ADHOC_BREVBESTILLING_FULLMAKTER', `/adhocbrev_fullmakter`, 'AdHoc brevbestillinger fullmakter'],
  [
    'ADHOC_BREVBESTILLING_FULLMAKTER',
    `/adhocbrev_fullmakter/bekreft-brevutsending`,
    'Bekreft AdHoc brevbestillinger fullmakter',
  ],
  ['AFP_ETTEROPPGJOR', '/afp-etteroppgjor', 'AFP Etteroppgjør'],
  ['ALDERSOVERGANG', '/aldersovergang', 'Aldersovergang'],
  ['AVSTEMMING_LES', '/avstemming', 'Avstemming'],
  ['AVSTEMMING_LES', '/konsistensavstemming', 'Konsistensavstemming'],
  ['BESTEM_ETTEROPPGJOER_RESULTAT', `/bestem-etteroppgjor-resultat`, 'Bestem etteroppgjør resultat'],
  ['FASTSETTE_INNTEKT_FOR_UFOERETRYGD', `/bpen091`, 'Fastsette inntekt for uføretrygd'],
  ['HENT_OPPLYSNINGER_FRA_SKATT', `/bpen096`, 'Hent opplysninger fra Skatt'],
  ['HVILENDE_RETT_UFORETRYGD', `/hvilenderett`, 'Hvilende rett av Uføretrygd'],
  ['INNTEKTSKONTROLL', `/batch/inntektskontroll`, 'Inntektskontroll'],
  ['KONTROLLERE_SAERSKILT_SATS', '/kontroll-saerskilt-sats', 'Kontroll særskilt sats'],
  ['LEVER_SAMBOEROPPLYSNING', '/lever-samboeropplysning', 'Lever Samboeropplysning'],
  ['LOEPENDE_INNTEKTSAVKORTING', `/bpen090`, 'Løpende inntektsavkorting'],
  ['OMREGNING_VED_OPPTJENINGSENDRING', `/opptjening/manedlig/omregning`, 'Månedlig omregning ved opptjeningsendring'],
  [
    'OMREGNING_VED_ARLIG_OPPTJENINGSENDRING_LES',
    `/opptjening/arlig/omregning`,
    'Årlig omregning ved opptjeningsendring',
  ],
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

  ...Object.entries(BEHANDLING_STATUS_MAP).map(([key, label]) => ['SE_BEHANDLINGER', `/behandlinger/${key}`, label]),
]

export function harTilgang(me: MeResponse | undefined, operasjon: string) {
  if (!me) {
    return false
  }
  return me.tilganger.find((it) => it === operasjon)
}

export function harRolle(me: MeResponse | undefined, rolle: string) {
  if (!me) {
    return false
  }
  return me.verdandeRoller.find((it) => it.toUpperCase() === rolle.toUpperCase())
}

export default function VenstreMeny(props: Props) {
  const me = props.me

  let currentIndex = 0

  function indexSupplier() {
    currentIndex += 1
    return currentIndex
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
    const harTilgangTilMeny = menyElementer.some(([operasjon]) => harTilgang(me, operasjon))
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
              .filter(([operasjon]) => harTilgang(me, operasjon))
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

          {harRolle(me, 'VERDANDE_ADMIN') && (
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
          {harRolle(me, 'VERDANDE_ADMIN') && (
            <li>
              <NavLink
                to={`/audit`}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                <span className={styles.menyIkon}>
                  <ReceiptIcon title="Revisjonslogg" fontSize="1.5rem" className={styles.menyIkon} />
                </span>
                <span className={styles.menyTekst}>Revisjonslogg</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink
                to={`/manuell-behandling`}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                <span className={styles.menyIkon}>
                  <PersonRectangleIcon title="Manuell behandling" fontSize="1.5rem" className={styles.menyIkon} />
                </span>
                <span className={styles.menyTekst}>Manuell behandling</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink
                to={`/alde`}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                <span className={styles.menyIkon}>
                  <HandShakeHeartIcon title="a11y-title" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Alde oppfølging</span>
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
