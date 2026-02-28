import type { Meta, StoryObj } from '@storybook/react'
import { createRoutesStub } from 'react-router'
import { mockBehandlingDto, mockBehandlingerPage } from '../../../.storybook/mocks/data'
import SearchDialog from './SearchDialog'

function withSearchRoute(
  searchData: { behandlinger: ReturnType<typeof mockBehandlingerPage> | null; error?: string | null } = {
    behandlinger: null,
    error: null,
  },
  props: { defaultOpen?: boolean; initialQuery?: string } = {},
) {
  const Component = () => <SearchDialog {...props} />
  const Stub = createRoutesStub([
    {
      path: '/',
      Component,
    },
    {
      path: '/api/sok',
      action: () => searchData,
    },
  ])
  return <Stub initialEntries={['/']} />
}

const meta = {
  title: 'Komponenter/SearchDialog',
  component: SearchDialog,
} satisfies Meta<typeof SearchDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => withSearchRoute(),
}

export const MedResultater: Story = {
  render: () =>
    withSearchRoute(
      {
        behandlinger: mockBehandlingerPage([
          mockBehandlingDto({
            behandlingId: 5591497,
            type: 'BrevkvitteringBehandling',
            status: 'FULLFORT',
            ansvarligTeam: 'PESYS_FELLES',
            matchedVerdiTypeDecodes: ['JournalpostId'],
          }),
          mockBehandlingDto({
            behandlingId: 5591498,
            type: 'ForstegangsbehandlingAlder',
            status: 'UNDER_BEHANDLING',
            ansvarligTeam: 'PESYS_ALDER',
            matchedVerdiTypeDecodes: ['Fødselsnummer', 'Saksnummer'],
          }),
          mockBehandlingDto({
            behandlingId: 5591499,
            type: 'Omregning',
            status: 'FEILENDE',
            ansvarligTeam: 'PESYS_UFORE',
            matchedVerdiTypeDecodes: ['Saksnummer'],
          }),
        ]),
      },
      { defaultOpen: true, initialQuery: '454008672' },
    ),
}

export const MedResultaterUtenTeam: Story = {
  render: () =>
    withSearchRoute(
      {
        behandlinger: mockBehandlingerPage([
          mockBehandlingDto({
            behandlingId: 1234567,
            type: 'Regulering',
            status: 'OPPRETTET',
            ansvarligTeam: null,
            matchedVerdiTypeDecodes: ['BehandlingId'],
          }),
        ]),
      },
      { defaultOpen: true, initialQuery: '1234567' },
    ),
}

export const IngenResultater: Story = {
  render: () =>
    withSearchRoute(
      {
        behandlinger: mockBehandlingerPage([], { totalElements: 0 }),
      },
      { defaultOpen: true, initialQuery: 'finnesikke' },
    ),
}
