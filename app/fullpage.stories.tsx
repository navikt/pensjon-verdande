/**
 * Fullpage-stories som rendrer sidekomponenter inne i Layout (NavHeader + VenstreMeny).
 * Brukes for dokumentasjonsskjermbilder som viser hele applikasjonen med header og meny.
 */
import type { Meta, StoryObj } from '@storybook/react'
import type { KalenderHendelser } from '~/components/kalender/types'
import {
  mockBehandlingDto,
  mockBehandlingerPage,
  mockBehandlingKjoringDto,
  mockDashboardResponse,
} from '../.storybook/mocks/data'
import { renderWithLayout } from '../.storybook/mocks/router'
import Alderspensjonssoknader from './alderspensjon/forstegangsbehandling/soknader'
import Batcher from './batcher/batcher'
import Behandling from './behandling/behandling.$behandlingId'
import Behandlinger from './behandlinger/behandlinger._index'
import Behandlingserie from './behandlingserie/behandlingserie'
import { DEFAULT_SERIE_VALG } from './behandlingserie/serieValg'
import Brukere from './brukere/index'
import Dashboard from './dashboard/route'
import KalenderVisning from './kalender/route'
import ManuellBehandling from './manuell-behandling/index'
import Sok from './sok/sok'

const mockKalenderHendelser: KalenderHendelser = {
  offentligeFridager: [
    { dato: '2024-06-17', navn: '2. pinsedag' },
    { dato: '2024-06-23', navn: 'Sankthansaften' },
  ],
  kalenderBehandlinger: [
    { behandlingId: 100001, type: 'ForstegangsbehandlingAlder', kjoreDato: '2024-06-10T08:00:00' },
    { behandlingId: 100002, type: 'Omregning', kjoreDato: '2024-06-12T10:00:00' },
    { behandlingId: 100003, type: 'Regulering', kjoreDato: '2024-06-15T09:30:00' },
    { behandlingId: 100004, type: 'ForstegangsbehandlingAlder', kjoreDato: '2024-06-15T14:00:00' },
    { behandlingId: 100005, type: 'Omregning', kjoreDato: '2024-06-20T11:00:00' },
  ],
}

const meta: Meta = {
  title: 'Fullpage',
}

export default meta
type Story = StoryObj

export const DashboardFullpage: Story = {
  name: 'Dashboard',
  render: () =>
    renderWithLayout(Dashboard, {
      loadingDashboardResponse: mockDashboardResponse(),
      kalenderHendelser: mockKalenderHendelser,
      startDato: new Date('2024-06-15'),
    }),
}

export const KalenderFullpage: Story = {
  name: 'Kalender',
  render: () =>
    renderWithLayout(KalenderVisning, {
      kalenderHendelser: mockKalenderHendelser,
      startDato: new Date('2024-06-15'),
    }),
}

export const SokFullpage: Story = {
  name: 'Søk',
  render: () =>
    renderWithLayout(
      Sok,
      {
        behandlinger: mockBehandlingerPage([
          mockBehandlingDto({ behandlingId: 100001, fnr: '12345678901', type: 'ForstegangsbehandlingAlder' }),
          mockBehandlingDto({ behandlingId: 100002, fnr: '12345678901', type: 'Omregning', status: 'FULLFORT' }),
        ]),
      },
      { path: '/sok' },
    ),
}

export const BehandlingerFullpage: Story = {
  name: 'Behandlinger',
  render: () =>
    renderWithLayout(Behandlinger, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({ behandlingId: 100001, type: 'ForstegangsbehandlingAlder', status: 'UNDER_BEHANDLING' }),
        mockBehandlingDto({
          behandlingId: 100002,
          type: 'Omregning',
          status: 'FULLFORT',
          ferdig: '2024-06-15T12:00:00',
        }),
        mockBehandlingDto({
          behandlingId: 100003,
          type: 'Regulering',
          status: 'STOPPET',
          stoppet: '2024-06-14T08:00:00',
        }),
      ]),
    }),
}

