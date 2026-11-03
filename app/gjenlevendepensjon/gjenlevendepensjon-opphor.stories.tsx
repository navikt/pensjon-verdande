import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import GjenlevendepensjonOpphorPage from './gjenlevendepensjon-opphor'

const meta: Meta = {
  title: 'Sider/Gjenlevendepensjon/Opphør',
  component: GjenlevendepensjonOpphorPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(GjenlevendepensjonOpphorPage, {}),
}
