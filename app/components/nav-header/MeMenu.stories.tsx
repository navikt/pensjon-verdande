import type { Meta, StoryObj } from '@storybook/react'
import { mockMeResponse } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import MeMenu from './MeMenu'

const meta = {
  title: 'Komponenter/MeMenu',
  component: MeMenu,
  decorators: [withRouter],
} satisfies Meta<typeof MeMenu>

export default meta
type Story = StoryObj<typeof meta>

export const LightMode: Story = {
  args: {
    meResponse: mockMeResponse(),
    isDarkmode: false,
    setIsDarkmode: () => {},
  },
}

export const DarkMode: Story = {
  args: {
    meResponse: mockMeResponse(),
    isDarkmode: true,
    setIsDarkmode: () => {},
  },
}
