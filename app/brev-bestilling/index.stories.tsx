import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BrevBestillingOppsummeringRoute from './index'

const brevbakerRow = (
  behandlingstype: string,
  brevkode: string,
  originalBrevkode: string,
  brevnavn: string,
  sprakKode: string | null,
  antall: number,
) => ({ behandlingstype, brevkode, originalBrevkode, brevnavn, sprakKode, antall, brevType: 'BREVBAKER' as const })

const legacyRow = (
  behandlingstype: string,
  brevkode: string,
  brevnavn: string | null,
  sprakKode: string | null,
  antall: number,
) => ({
  behandlingstype,
  brevkode,
  originalBrevkode: brevkode,
  brevnavn,
  sprakKode,
  antall,
  brevType: 'LEGACY' as const,
})

const mockData = {
  rows: [
    brevbakerRow(
      'FleksibelApSakBehandling',
      'AP_INNVILGELSE_AUTO',
      'PE_AP_04_001',
      'Vedtak - innvilgelse av alderspensjon',
      'NB',
      123,
    ),
    brevbakerRow(
      'FleksibelApSakBehandling',
      'AP_ENDRING_AUTO',
      'PE_AP_04_002',
      'Vedtak - endring av alderspensjon',
      'NN',
      45,
    ),
    legacyRow('DodsmeldingBehandling', 'PE_AP_07_001', 'Informasjon om rettigheter ved dødsfall', null, 8),
    brevbakerRow(
      'ReguleringFamilieBehandling',
      'UT_REG_AUTO',
      'PE_UT_04_100',
      'Vedtak - regulering av uføretrygd',
      'NB',
      310,
    ),
    legacyRow('FleksibelApSakBehandling', 'PE_GP_04_010', null, 'NB', 3),
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

export const KunBrevbakerMedLenker: Story = {
  render: () =>
    renderWithLoader(BrevBestillingOppsummeringRoute, {
      ...mockData,
      rows: [
        brevbakerRow(
          'FleksibelApSakBehandling',
          'AP_INNVILGELSE_AUTO',
          'PE_AP_04_001',
          'Vedtak - innvilgelse av alderspensjon',
          'NB',
          200,
        ),
        brevbakerRow(
          'ReguleringFamilieBehandling',
          'UT_REG_AUTO',
          'PE_UT_04_100',
          'Vedtak - regulering av uføretrygd',
          'NN',
          150,
        ),
        brevbakerRow(
          'DodsmeldingBehandling',
          'AP_DODSMELDING_AUTO',
          'PE_AP_07_001',
          'Informasjon om dødsfall',
          null,
          42,
        ),
      ],
    }),
}
