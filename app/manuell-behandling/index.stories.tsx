import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import ManuellBehandlingOppsummeringRoute from './index'

const mockData = {
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
}

const meta: Meta = {
  title: 'Sider/Manuell behandling',
  component: ManuellBehandlingOppsummeringRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(ManuellBehandlingOppsummeringRoute, mockData),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(ManuellBehandlingOppsummeringRoute, {
      ...mockData,
      rows: [],
    }),
}
