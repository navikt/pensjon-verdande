import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '../../../.storybook/mocks/router'
import Kalender from './Kalender'

const meta = {
  title: 'Komponenter/Kalender',
  component: Kalender,
  decorators: [withRouter],
} satisfies Meta<typeof Kalender>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    startDato: new Date(2024, 5, 15),
    maksAntallPerDag: 5,
    visKlokkeSlett: false,
    kalenderHendelser: {
      offentligeFridager: [{ dato: '2024-06-17', navn: 'Pinsedag' }],
      kalenderBehandlinger: [
        { behandlingId: 100001, type: 'Regulering', kjoreDato: '2024-06-10T08:00:00' },
        { behandlingId: 100002, type: 'Omregning', kjoreDato: '2024-06-10T10:00:00' },
        { behandlingId: 100003, type: 'Regulering', kjoreDato: '2024-06-20T09:00:00' },
      ],
    },
  },
}

export const MedKlokkeslett: Story = {
  args: {
    ...Default.args,
    visKlokkeSlett: true,
  },
}
