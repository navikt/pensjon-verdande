import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OpprettKontrollKvalitetssjekkRoute from './kontroll-kvalitetssjekk._index'

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
  behandlingTyper: ['KontrollKvalitetssjekk'],
  sort: { unsorted: true, sorted: false, empty: true },
}

const meta: Meta = {
  title: 'Sider/Kontroll kvalitet',
  component: OpprettKontrollKvalitetssjekkRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(OpprettKontrollKvalitetssjekkRoute, {
      behandlinger: mockBehandlinger,
    }),
}
