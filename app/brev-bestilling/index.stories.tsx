import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BrevBestillingOppsummeringRoute from './index'

const mockData = {
  rows: [
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'PE_AP_04_001',
      sprakKode: 'NB',
      antall: 123,
    },
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'PE_AP_04_002',
      sprakKode: 'NN',
      antall: 45,
    },
    {
      behandlingstype: 'DodsmeldingBehandling',
      brevkode: 'PE_AP_07_001',
      sprakKode: null,
      antall: 8,
    },
    {
      behandlingstype: 'ReguleringFamilieBehandling',
      brevkode: 'PE_UT_04_100',
      sprakKode: 'NB',
      antall: 310,
    },
  ],
  nowIso: new Date().toISOString(),
  fomDato: '2024-05-01',
  tomDato: '2024-06-01',
}

const meta: Meta = {
  title: 'Sider/Brev-bestilling',
  component: BrevBestillingOppsummeringRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(BrevBestillingOppsummeringRoute, mockData),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BrevBestillingOppsummeringRoute, {
      ...mockData,
      rows: [],
    }),
}
