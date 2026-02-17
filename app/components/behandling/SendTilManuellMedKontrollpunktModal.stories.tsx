import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingDto } from '../../../.storybook/mocks/data'
import SendTilManuellMedKontrollpunktModal from './SendTilManuellMedKontrollpunktModal'

const meta = {
  title: 'Komponenter/SendTilManuellMedKontrollpunktModal',
  component: SendTilManuellMedKontrollpunktModal,
} satisfies Meta<typeof SendTilManuellMedKontrollpunktModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    behandling: mockBehandlingDto({
      muligeKontrollpunkt: [
        { kontrollpunkt: 'KONTROLL_PUNKT_1', decode: 'Kontrollpunkt for manuell vurdering' },
        { kontrollpunkt: 'KONTROLL_PUNKT_2', decode: 'Kontrollpunkt for saksbehandler' },
      ],
    }),
    sendTilManuellMedKontrollpunkt: () => {},
  },
}
