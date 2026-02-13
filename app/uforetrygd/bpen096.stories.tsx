import type { Meta, StoryObj } from '@storybook/react'
import { renderWithAction, renderWithLoader } from '../../.storybook/mocks/router'
import HentOpplysningerFraSkatt from './bpen096'

const meta: Meta = {
  title: 'Sider/Uføretrygd/BPEN096',
  component: HentOpplysningerFraSkatt,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(HentOpplysningerFraSkatt, {}),
}

export const MedValideringsfeil: Story = {
  render: () =>
    renderWithAction(HentOpplysningerFraSkatt, { action: 'HENT_SKATTEHENDELSER_MANUELT', error: 'Ugyldig sekvensnr' }),
}
