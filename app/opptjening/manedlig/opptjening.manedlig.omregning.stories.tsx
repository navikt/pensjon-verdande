import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../../.storybook/mocks/router'
import OpprettEndretOpptjeningRoute from './opptjening.manedlig.omregning'

const mockBehandlinger = {
  content: [],
  pageable: 'INSTANCE',
  totalPages: 0,
  totalElements: 0,
  last: true,
  first: true,
  numberOfElements: 0,
  number: 0,
  size: 12,
  empty: true,
  behandlingStatuser: ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT'],
  behandlingTyper: ['OpptjeningIdentifiserKategoriManedlig'],
  sort: { unsorted: true, sorted: false, empty: true },
}

const mockData = {
  behandlinger: mockBehandlinger,
  kanOverstyre: false,
  maneder: ['2024-06', '2024-07', '2024-08'],
  defaultMonth: '2024-06',
  sisteAvsjekk: {
    sisteAvsjekkTidspunkt: '2024-06-01T08:00:00',
    antallHendelserPopp: BigInt(150),
    antallHendelserPen: BigInt(150),
    avsjekkOk: true,
  },
}

const meta: Meta = {
  title: 'Sider/Opptjening/Månedlig omregning',
  component: OpprettEndretOpptjeningRoute,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(OpprettEndretOpptjeningRoute, mockData),
}

export const NoAvsjekk: Story = {
  render: () =>
    renderWithLoader(OpprettEndretOpptjeningRoute, {
      ...mockData,
      sisteAvsjekk: null,
    }),
}

export const MedFeiletAvsjekk: Story = {
  render: () =>
    renderWithLoader(OpprettEndretOpptjeningRoute, {
      ...mockData,
      sisteAvsjekk: {
        sisteAvsjekkTidspunkt: '2024-06-01T08:00:00',
        antallHendelserPopp: BigInt(150),
        antallHendelserPen: BigInt(120),
        avsjekkOk: false,
      },
    }),
}
