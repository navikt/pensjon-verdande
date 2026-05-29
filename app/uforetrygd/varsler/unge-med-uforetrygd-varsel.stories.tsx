import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../../.storybook/mocks/router'
import UngeMedUforetrygdVarselPage from './unge-med-uforetrygd-varsel'

const meta: Meta = {
  title: 'Sider/Uføretrygd/Unge med uføretrygd varsel',
  component: UngeMedUforetrygdVarselPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(UngeMedUforetrygdVarselPage, null),
}
