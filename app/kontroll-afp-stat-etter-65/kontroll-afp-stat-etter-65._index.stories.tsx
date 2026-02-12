import type { Meta, StoryObj } from '@storybook/react'
import { createRoutesStub } from 'react-router'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OpprettKontrollAfpStatEtter65Route from './kontroll-afp-stat-etter-65._index'

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
  behandlingTyper: ['AFPStat65Kontroll'],
  sort: { unsorted: true, sorted: false, empty: true },
}

const meta: Meta = {
  title: 'Sider/Kontroll AFP stat etter 65',
  component: OpprettKontrollAfpStatEtter65Route,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(OpprettKontrollAfpStatEtter65Route, {
      behandlinger: mockBehandlinger,
    }),
}

export const MedFeilmelding: Story = {
  render: () => {
    const Wrapper = (props: any) => (
      <OpprettKontrollAfpStatEtter65Route
        {...props}
        actionData={{ error: 'Batch-kjøring feilet: Kunne ikke opprette behandlinger' }}
      />
    )
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Wrapper,
        loader: () => ({ behandlinger: mockBehandlinger }),
      },
    ])
    return <Stub initialEntries={['/']} />
  },
}
