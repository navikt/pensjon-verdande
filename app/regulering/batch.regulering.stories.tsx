import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OpprettReguleringBatchRoute from './batch.regulering'

const mockData = {
  regulering: {
    steg: 1,
    uttrekk: null,
    orkestreringer: [],
    avviksgrenser: [],
  },
}

const meta: Meta = {
  title: 'Sider/Regulering',
  component: OpprettReguleringBatchRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(OpprettReguleringBatchRoute, mockData, '/batch/regulering/uttrekk'),
}

export const MedFullfortUttrekk: Story = {
  render: () =>
    renderWithLoader(
      OpprettReguleringBatchRoute,
      {
        regulering: {
          ...mockData.regulering,
          uttrekk: {
            behandlingId: 'beh-100',
            status: 'FULLFORT',
            feilmelding: null,
            steg: '',
            progresjon: 100,
            satsDato: '2024-05-01',
            uttrekkDato: '2024-06-01T10:30:00',
            arbeidstabellSize: 450000,
            familierTabellSize: 380000,
            antallUbehandlede: 0,
            antallEkskluderteSaker: 120,
            kjoretidAktiviteter: [
              { aktivitet: 'HentGrunnlag', sekunder: 30, minutter: 2 },
              { aktivitet: 'BeregnYtelse', sekunder: 15, minutter: 5 },
            ],
          },
        },
      },
      '/batch/regulering/uttrekk',
    ),
}

export const MedStoppetUttrekk: Story = {
  render: () =>
    renderWithLoader(
      OpprettReguleringBatchRoute,
      {
        regulering: {
          ...mockData.regulering,
          uttrekk: {
            behandlingId: 'beh-101',
            status: 'STOPPET',
            feilmelding: 'Timeout ved henting av grunnlag for sak 12345678',
            steg: 'HentGrunnlag',
            progresjon: 35,
            satsDato: '2024-05-01',
            uttrekkDato: '2024-06-01T10:30:00',
            arbeidstabellSize: 150000,
            familierTabellSize: 120000,
            antallUbehandlede: 300000,
            antallEkskluderteSaker: 50,
            kjoretidAktiviteter: [],
          },
        },
      },
      '/batch/regulering/uttrekk',
    ),
}

export const MedOrkestreringer: Story = {
  render: () =>
    renderWithLoader(
      OpprettReguleringBatchRoute,
      {
        regulering: {
          ...mockData.regulering,
          uttrekk: {
            behandlingId: 'beh-100',
            status: 'FULLFORT',
            feilmelding: null,
            steg: '',
            progresjon: 100,
            satsDato: '2024-05-01',
            uttrekkDato: '2024-06-01T10:30:00',
            arbeidstabellSize: 450000,
            familierTabellSize: 380000,
            antallUbehandlede: 0,
            antallEkskluderteSaker: 120,
            kjoretidAktiviteter: [],
          },
          orkestreringer: [
            {
              behandlingId: 'ork-1',
              status: 'FULLFORT',
              kjoringsdato: '2024-06-02T08:00:00',
              opprettAntallFamilier: -1,
            },
            {
              behandlingId: 'ork-2',
              status: 'UNDER_BEHANDLING',
              kjoringsdato: '2024-06-03T08:00:00',
              opprettAntallFamilier: 1000,
            },
            {
              behandlingId: 'ork-3',
              status: 'STOPPET',
              kjoringsdato: '2024-06-03T10:00:00',
              opprettAntallFamilier: 500,
            },
          ],
        },
      },
      '/batch/regulering/orkestrering',
    ),
}
