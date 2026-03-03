import { VStack } from '@navikt/ds-react'
import type { Meta, StoryObj } from '@storybook/react'
import { createRoutesStub } from 'react-router'
import { BehandlingerPerDagLineChartCard } from '~/components/behandlinger-per-dag-linechart/BehandlingerPerDagLineChartCard'
import type { DatoAntall } from '~/types'
import { mockBehandlingDto, mockBehandlingerPage } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import BehandlingerTable from './BehandlingerTable'

const meta = {
  title: 'Komponenter/BehandlingerTable',
  component: BehandlingerTable,
} satisfies Meta<typeof BehandlingerTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [withRouter],
  args: {
    behandlingerResponse: mockBehandlingerPage([
      mockBehandlingDto({ behandlingId: 100001, type: 'ForstegangsbehandlingAlder', status: 'UNDER_BEHANDLING' }),
      mockBehandlingDto({ behandlingId: 100002, type: 'Omregning', status: 'FULLFORT', ferdig: '2024-06-15T12:00:00' }),
      mockBehandlingDto({
        behandlingId: 100003,
        type: 'Regulering',
        status: 'FEILENDE',
        feilmelding: 'Feil ved henting av grunnlag',
      }),
    ]),
  },
}

export const UtenFortsettKnapp: Story = {
  decorators: [withRouter],
  args: {
    behandlingerResponse: mockBehandlingerPage([mockBehandlingDto({ behandlingId: 100001, status: 'FULLFORT' })]),
    inkluderFortsett: false,
  },
}

export const Tom: Story = {
  decorators: [withRouter],
  args: {
    behandlingerResponse: mockBehandlingerPage([]),
  },
}

function generateOpprettetPerDag(days: number): DatoAntall[] {
  const result: DatoAntall[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    // Deterministic pseudo-random values based on day index
    const antall = ((i * 7 + 3) % 13) + 1
    result.push({ dato: `${yyyy}-${mm}-${dd}`, antall })
  }
  return result
}

export const MedDiagram: StoryObj = {
  decorators: [
    (Story) => {
      const Stub = createRoutesStub([{ path: '/', Component: Story }])
      return <Stub initialEntries={['/?behandlingType=FleksibelApSakBehandling']} />
    },
  ],
  render: () => (
    <VStack gap="space-24">
      <BehandlingerPerDagLineChartCard opprettetPerDag={generateOpprettetPerDag(30)} chartHeight={180} />
      <BehandlingerTable
        visStatusSoek={true}
        behandlingerResponse={mockBehandlingerPage(
          [
            mockBehandlingDto({
              behandlingId: 100001,
              type: 'FleksibelApSakBehandling',
              status: 'UNDER_BEHANDLING',
            }),
            mockBehandlingDto({
              behandlingId: 100002,
              type: 'FleksibelApSakBehandling',
              status: 'FULLFORT',
              ferdig: '2024-06-15T12:00:00',
            }),
            mockBehandlingDto({
              behandlingId: 100003,
              type: 'FleksibelApSakBehandling',
              status: 'FEILENDE',
              feilmelding: 'Feil ved henting av grunnlag',
            }),
          ],
          { behandlingTyper: ['FleksibelApSakBehandling'] },
        )}
      />
    </VStack>
  ),
}
