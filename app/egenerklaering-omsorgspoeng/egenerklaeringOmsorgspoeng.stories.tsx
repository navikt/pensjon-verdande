import type { Meta, StoryObj } from '@storybook/react'
import { mockBehandlingerPage } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import EgenerklaeringOmsorgspoeng from './egenerklaeringOmsorgspoeng'

const meta: Meta = {
  title: 'Sider/EgenerklaeringOmsorgspoeng',
  component: EgenerklaeringOmsorgspoeng,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(EgenerklaeringOmsorgspoeng, {
      behandlinger: mockBehandlingerPage(),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(EgenerklaeringOmsorgspoeng, {
      behandlinger: mockBehandlingerPage([], { empty: true }),
    }),
}

export const FeilendeData: Story = {
  tags: ['error-expected'],
  render: () =>
    renderWithLoader(EgenerklaeringOmsorgspoeng, {
      behandlinger: Promise.reject(new Error('Tidsavbrudd')),
    }),
}
