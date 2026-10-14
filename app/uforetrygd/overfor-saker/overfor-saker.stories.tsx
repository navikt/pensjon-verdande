import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../../.storybook/mocks/router'
import OverforSaker from './overfor-saker'

const meta: Meta<typeof OverforSaker> = {
  title: 'Sider/Uføretrygd/Overfør saker',
  component: OverforSaker,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(OverforSaker, {}),
}
