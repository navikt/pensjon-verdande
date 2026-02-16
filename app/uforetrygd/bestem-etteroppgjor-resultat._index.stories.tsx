import type { Meta, StoryObj } from '@storybook/react'
import { renderWithAction, withRouter } from '../../.storybook/mocks/router'
import BestemEtteroppgjorResultatPage from './bestem-etteroppgjor-resultat._index'

const meta: Meta = {
  title: 'Sider/Uføretrygd/Bestem etteroppgjør resultat',
  component: BestemEtteroppgjorResultatPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  decorators: [withRouter],
}

export const MedFeilmelding: Story = {
  render: () =>
    renderWithAction(BestemEtteroppgjorResultatPage, {
      success: false,
      error: 'Kunne ikke starte behandling: Ugyldig sak ID "abc"',
    }),
}
