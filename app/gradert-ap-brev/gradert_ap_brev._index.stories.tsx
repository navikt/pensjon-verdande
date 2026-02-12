import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '../../.storybook/mocks/router'
import OpprettGradertAPRoute from './gradert_ap_brev._index'

const meta: Meta = {
  title: 'Sider/Gradert AP-brev',
  component: OpprettGradertAPRoute,
  decorators: [withRouter],
}

export default meta
type Story = StoryObj

export const Default: Story = {}
