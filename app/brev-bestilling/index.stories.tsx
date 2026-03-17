import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BrevBestillingOppsummeringRoute from './index'

const mockData = {
  rows: [
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'AP_INNVILGELSE_AUTO',
      originalBrevkode: 'PE_AP_04_001',
      brevnavn: 'Vedtak - innvilgelse av alderspensjon',
      sprakKode: 'NB',
      antall: 123,
    },
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'AP_ENDRING_AUTO',
      originalBrevkode: 'PE_AP_04_002',
      brevnavn: 'Vedtak - endring av alderspensjon',
      sprakKode: 'NN',
      antall: 45,
    },
    {
      behandlingstype: 'DodsmeldingBehandling',
      brevkode: 'PE_AP_07_001',
      originalBrevkode: 'PE_AP_07_001',
      brevnavn: 'Informasjon om rettigheter ved dødsfall',
      sprakKode: null,
      antall: 8,
    },
    {
      behandlingstype: 'ReguleringFamilieBehandling',
      brevkode: 'UT_REG_AUTO',
      originalBrevkode: 'PE_UT_04_100',
      brevnavn: 'Vedtak - regulering av uføretrygd',
      sprakKode: 'NB',
      antall: 310,
    },
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'PE_GP_04_010',
      originalBrevkode: 'PE_GP_04_010',
      brevnavn: null,
      sprakKode: 'NB',
      antall: 3,
    },
  ],
  nowIso: new Date().toISOString(),
  fomDato: '2024-05-01',
  tomDato: '2024-06-01',
}

const meta: Meta = {
  title: 'Sider/Brevbestilling',
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