export const BehandlingFullpage: Story = {
  name: 'Behandling',
  render: () =>
    renderWithLayout(
      Behandling,
      {
        aldeBehandlingUrlTemplate: undefined,
        detaljertFremdrift: undefined,
        psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
        behandling: mockBehandlingDto({
          behandlingId: 100001,
          type: 'ForstegangsbehandlingAlder',
          status: 'UNDER_BEHANDLING',
          fnr: '12345678901',
          sakId: 50001,
          kravId: 60001,
          ansvarligTeam: 'Team Pensjon',
        }),
      },
      { path: '/behandling/100001' },
    ),
}

export const BehandlingFullfortFullpage: Story = {
  name: 'Behandling – Fullført',
  render: () =>
    renderWithLayout(
      Behandling,
      {
        aldeBehandlingUrlTemplate: undefined,
        detaljertFremdrift: undefined,
        psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
        behandling: mockBehandlingDto({
          behandlingId: 106800123,
          type: 'FleksibelApSakBehandling',
          status: 'FULLFORT',
          opprettet: '2026-03-01T16:21:09',
          sisteKjoring: '2026-03-01T16:21:35',
          ferdig: '2026-03-01T16:21:35',
          opprettetAv: 'pensjon-selvbetjenin',
          fnr: '12345678901',
          sakId: 26140001,
          kravId: 54180001,
          ansvarligTeam: 'Alder',
          parametere: {
            behandlingType: 'MAN',
            onsketVirkningsdato: '2026-07-01',
          },
          behandlingKjoringer: [
            mockBehandlingKjoringDto({
              behandlingKjoringId: 1,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA411VurderKontrollpunkterAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 2,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA402VurderUforeGjenlevenderettAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 3,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA401VurderUtlandsOppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 4,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA400VurderInstitusjonsoppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 5,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA301VurderOgLagreVurdertSivilstandAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 6,
              startet: '2026-03-01T16:21:35',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA201SettBrukPaRettPersongrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 7,
              startet: '2026-03-01T16:21:10',
              avsluttet: '2026-03-01T16:21:35',
              aktivitetType: 'FleksibelApSakA103OpprettLivsvarigAfpOffentligGrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 8,
              startet: '2026-03-01T16:21:09',
              avsluttet: '2026-03-01T16:21:10',
              aktivitetType: 'FleksibelApSakA102KontrollerInformasjonsgrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 9,
              startet: '2026-03-01T16:21:09',
              avsluttet: '2026-03-01T16:21:09',
              aktivitetType: 'FleksibelApSakA101SettBehandlingstypeAutoAktivitet',
            }),
          ],
        }),
      },
      { path: '/behandling/106800123' },
    ),
}

