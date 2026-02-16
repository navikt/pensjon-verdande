import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OpprettKontrollSaerskiltSatsRoute from './kontroll-saerskilt-sats._index'

const mockBehandlinger = {
  content: [],
  pageable: 'INSTANCE',
  totalPages: 0,
  totalElements: 0,
  last: true,
  first: true,
  numberOfElements: 0,
  number: 0,
  size: 5,
  empty: true,
  behandlingStatuser: ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT'],
  behandlingTyper: ['KontrollerSaerskiltSats_Utplukk'],
  sort: { unsorted: true, sorted: false, empty: true },
}

const meta: Meta = {
  title: 'Sider/Kontroll særskilt sats',
  component: OpprettKontrollSaerskiltSatsRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(OpprettKontrollSaerskiltSatsRoute, {
      behandlinger: mockBehandlinger,
    }),
}
