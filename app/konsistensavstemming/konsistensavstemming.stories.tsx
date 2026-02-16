import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Konsistensavstemming from './konsistensavstemming'

const meta: Meta = {
  title: 'Sider/Konsistensavstemming',
  component: Konsistensavstemming,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(Konsistensavstemming, {
      behandlinger: mockBehandlingerPage(),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(Konsistensavstemming, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