export const BehandlingUnderBehandlingFullpage: Story = {
  name: 'Behandling – Under behandling',
  render: () =>
    renderWithLayout(
      Behandling,
      {
        aldeBehandlingUrlTemplate: 'https://pensjon-alde.intern.nav.no/behandling/{behandlingId}',
        detaljertFremdrift: undefined,
        psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
        behandling: mockBehandlingDto({
          behandlingId: 106260001,
          type: 'FleksibelApSakBehandling',
          status: 'UNDER_BEHANDLING',
          opprettet: '2026-03-01T16:16:41',
          sisteKjoring: '2026-03-01T16:16:43',
          opprettetAv: 'pensjon-selvbetjenin',
          utsattTil: '2026-03-15T16:16:43',
          fnr: '98765432100',
          sakId: 26140002,
          kravId: 54170001,
          ansvarligTeam: 'Alder',
          parametere: {
            behandlingType: 'DEL_AUTO',
            onsketVirkningsdato: '2026-07-01',
            nesteAktivitet: 'FleksibelApSakA412VentPaaKompletteringAvGrunnlagAktivitet',
          },
          erAldeBehandling: true,
          _links: {
            fortsett: { href: '#', type: 'POST' },
            fortsettAvhengigeBehandlinger: { href: '#', type: 'POST' },
            avhengigeBehandlinger: { href: '#', type: 'GET' },
            sendTilManuellMedKontrollpunkt: { href: '#', type: 'POST' },
          },
          muligeKontrollpunkt: [{ kontrollpunkt: 'UTLAND', decode: 'Utenlandsopphold' }],
          behandlingKjoringer: [
            mockBehandlingKjoringDto({
              behandlingKjoringId: 1,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA412VentPaaKompletteringAvGrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 2,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA411VurderKontrollpunkterAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 3,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA411VurderKontrollpunkterAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 4,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA402VurderUforeGjenlevenderettAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 5,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA401VurderUtlandsOppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 6,
              startet: '2026-03-01T16:16:43',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA400VurderInstitusjonsoppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 7,
              startet: '2026-03-01T16:16:42',
              avsluttet: '2026-03-01T16:16:43',
              aktivitetType: 'FleksibelApSakA301VurderOgLagreVurdertSivilstandAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 8,
              startet: '2026-03-01T16:16:42',
              avsluttet: '2026-03-01T16:16:42',
              aktivitetType: 'FleksibelApSakA201SettBrukPaRettPersongrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 9,
              startet: '2026-03-01T16:16:42',
              avsluttet: '2026-03-01T16:16:42',
              aktivitetType: 'FleksibelApSakA103OpprettLivsvarigAfpOffentligGrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 10,
              startet: '2026-03-01T16:16:42',
              avsluttet: '2026-03-01T16:16:42',
              aktivitetType: 'FleksibelApSakA102KontrollerInformasjonsgrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 11,
              startet: '2026-03-01T16:16:42',
              avsluttet: '2026-03-01T16:16:42',
              aktivitetType: 'FleksibelApSakA101SettBehandlingstypeAutoAktivitet',
            }),
          ],
        }),
      },
      { path: '/behandling/106260001' },
    ),
}

