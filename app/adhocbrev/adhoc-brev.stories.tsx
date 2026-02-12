import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import AdhocBrev from './adhoc-brev'

const meta: Meta = {
  title: 'Sider/Adhocbrev',
  component: AdhocBrev,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(AdhocBrev, {
      behandlinger: mockBehandlingerPage(),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(AdhocBrev, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}
