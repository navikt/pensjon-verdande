import type { Meta, StoryObj } from '@storybook/react'
import { mockAktivitetDto, mockBehandlingDto, mockBehandlingKjoringDto } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import { BehandlingKjoringerTable } from './BehandlingKjoringerTable'

const meta = {
  title: 'Komponenter/BehandlingKjoringerTable',
  component: BehandlingKjoringerTable,
  decorators: [withRouter],
} satisfies Meta<typeof BehandlingKjoringerTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandling: mockBehandlingDto({
      aktiviteter: [
        mockAktivitetDto({ aktivitetId: 200001, type: 'HentGrunnlag' }),
        mockAktivitetDto({ aktivitetId: 200002, type: 'BeregnYtelse' }),
      ],
      behandlingKjoringer: [
        mockBehandlingKjoringDto({
          behandlingKjoringId: 300001,
          aktivitetId: 200001,
          startet: '2024-06-15T10:00:00',
          avsluttet: '2024-06-15T10:00:02',
        }),
        mockBehandlingKjoringDto({
          behandlingKjoringId: 300002,
          aktivitetId: 200002,
          startet: '2024-06-15T10:00:03',
          avsluttet: '2024-06-15T10:00:05',
          feilmelding: 'NullPointerException i BeregnYtelse',
          stackTrace: 'java.lang.NullPointerException\n  at BeregnYtelse.run(BeregnYtelse.java:42)',
        }),
      ],
    }),
    erAldeKjoring: false,
  },
}

export const AldeKjoring: Story = {
  args: {
    behandling: mockBehandlingDto({
      aktiviteter: [mockAktivitetDto({ aktivitetId: 200001, type: 'AldeBehandling' })],
      behandlingKjoringer: [
        mockBehandlingKjoringDto({
          behandlingKjoringId: 300001,
          aktivitetId: 200001,
          startet: '2024-06-15T10:00:00',
          avsluttet: '2024-06-15T10:00:03',
          aldeStartState: 'HENT_GRUNNLAG',
          aldeEndState: 'PROSESSER_VURDERING',
        }),
      ],
    }),
    erAldeKjoring: true,
  },
}
