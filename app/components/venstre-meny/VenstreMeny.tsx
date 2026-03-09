import {
  BarChartIcon,
  CalendarIcon,
  ChevronDownIcon,
  CircleIcon,
  CurrencyExchangeIcon,
  EnvelopeClosedIcon,
  GavelIcon,
  HandShakeHeartIcon,
  HouseIcon,
  NumberListIcon,
  PersonGroupIcon,
  PersonRectangleIcon,
  ReceiptIcon,
  SackPensionIcon,
  WrenchIcon,
} from '@navikt/aksel-icons'
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
  ['FEIL_REGISTRER_KRAV', '/feil-registrer-krav', 'Feilregistrer krav'],
]

const batcherMeny = [
  ['BATCH_KJORINGER', '/batcher', 'Alle batchkjøringer'],
  ['ADHOC_BREVBESTILLING', `/adhocbrev`, 'Adhoc brevbestilling'],
  ['AFP_ETTEROPPGJOR', '/afp-etteroppgjor', 'AFP Etteroppgjør'],
  ['ALDERSOVERGANG', '/aldersovergang', 'Aldersovergang'],
  ['AVSTEMMING_LES', '/avstemming', 'Avstemming'],
  ['AVSTEMMING_LES', '/konsistensavstemming', 'Konsistensavstemming'],
  ['BESTEM_ETTEROPPGJOER_RESULTAT', `/bestem-etteroppgjor-resultat`, 'Bestem etteroppgjør resultat'],
  ['FASTSETTE_INNTEKT_FOR_UFOERETRYGD', `/bpen091`, 'Fastsette inntekt for uføretrygd'],
  ['HENT_OPPLYSNINGER_FRA_SKATT', `/bpen096`, 'Hent opplysninger fra Skatt'],
  ['HVILENDE_RETT_UFORETRYGD', `/hvilenderett`, 'Hvilende rett av Uføretrygd'],
  ['LEVEATTEST_KONTROLL', `/leveattest-kontroll`, 'Leveattest kontroll'],
  ['LEVER_SAMBOEROPPLYSNING', '/lever-samboeropplysning', 'Lever Samboeropplysning'],
  ['LOEPENDE_INNTEKTSAVKORTING', `/bpen090`, 'Løpende inntektsavkorting'],
  ['OMREGNING_VED_OPPTJENINGSENDRING', `/opptjening/manedlig/omregning`, 'Månedlig omregning ved opptjeningsendring'],
  [
    'OMREGNING_VED_ARLIG_OPPTJENINGSENDRING_LES',
    `/opptjening/arlig/omregning`,
    'Årlig omregning ved opptjeningsendring',
  ],
  ['REGULERING_LES', `/batch/regulering`, 'Regulering'],
  ['REGELENDRING2026_VARSEL', `/varsel-regelendring2026`, 'Varsel regelendring Uføretrygd 2026'],
]

