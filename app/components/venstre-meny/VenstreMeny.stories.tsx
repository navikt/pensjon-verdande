import type { Meta, StoryObj } from '@storybook/react'
import { mockMeResponse } from '../../../.storybook/mocks/data'
import { withRouter } from '../../../.storybook/mocks/router'
import VenstreMeny from './VenstreMeny'

const meta = {
  title: 'Komponenter/VenstreMeny',
  component: VenstreMeny,
  decorators: [withRouter],
} satisfies Meta<typeof VenstreMeny>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    me: mockMeResponse({
      tilganger: ['LESE', 'SKRIVE', 'SE_BEHANDLINGER', 'REGULERING_LES', 'OMREGN_YTELSER', 'BATCH_KJORINGER'],
      verdandeRoller: ['SAKSBEHANDLER', 'VERDANDE_ADMIN'],
    }),
    showIconMenu: false,
  },
}

export const KunIkoner: Story = {
  args: {
    me: mockMeResponse({
      tilganger: ['LESE', 'SKRIVE', 'SE_BEHANDLINGER'],
      verdandeRoller: ['SAKSBEHANDLER'],
    }),
    showIconMenu: true,
  },
}
