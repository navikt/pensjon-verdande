import type { Meta, StoryObj } from '@storybook/react'
import { renderWithAction, withRouter } from '../../.storybook/mocks/router'
import LinkeDnrFnrPage from './linke-dnr-fnr'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Linke DNR-FNR',
  component: LinkeDnrFnrPage,
  decorators: [withRouter],
}

export default meta
type Story = StoryObj

export const Default: Story = {}

export const MedFeilmelding: Story = {
  render: () =>
    renderWithAction(LinkeDnrFnrPage, {
      success: false,
      error: 'Kunne ikke linke D-nummer til F-nummer: Ugyldig format',
    }),
}
