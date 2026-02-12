import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Avstemming from './avstemming'

const meta: Meta = {
  title: 'Sider/Avstemming',
  component: Avstemming,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(Avstemming, {
      behandlinger: mockBehandlingerPage(),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(Avstemming, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
