/**
 * Fullpage-stories som rendrer sidekomponenter inne i Layout (NavHeader + VenstreMeny).
 * Brukes for dokumentasjonsskjermbilder som viser hele applikasjonen med header og meny.
 */
import type { Meta, StoryObj } from '@storybook/react'
import type { KalenderHendelser } from '~/components/kalender/types'
import { mockBehandlingDto, mockBehandlingerPage, mockDashboardResponse } from '../.storybook/mocks/data'
import { renderWithLayout } from '../.storybook/mocks/router'
import Dashboard from './dashboard/route'
import KalenderVisning from './kalender/route'
import Sok from './sok/sok'
import Behandlinger from './behandlinger/behandlinger._index'
import Batcher from './batcher/batcher'
import Brukere from './brukere/index'
import ManuellBehandling from './manuell-behandling/index'
import Behandlingserie from './behandlingserie/behandlingserie'
import Behandling from './behandling/behandling.$behandlingId'
import { DEFAULT_SERIE_VALG } from './behandlingserie/serieValg'

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
        { brukernavn: 'P123456', fornavn: 'Kari', etternavn: 'Nordmann', tilganger: ['LESE', 'SKRIVE'], tilgangsHistorikk: [] },
        { brukernavn: 'P654321', fornavn: 'Ola', etternavn: 'Hansen', tilganger: ['LESE'], tilgangsHistorikk: [] },
        { brukernavn: 'P111222', fornavn: 'Per', etternavn: 'Olsen', tilganger: ['LESE', 'SKRIVE', 'ADMIN'], tilgangsHistorikk: [] },
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
