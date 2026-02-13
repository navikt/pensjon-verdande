import type { Meta, StoryObj } from '@storybook/react'
import { renderWithAction, renderWithLoader } from '../../.storybook/mocks/router'
import EtteroppgjorHistorikkUforePage from './etteroppgjor-historikk-ufore'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Etteroppgjør historikk uføre',
  component: EtteroppgjorHistorikkUforePage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(EtteroppgjorHistorikkUforePage, {}),
}

export const MedFeilmelding: Story = {
  render: () =>
    renderWithAction(EtteroppgjorHistorikkUforePage, { success: false, error: 'Fant ikke sak med oppgitt ID' }),
}
