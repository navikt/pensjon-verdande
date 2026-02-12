import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BrukerComponent from './$brukernavn'

const mockData = {
  bruker: {
    brukernavn: 'P123456',
    fornavn: 'Kari',
    etternavn: 'Nordmann',
    tilganger: ['LESE', 'SKRIVE'],
    tilgangsHistorikk: [
      {
        brukernavn: 'P123456',
        fra: '2024-01-01T00:00:00',
        til: null,
        operasjon: 'LESE',
        gittAvBruker: 'P000001',
        fjernetAvBruker: null,
      },
    ],
  },
  tilgangskontrollmeta: [
    {
      operasjonNavn: 'LESE',
      operasjonBeskrivelse: 'Lesetilgang',
      omfangNavn: 'GLOBAL',
      omfangBeskrivelse: 'Global',
    },
    {
      operasjonNavn: 'SKRIVE',
      operasjonBeskrivelse: 'Skrivetilgang',
      omfangNavn: 'GLOBAL',
      omfangBeskrivelse: 'Global',
    },
  ],
  readOnly: false,
}

const meta: Meta = {
  title: 'Sider/Brukere/Detalj',
  component: BrukerComponent,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(BrukerComponent, mockData),
}

export const ReadOnly: Story = {
  render: () =>
    renderWithLoader(BrukerComponent, {
      ...mockData,
      readOnly: true,
    }),
}