export const BehandlingMedAlleKnapperFullpage: Story = {
  name: 'Behandling – Alle handlinger',
  render: () =>
    renderWithLayout(
      Behandling,
      {
        aldeBehandlingUrlTemplate: 'https://pensjon-alde.intern.dev.nav.no/behandling/{behandlingId}',
        detaljertFremdrift: undefined,
        psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
        behandling: mockBehandlingDto({
          behandlingId: 34240001,
          type: 'FleksibelApSakBehandling',
          status: 'UNDER_BEHANDLING',
          opprettet: '2026-02-25T09:17:32',
          sisteKjoring: '2026-02-25T09:17:38',
          opprettetAv: 'pensjon-testdata-ser',
          utsattTil: '2026-02-25T09:17:33',
          fnr: '11223344556',
          sakId: 26390001,
          kravId: 49600001,
          ansvarligTeam: 'Alder',
          parametere: {
            behandlingType: 'AUTO',
            onsketVirkningsdato: '2026-03-01',
            nesteAktivitet: 'FleksibelApSakA406VurderSamboerAktivitet',
          },
          erAldeBehandling: true,
          muligeKontrollpunkt: [
            { kontrollpunkt: 'SAMBOER', decode: 'Samboerskap' },
            { kontrollpunkt: 'UTLAND', decode: 'Utenlandsopphold' },
          ],
          _links: {
            fortsett: { href: '#', type: 'POST' },
            fortsettAvhengigeBehandlinger: { href: '#', type: 'POST' },
            avhengigeBehandlinger: { href: '#', type: 'GET' },
            taTilDebug: { href: '#', type: 'POST' },
            stopp: { href: '#', type: 'POST' },
            sendTilManuellMedKontrollpunkt: { href: '#', type: 'POST' },
          },
          behandlingKjoringer: [
            mockBehandlingKjoringDto({
              behandlingKjoringId: 1,
              startet: '2026-02-25T09:17:38',
              avsluttet: '2026-02-25T09:17:38',
              aktivitetType: 'FleksibelApSakA406VurderSamboerAktivitet',
              aldeStartState: 'PROSSESER_GRUNNLAG',
              aldeEndState: 'MANUELL_BEHANDLING',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 2,
              startet: '2026-02-25T09:17:37',
              avsluttet: '2026-02-25T09:17:37',
              aktivitetType: 'FleksibelApSakA406VurderSamboerAktivitet',
              aldeStartState: 'HENT_GRUNNLAG',
              aldeEndState: 'PROSSESER_GRUNNLAG',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 3,
              startet: '2026-02-25T09:17:37',
              avsluttet: '2026-02-25T09:17:37',
              aktivitetType: 'FleksibelApSakA406VurderSamboerAktivitet',
              aldeStartState: null,
              aldeEndState: 'HENT_GRUNNLAG',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 4,
              startet: '2026-02-25T09:17:37',
              avsluttet: '2026-02-25T09:17:37',
              aktivitetType: 'FleksibelApSakA411VurderKontrollpunkterAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 5,
              startet: '2026-02-25T09:17:37',
              avsluttet: '2026-02-25T09:17:37',
              aktivitetType: 'FleksibelApSakA402VurderUforeGjenlevenderettAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 6,
              startet: '2026-02-25T09:17:36',
              avsluttet: '2026-02-25T09:17:36',
              aktivitetType: 'FleksibelApSakA401VurderUtlandsOppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 7,
              startet: '2026-02-25T09:17:36',
              avsluttet: '2026-02-25T09:17:36',
              aktivitetType: 'FleksibelApSakA400VurderInstitusjonsoppholdAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 8,
              startet: '2026-02-25T09:17:36',
              avsluttet: '2026-02-25T09:17:36',
              aktivitetType: 'FleksibelApSakA301VurderOgLagreVurdertSivilstandAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 9,
              startet: '2026-02-25T09:17:36',
              avsluttet: '2026-02-25T09:17:36',
              aktivitetType: 'FleksibelApSakA201SettBrukPaRettPersongrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 10,
              startet: '2026-02-25T09:17:33',
              avsluttet: '2026-02-25T09:17:36',
              aktivitetType: 'FleksibelApSakA103OpprettLivsvarigAfpOffentligGrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 11,
              startet: '2026-02-25T09:17:33',
              avsluttet: '2026-02-25T09:17:33',
              aktivitetType: 'FleksibelApSakA102KontrollerInformasjonsgrunnlagAktivitet',
            }),
            mockBehandlingKjoringDto({
              behandlingKjoringId: 12,
              startet: '2026-02-25T09:17:33',
              avsluttet: '2026-02-25T09:17:33',
              aktivitetType: 'FleksibelApSakA101SettBehandlingstypeAutoAktivitet',
            }),
          ],
        }),
      },
      { path: '/behandling/34240001', env: 'q2' },
    ),
}

export const BatcherFullpage: Story = {
  name: 'Batcher',
  render: () =>
    renderWithLayout(Batcher, {
      behandlinger: mockBehandlingerPage([
        mockBehandlingDto({
          behandlingId: 200001,
          type: 'Regulering',
          status: 'UNDER_BEHANDLING',
          opprettetAv: 'BATCH',
        }),
        mockBehandlingDto({
          behandlingId: 200002,
          type: 'Omregning',
          status: 'FULLFORT',
          opprettetAv: 'BATCH',
          ferdig: '2024-06-15T14:00:00',
        }),
      ]),
    }),
}

export const ManuellBehandlingFullpage: Story = {
  name: 'Manuell behandling',
  render: () =>
    renderWithLayout(ManuellBehandling, {
      rows: [
        {
          behandlingType: 'OmregningBehandling',
          kategori: 'KAT_01',
          kategoriDecode: 'Omregning',
          fagomrade: 'PEN',
          oppgaveKode: 'OPP_001',
          underkategoriKode: null,
          prioritetKode: 'HOY',
          antall: 42,
        },
        {
          behandlingType: 'ReguleringBehandling',
          kategori: 'KAT_02',
          kategoriDecode: 'Regulering',
          fagomrade: 'UFO',
          oppgaveKode: 'OPP_002',
          underkategoriKode: 'UNDER_01',
          prioritetKode: 'LAV',
          antall: 15,
        },
      ],
      nowIso: new Date().toISOString(),
      fomDato: '2024-05-01',
      tomDato: '2024-06-01',
    }),
}

