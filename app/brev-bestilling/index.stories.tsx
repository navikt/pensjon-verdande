import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BrevBestillingOppsummeringRoute from './index'

const mockData = {
  rows: [
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'AP_INNVILGELSE_AUTO',
      brevbakerBrevkode: 'AP_INNVILGELSE_AUTO',
      brevnavn: 'Vedtak - innvilgelse av alderspensjon',
      sprakKode: 'NB',
      antall: 123,
    },
    {
      behandlingstype: 'FleksibelApSakBehandling',
      brevkode: 'AP_ENDRING_AUTO',
      brevbakerBrevkode: 'AP_ENDRING_AUTO',
      brevnavn: 'Vedtak - endring av alderspensjon',
      sprakKode: 'NN',
      antall: 45,
    },
    {
      behandlingstype: 'DodsmeldingBehandling',
      brevkode: 'PE_AP_07_001',
      brevbakerBrevkode: null,
      brevnavn: 'Informasjon om rettigheter ved dødsfall',
      sprakKode: null,
      antall: 8,
    },
    {
      behandlingstype: 'ReguleringFamilieBehandling',
      brevkode: 'UT_REG_AUTO',
      brevbakerBrevkode: 'UT_REG_AUTO',
      brevnavn: 'Vedtak - regulering av uføretrygd',
      sprakKode: 'NB',
      antall: 310,
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
