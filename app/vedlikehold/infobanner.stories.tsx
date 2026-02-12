import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import InfoBannerPage from './infobanner'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Infobanner',
  component: InfoBannerPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(InfoBannerPage, {
      validToDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      variant: 'INFO',
      description: 'Planlagt vedlikehold lørdag 21. juni kl. 08:00–12:00.',
      url: 'https://nav.no',
      urlText: 'Les mer',
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(InfoBannerPage, {
      validToDate: null,
      variant: null,
      description: null,
      url: null,
      urlText: null,
    }),
}