const kontrollMeny = [
  ['INNTEKTSKONTROLL', '/batch/inntektskontroll', 'Inntektskontroll'],
  ['KONTROLLERE_SAERSKILT_SATS', '/kontroll-saerskilt-sats', 'Kontroll særskilt sats'],
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

  function nextIndex() {
    currentIndex += 1
    return currentIndex
  }

  function createMenuItem(operasjon: string, link: string, label: string) {
    return (
      <li key={operasjon + link + label}>
        <NavLink to={link} end className={({ isActive }) => (isActive ? styles.active : '')}>
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

  function byggMeny(navn: string, menyElementer: string[][], nextIdx: () => number, icon?: JSX.Element) {
    const harTilgangTilMeny = menyElementer.some(([operasjon]) => harTilgang(me, operasjon))
    if (!harTilgangTilMeny) return undefined

    const idx = nextIdx()
    const isOpen = openIndex === idx

    return (
      <li key={`meny-${navn}`} className={isOpen ? styles.open : ''}>
        <button type="button" onClick={() => handleMenuClick(idx)} aria-expanded={isOpen}>
          <span className={styles.menyIkon}>{icon}</span>
          <span className={styles.menyTekst}>{navn}</span>
          <ChevronDownIcon
            aria-hidden
            fontSize="1.5rem"
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>
        <ul className={styles.submenu}>
          {menyElementer
            .filter(([operasjon]) => harTilgang(me, operasjon))
            .map(([operasjon, link, label]) => createMenuItem(operasjon, link, label))}
        </ul>
      </li>
    )
  }

  const columnClass = `${styles.sidebarColumn} ${props.showIconMenu ? styles.kunIkonerColumn : ''}`

  return (
    <div className={`aksel-theme dark ${columnClass}`}>
      <nav id={styles.venstreMeny} className={props.showIconMenu ? styles.kunIkoner : ''}>
        <ul className={styles.mainmenu}>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>
              <span className={styles.menyIkon}>
                <HouseIcon title="Hjem" fontSize="1.5rem" />
              </span>
              <span className={styles.menyTekst}>Hjem</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/kalender" className={({ isActive }) => (isActive ? styles.active : '')}>
              <span className={styles.menyIkon}>
                <CalendarIcon title="Kalender" fontSize="1.5rem" />
              </span>
              <span className={styles.menyTekst}>Kalender</span>
            </NavLink>
          </li>

          {harRolle(me, 'VERDANDE_ADMIN') && (
            <li>
              <NavLink to="/brukere" className={({ isActive }) => (isActive ? styles.active : '')}>
                <span className={styles.menyIkon}>
                  <PersonGroupIcon title="Brukere" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Brukere</span>
              </NavLink>
            </li>
          )}
          {harRolle(me, 'VERDANDE_ADMIN') && (
            <li>
              <NavLink to="/audit" className={({ isActive }) => (isActive ? styles.active : '')}>
                <span className={styles.menyIkon}>
                  <ReceiptIcon title="Revisjonslogg" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Revisjonslogg</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink to="/manuell-behandling" className={({ isActive }) => (isActive ? styles.active : '')}>
                <span className={styles.menyIkon}>
                  <PersonRectangleIcon title="Manuell behandling" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Manuell behandling</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink
                to={`/brev-bestilling`}
                style={{ display: 'flex', justifyContent: 'flex-start' }}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                <span className={styles.menyIkon}>
                  <EnvelopeClosedIcon title="Brev-bestilling" fontSize="1.5rem" className={styles.menyIkon} />
                </span>
                <span className={styles.menyTekst}>Brev-bestilling</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink to="/alde" className={({ isActive }) => (isActive ? styles.active : '')}>
                <span className={styles.menyIkon}>
                  <HandShakeHeartIcon title="Alde oppfølging" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Alde oppfølging</span>
              </NavLink>
            </li>
          )}

          {harTilgang(me, 'SE_BEHANDLINGER') && (
            <li>
              <NavLink to="/analyse" className={({ isActive }) => (isActive ? styles.active : '')}>
                <span className={styles.menyIkon}>
                  <BarChartIcon title="Analyse" fontSize="1.5rem" />
                </span>
                <span className={styles.menyTekst}>Analyse</span>
              </NavLink>
            </li>
          )}

          {byggMeny(
            'Større kjøringer',
            batcherMeny,
            nextIndex,
            <SackPensionIcon title="Større kjøringer" fontSize="1.5rem" />,
          )}
          {byggMeny('Kontroll', kontrollMeny, nextIndex, <GavelIcon title="Kontroll" fontSize="1.5rem" />)}
          {byggMeny(
            'Behandlinger',
            behandlingerMeny,
            nextIndex,
            <NumberListIcon title="Behandlinger" fontSize="1.5rem" />,
          )}
          {byggMeny(
            'Omregning',
            omregningMeny,
            nextIndex,
            <CurrencyExchangeIcon title="Omregning" fontSize="1.5rem" />,
          )}
          {byggMeny('Vedlikehold', administrasjonMeny, nextIndex, <WrenchIcon title="Vedlikehold" fontSize="1.5rem" />)}
        </ul>
      </nav>
    </div>
  )
}
