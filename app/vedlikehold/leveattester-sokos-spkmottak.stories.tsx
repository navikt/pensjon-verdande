import type { Meta, StoryObj } from '@storybook/react'
import { renderWithAction, withRouter } from '../../.storybook/mocks/router'
import SokosSPKMottakPage from './leveattester-sokos-spkmottak'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Leveattester Sokos',
  component: SokosSPKMottakPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  decorators: [withRouter],
}

export const MedFeilmelding: Story = {
  render: () => renderWithAction(SokosSPKMottakPage, { error: 'Kunne ikke hente data fra Sokos SPK Mottak' }),
}
