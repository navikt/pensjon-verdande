import type { Meta, StoryObj } from '@storybook/react'
import { mockAktivitetDto, mockBehandlingDto } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import BehandlingAktivitetTable from './BehandlingAktivitetTable'

const meta = {
  title: 'Komponenter/BehandlingAktivitetTable',
  component: BehandlingAktivitetTable,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingAktivitetTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandling: mockBehandlingDto({
      aktiviteter: [
        mockAktivitetDto({
          aktivitetId: 200001,
          type: 'HentGrunnlag',
          status: 'FULLFORT',
          antallGangerKjort: 1,
        }),
        mockAktivitetDto({
          aktivitetId: 200002,
          type: 'BeregnYtelse',
          status: 'UNDER_BEHANDLING',
          antallGangerKjort: 3,
          opprettet: '2024-06-15T09:10:00',
          sisteAktiveringsdato: '2024-06-15T10:30:00',
        }),
        mockAktivitetDto({
          aktivitetId: 200003,
          type: 'Iverksett',
          status: 'OPPRETTET',
          antallGangerKjort: 0,
          ventPaForegaendeAktiviteter: true,
        }),
      ],
    }),
  },
}
