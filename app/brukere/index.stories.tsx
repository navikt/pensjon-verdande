import type { Meta, StoryObj } from '@storybook/react'
import type { BrukerResponse } from '~/brukere/brukere'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Brukere from './index'

const mockBrukere: BrukerResponse[] = [
  {
    brukernavn: 'P123456',
    fornavn: 'Kari',
    etternavn: 'Nordmann',
    tilganger: ['LESE', 'SKRIVE'],
    tilgangsHistorikk: [],
  },
  {
    brukernavn: 'P654321',
    fornavn: 'Ola',
    etternavn: 'Hansen',
    tilganger: ['LESE'],
    tilgangsHistorikk: [],
  },
  {
    brukernavn: 'P111222',
    fornavn: 'Per',
    etternavn: 'Olsen',
    tilganger: ['LESE', 'SKRIVE', 'ADMIN'],
    tilgangsHistorikk: [],
  },
]

const meta: Meta = {
  title: 'Sider/Brukere',
  component: Brukere,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(Brukere, {
      brukere: mockBrukere,
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(Brukere, {
      brukere: [],
    }),
}
