import type { Meta, StoryObj } from '@storybook/react'
import type { KalenderHendelser } from '~/components/kalender/types'
import { renderWithLoader } from '../../.storybook/mocks/router'
import KalenderVisning from './route'

const mockKalenderHendelser: KalenderHendelser = {
  offentligeFridager: [
    { dato: '2024-06-17', navn: '2. pinsedag' },
    { dato: '2024-06-23', navn: 'Sankthansaften' },
  ],
  kalenderBehandlinger: [
    { behandlingId: 100001, type: 'ForstegangsbehandlingAlder', kjoreDato: '2024-06-10T08:00:00' },
    { behandlingId: 100002, type: 'Omregning', kjoreDato: '2024-06-12T10:00:00' },
    { behandlingId: 100003, type: 'Regulering', kjoreDato: '2024-06-15T09:30:00' },
    { behandlingId: 100004, type: 'ForstegangsbehandlingAlder', kjoreDato: '2024-06-15T14:00:00' },
    { behandlingId: 100005, type: 'Omregning', kjoreDato: '2024-06-20T11:00:00' },
  ],
}

const meta: Meta = {
  title: 'Sider/Kalender',
  component: KalenderVisning,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(KalenderVisning, {
      kalenderHendelser: mockKalenderHendelser,
      startDato: new Date('2024-06-15'),
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(KalenderVisning, {
      kalenderHendelser: { offentligeFridager: [], kalenderBehandlinger: [] },
      startDato: new Date('2024-06-15'),
    }),
}