export const BrukereFullpage: Story = {
  name: 'Brukere',
  render: () =>
    renderWithLayout(Brukere, {
      brukere: [
        {
          brukernavn: 'P123456',
          fornavn: 'Kari',
          etternavn: 'Nordmann',
          tilganger: ['LESE', 'SKRIVE'],
          tilgangsHistorikk: [],
        },
        { brukernavn: 'P654321', fornavn: 'Ola', etternavn: 'Hansen', tilganger: ['LESE'], tilgangsHistorikk: [] },
        {
          brukernavn: 'P111222',
          fornavn: 'Per',
          etternavn: 'Olsen',
          tilganger: ['LESE', 'SKRIVE', 'ADMIN'],
          tilgangsHistorikk: [],
        },
      ],
    }),
}

export const BehandlingserieFullpage: Story = {
  name: 'Behandlingserie',
  render: () =>
    renderWithLayout(Behandlingserie, {
      behandlingSerier: [
        {
          behandlingSerieId: '1',
          behandlingCode: 'DagligAvstemming',
          regelmessighet: 'range',
          opprettetAv: 'VERDANDE',
          opprettet: '2024-06-01T08:00:00',
          startDato: '2024-06-01',
          sluttDato: '2024-12-31',
          behandlinger: [
            {
              behandlingId: 5001,
              status: 'OPPRETTET',
              behandlingSerieId: '1',
              behandlingCode: 'DagligAvstemming',
              planlagtStartet: '2024-07-01T10:00:00',
            },
          ],
        },
      ],
      serieValg: DEFAULT_SERIE_VALG,
      tillateBehandlinger: ['DagligAvstemming'],
    }),
}

