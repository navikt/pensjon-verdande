import type { Meta, StoryObj } from '@storybook/react'
import type { BehandlingAuditDTO, PageDTO } from '~/audit/audit.types'
import { renderWithLoader } from '../../.storybook/mocks/router'
import AuditIndexPage from './audit.index'

const mockAuditPage: PageDTO<BehandlingAuditDTO> = {
  content: [
    {
      id: 'audit-001',
      tidspunkt: '2024-06-15T10:30:00',
      navident: 'P123456',
      handling: 'LES_BEHANDLING',
      handlingDekode: 'Les behandling',
      handlingType: 'LES',
      behandlingId: 100001,
      behandlingType: 'ForstegangsbehandlingAlder',
      behandlingStatus: 'UNDER_BEHANDLING',
    },
    {
      id: 'audit-002',
      tidspunkt: '2024-06-15T11:00:00',
      navident: 'P654321',
      handling: 'FORTSETT_BEHANDLING',
      handlingDekode: 'Fortsett behandling',
      handlingType: 'SKRIV',
      behandlingId: 100002,
      behandlingType: 'Omregning',
      behandlingStatus: 'FULLFORT',
      begrunnelse: 'Feilretting etter manuell sjekk',
    },
    {
      id: 'audit-003',
      tidspunkt: '2024-06-15T12:15:00',
      navident: 'P123456',
      handling: 'STOPP_BEHANDLING',
      handlingDekode: 'Stopp behandling',
      handlingType: 'SKRIV',
      behandlingId: 100003,
      behandlingType: 'Regulering',
      behandlingStatus: 'STOPPET',
      begrunnelse: 'Behandling stoppet grunnet feil i grunnlag',
    },
  ],
  number: 0,
  size: 20,
  totalElements: 3,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
}

const meta: Meta = {
  title: 'Sider/Audit',
  component: AuditIndexPage,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(AuditIndexPage, {
      page: mockAuditPage,
      view: 'raw' as const,
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(AuditIndexPage, {
      page: {
        content: [],
        number: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      view: 'raw' as const,
    }),
}
