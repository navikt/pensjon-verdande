import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../../.storybook/mocks/router'
import Alderspensjonssoknader from './soknader'

const meta: Meta = {
  title: 'Sider/Alderspensjon/Førstegangsbehandling søknader',
  component: Alderspensjonssoknader,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(Alderspensjonssoknader, {
      aldeBehandlingUrlTemplate: undefined,
      nowIso: new Date().toISOString(),
      page: {
        content: [
          {
            behandlingId: 3001,
            uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            sisteKjoring: '2024-06-15T10:30:00',
            utsattTil: null,
            opprettet: '2024-06-15T09:00:00',
            stoppet: null,
            ferdig: null,
            status: 'UNDER_BEHANDLING',
            aldeStatus: 'VENTER_MASKINELL',
            nesteAktiviteter: ['HentGrunnlag'],
            kontrollpunkter: [],
            feilmelding: null,
            stackTrace: null,
            sakId: 50001,
            kravId: 60001,
            enhetId: null,
            enhetsNavn: null,
            behandlingstype: 'AUTO',
            onsketVirkningsdato: '2024-07-01',
            erAldeBehandling: false,
            erMuligAldeBehandling: false,
            isVurderSamboerUnderBehandling: false,
          },
        ],
        totalPages: 1,
        totalElements: 1,
        first: true,
        last: true,
        size: 20,
        number: 0,
        numberOfElements: 1,
        pageable: { pageNumber: 0, pageSize: 20 },
      },
      pageIndex: 0,
      pageSize: 20,
      psakSakUrlTemplate: 'https://psak.example.com/sak/{sakId}',
      kildeOppsummering: [],
      fomDato: '2024-05-15',
      tomDato: '2024-06-15',
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(Alderspensjonssoknader, {
      aldeBehandlingUrlTemplate: undefined,
      nowIso: new Date().toISOString(),
      page: {
        content: [],
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: true,
        size: 20,
        number: 0,
        numberOfElements: 0,
        pageable: { pageNumber: 0, pageSize: 20 },
      },
      pageIndex: 0,
      pageSize: 20,
      psakSakUrlTemplate: 'https://psak.example.com/sak/{sakId}',
      kildeOppsummering: [],
      fomDato: '2024-05-15',
      tomDato: '2024-06-15',
    }),
}