export const AlderspensjonssoknaderFullpage: Story = {
  name: 'Alderspensjonssøknader',
  render: () =>
    renderWithLayout(
      Alderspensjonssoknader,
      {
        aldeBehandlingUrlTemplate: undefined,
        nowIso: '2026-03-01T16:30:00.000Z',
        page: {
          content: [
            {
              behandlingId: 106800123,
              uuid: '025e4fc7-05b1-45fe-a123-1777e1e6c98b',
              sisteKjoring: '2026-03-01T16:21:35',
              utsattTil: null,
              opprettet: '2026-03-01T16:21:09',
              stoppet: null,
              ferdig: '2026-03-01T16:21:35',
              status: 'FULLFORT' as const,
              aldeStatus: null,
              nesteAktiviteter: [],
              kontrollpunkter: [{ type: 'YTELSE_PEN', status: 'FULLFORT' }],
              feilmelding: null,
              stackTrace: null,
              sakId: 26140001,
              kravId: 54180001,
              enhetId: '4817',
              enhetsNavn: 'Nav familie- og pensjonsytelser Steinkjer',
              behandlingstype: 'MAN' as const,
              onsketVirkningsdato: '2026-07-01',
              erAldeBehandling: false,
              erMuligAldeBehandling: false,
              isVurderSamboerUnderBehandling: false,
            },
            {
              behandlingId: 106260001,
              uuid: '9c3f5634-f1f4-474c-bc46-cecb3883a1a9',
              sisteKjoring: '2026-03-01T16:16:43',
              utsattTil: '2026-03-15T16:16:43',
              opprettet: '2026-03-01T16:16:41',
              stoppet: null,
              ferdig: null,
              status: 'UNDER_BEHANDLING' as const,
              aldeStatus: 'VENTER_MASKINELL' as const,
              nesteAktiviteter: ['FleksibelApSakA412VentPaaKompletteringAvGrunnlagAktivitet'],
              kontrollpunkter: [{ type: 'UTLAND', status: 'AKTIV' }],
              feilmelding: null,
              stackTrace: null,
              sakId: 26140002,
              kravId: 54170001,
              enhetId: '4808',
              enhetsNavn: 'Nav familie- og pensjonsytelser Porsgrunn',
              behandlingstype: 'DEL_AUTO' as const,
              onsketVirkningsdato: '2026-07-01',
              erAldeBehandling: false,
              erMuligAldeBehandling: false,
              isVurderSamboerUnderBehandling: false,
            },
            {
              behandlingId: 106260002,
              uuid: 'f1a2b3c4-d5e6-7890-abcd-123456789abc',
              sisteKjoring: '2026-03-01T15:45:12',
              utsattTil: null,
              opprettet: '2026-03-01T15:44:58',
              stoppet: null,
              ferdig: '2026-03-01T15:45:12',
              status: 'FULLFORT' as const,
              aldeStatus: null,
              nesteAktiviteter: [],
              kontrollpunkter: [],
              feilmelding: null,
              stackTrace: null,
              sakId: 26140003,
              kravId: 54170002,
              enhetId: null,
              enhetsNavn: null,
              behandlingstype: 'AUTO' as const,
              onsketVirkningsdato: '2026-07-01',
              erAldeBehandling: false,
              erMuligAldeBehandling: false,
              isVurderSamboerUnderBehandling: false,
            },
            {
              behandlingId: 106250001,
              uuid: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
              sisteKjoring: '2026-03-01T14:20:00',
              utsattTil: null,
              opprettet: '2026-03-01T14:19:30',
              stoppet: null,
              ferdig: null,
              status: 'FEILENDE' as const,
              aldeStatus: null,
              nesteAktiviteter: ['FleksibelApSakA500VilkarsprovAlderspensjonAktivitet'],
              kontrollpunkter: [],
              feilmelding: 'no.nav.pensjon.pen_app.exception.BeregningException: Kan ikke beregne ytelse',
              stackTrace: null,
              sakId: 26140004,
              kravId: 54170003,
              enhetId: null,
              enhetsNavn: null,
              behandlingstype: 'AUTO' as const,
              onsketVirkningsdato: '2026-08-01',
              erAldeBehandling: false,
              erMuligAldeBehandling: false,
              isVurderSamboerUnderBehandling: false,
            },
          ],
          totalPages: 42,
          totalElements: 834,
          first: true,
          last: false,
          size: 20,
          number: 0,
          numberOfElements: 4,
          pageable: { pageNumber: 0, pageSize: 20 },
        },
        pageIndex: 0,
        pageSize: 20,
        psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
        kildeOppsummering: [
          {
            kilde: 'SOKNAD',
            innsenderType: 'EN_PERSON',
            antall: 4671,
            behandlingTyper: { auto: 3200, manuell: 800, delAuto: 450, ikkeFullort: 221 },
          },
          {
            kilde: 'ALDERSOVERGANG',
            innsenderType: 'DOLLY',
            antall: 1236,
            behandlingTyper: { auto: 1100, manuell: 80, delAuto: 40, ikkeFullort: 16 },
          },
          {
            kilde: 'PSAK',
            innsenderType: 'SAKSBEHANDLER',
            antall: 837,
            behandlingTyper: { auto: 100, manuell: 680, delAuto: 30, ikkeFullort: 27 },
          },
          {
            kilde: 'EESSI_PENSJON',
            innsenderType: 'DOLLY',
            antall: 205,
            behandlingTyper: { auto: 50, manuell: 140, delAuto: 10, ikkeFullort: 5 },
          },
          {
            kilde: 'SOKNAD',
            innsenderType: 'SAKSBEHANDLER',
            antall: 25,
            behandlingTyper: { auto: 5, manuell: 18, delAuto: 2, ikkeFullort: 0 },
          },
        ],
        fomDato: '2026-01-30',
        tomDato: '2026-03-01',
      },
      { path: '/alderspensjon/forstegangsbehandling/soknader' },
    ),
}
