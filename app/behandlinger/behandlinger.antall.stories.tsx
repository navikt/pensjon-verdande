import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BehandlingerAntall from './behandlinger.antall'

const meta: Meta = {
  title: 'Sider/Behandlinger/Antall etter type',
  component: BehandlingerAntall,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(BehandlingerAntall, {
      behandlingAntall: [
        { navn: 'Førstegangsbehandling Alder', behandlingType: 'ForstegangsbehandlingAlder', antall: 42 },
        { navn: 'Omregning', behandlingType: 'Omregning', antall: 128 },
        { navn: 'Regulering', behandlingType: 'Regulering', antall: 15 },
      ],
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(BehandlingerAntall, {
      behandlingAntall: [],
    }),
}
