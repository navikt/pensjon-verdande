import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingSokPage from './behandling-sok'
import type { BehandlingMetadata } from './metadata-cache.server'

const metadata: BehandlingMetadata = {
  schemaVersion: '1',
  metadataVersion: 'm-1',
  generatedAt: '2025-04-01T00:00:00Z',
  behandlingType: 'AlderspensjonForstegangsbehandling',
  supportedAktivitetTyper: ['SjekkUtland', 'SjekkSamboer', 'IverksettVedtak'],
  observedAktivitetTyper: ['SjekkUtland', 'SjekkSamboer', 'IverksettVedtak'],
  behandlingStatuser: ['REGISTRERT', 'IVERKSATT', 'STOPPET'],
  ansvarligeTeam: ['TEAM_ALDER', 'TEAM_UFORE'],
  kravStatuser: ['INNSENDT', 'UNDER_BEHANDLING', 'INNVILGET'],
  kontrollpunktTyper: [{ kode: 'KP_BEHANDLE_UTLAND', dekodeTekst: 'Behandle utland' }],
  kravGjelderKoder: ['AP', 'UT'],
  sakstyper: ['ALDER', 'UFORE'],
  eierenheter: ['4849', '4862'],
}

const meta: Meta<typeof BehandlingSokPage> = {
  title: 'Pages/BehandlingSok',
  component: BehandlingSokPage,
}
export default meta

type Story = StoryObj<typeof BehandlingSokPage>

export const Default: Story = {
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling', 'UforetrygdBehandling'],
      metadata: null,
      committed: {
        behandlingType: null,
        ikkeSensitiveKriterier: [],
        visning: 'treff',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      ukjenteKriterier: [],
      harSensitiveISok: false,
      initialResultat: null,
      feilmelding: null,
    }),
}

export const MedTreff: Story = {
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling'],
      metadata,
      committed: {
        behandlingType: 'AlderspensjonForstegangsbehandling',
        ikkeSensitiveKriterier: [
          { type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-03-31' },
          { type: 'HAR_STATUS', statuser: ['STOPPET'] },
        ],
        visning: 'treff',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      ukjenteKriterier: [],
      harSensitiveISok: false,
      initialResultat: {
        kind: 'treff',
        data: {
          treff: [
            {
              behandlingId: 12345,
              behandlingType: 'AlderspensjonForstegangsbehandling',
              status: 'STOPPET',
              ansvarligTeam: 'TEAM_ALDER',
              opprettet: '2025-02-15T10:00:00',
              prioritet: 50,
            },
            {
              behandlingId: 12346,
              behandlingType: 'AlderspensjonForstegangsbehandling',
              status: 'STOPPET',
              ansvarligTeam: 'TEAM_ALDER',
              opprettet: '2025-02-16T11:00:00',
              prioritet: 40,
            },
          ],
          nesteCursor: { opprettet: '2025-02-16T11:00:00', behandlingId: 12346 },
        },
      },
      feilmelding: null,
    }),
}

export const AntallOverTid: Story = {
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling'],
      metadata,
      committed: {
        behandlingType: 'AlderspensjonForstegangsbehandling',
        ikkeSensitiveKriterier: [{ type: 'OPPRETTET_I_PERIODE', fom: '2024-01-01', tom: '2024-12-31' }],
        visning: 'antall-over-tid',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      ukjenteKriterier: [],
      harSensitiveISok: false,
      initialResultat: {
        kind: 'antall',
        data: {
          totalAntall: 1234,
          buckets: Array.from({ length: 12 }, (_, i) => ({
            periodeStart: `2024-${String(i + 1).padStart(2, '0')}-01`,
            antall: 80 + Math.floor(Math.random() * 30),
          })),
        },
      },
      feilmelding: null,
    }),
}

export const TomtResultat: Story = {
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling'],
      metadata,
      committed: {
        behandlingType: 'AlderspensjonForstegangsbehandling',
        ikkeSensitiveKriterier: [{ type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-03-31' }],
        visning: 'treff',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      ukjenteKriterier: [],
      harSensitiveISok: false,
      initialResultat: { kind: 'treff', data: { treff: [], nesteCursor: null } },
      feilmelding: null,
    }),
}

export const UkjentKriterieIUrl: Story = {
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling'],
      metadata,
      committed: {
        behandlingType: 'AlderspensjonForstegangsbehandling',
        ikkeSensitiveKriterier: [],
        visning: 'treff',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      harSensitiveISok: false,
      ukjenteKriterier: [{ type: 'NYTT_FREMTIDIG_KRITERIUM', raw: {} }],
      initialResultat: null,
      feilmelding: null,
    }),
}

export const BackendFeil: Story = {
  tags: ['error-expected'],
  render: () =>
    renderWithLoader(BehandlingSokPage, {
      typer: ['AlderspensjonForstegangsbehandling'],
      metadata,
      committed: {
        behandlingType: 'AlderspensjonForstegangsbehandling',
        ikkeSensitiveKriterier: [{ type: 'OPPRETTET_I_PERIODE', fom: '2025-01-01', tom: '2025-03-31' }],
        visning: 'treff',
        aggregering: 'MAANED',
        tidsdimensjon: 'OPPRETTET',
      },
      ukjenteKriterier: [],
      harSensitiveISok: false,
      initialResultat: null,
      feilmelding: 'Søket overskred backend-grenser (max 100 verdier i IN-liste).',
    }),
}
