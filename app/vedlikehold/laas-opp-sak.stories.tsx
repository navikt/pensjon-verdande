import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '../../.storybook/mocks/router'
import LaasOppSakPage from './laas-opp-sak'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Lås opp sak',
  component: LaasOppSakPage,
  decorators: [withRouter],
}

export default meta
type Story = StoryObj

export const Default: Story = {}
