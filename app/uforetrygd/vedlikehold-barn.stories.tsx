import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import VedlikeholdBarnPage from './vedlikehold-barn'

const meta: Meta = {
  title: 'Sider/Uføretrygd/Vedlikehold barn',
  component: VedlikeholdBarnPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(VedlikeholdBarnPage, null),
}
