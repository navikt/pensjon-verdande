import type { Meta, StoryObj } from '@storybook/react'
import { mockMeResponse } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import NavHeader from './NavHeader'

const meta = {
  title: 'Komponenter/NavHeader',
  component: NavHeader,
  decorators: [withRouter],
} satisfies Meta<typeof NavHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    erProduksjon: false,
    env: 'q2',
    me: mockMeResponse({ tilganger: ['LESE', 'SKRIVE', 'SE_BEHANDLINGER'] }),
    darkmode: false,
    setDarkmode: () => {},
    showIconMenu: false,
    setShowIconMenu: () => {},
    isMac: true,
  },
}

export const Produksjon: Story = {
  args: {
    erProduksjon: true,
    env: 'prod',
    me: mockMeResponse({ tilganger: ['LESE', 'SKRIVE', 'SE_BEHANDLINGER'] }),
    darkmode: false,
    setDarkmode: () => {},
    showIconMenu: false,
    setShowIconMenu: () => {},
    isMac: true,
  },
}
