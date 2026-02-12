import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../../.storybook/mocks/router'
import EndretOpptjeningArligUttrekk from './opptjening.arlig.omregning'

const mockData = {
  ekskluderteSaker: [
    { sakId: '11111111', kommentar: 'Manuell håndtering' },
    { sakId: '22222222', kommentar: undefined },
  ],
  innevaerendeAar: 2024,
  aarListe: [2025, 2024, 2023],
  defaultOpptjeningsaar: 2023,
}

const meta: Meta = {
  title: 'Sider/Opptjening/Årlig omregning',
  component: EndretOpptjeningArligUttrekk,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(EndretOpptjeningArligUttrekk, mockData),
}

export const NoEkskluderteSaker: Story = {
  render: () =>
    renderWithLoader(EndretOpptjeningArligUttrekk, {
      ...mockData,
      ekskluderteSaker: [],
    }),
}
