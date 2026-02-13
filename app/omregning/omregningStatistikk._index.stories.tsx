import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import OmregningStatistikk from './omregningStatistikk._index'

const mockData = {
  omregningStatistikkInit: {
    behandlingsnoekkel: ['NOKKEL_2024', 'NOKKEL_2023'],
  },
  omregningStatistikkPage: {
    content: [
      {
        behandlingsnoekkel: 'NOKKEL_2024',
        status: 'FULLFORT',
        vedtakId: 101,
        sakId: '12345678',
        familieId: 'FAM-001',
        behandlingsrekkefolge: 1,
        behandlingstype: 'OmregningBehandling',
        sorteringsregel: 'STANDARD',
        berortSakBegrunnelser: '',
        kontrollpunkter: '',
      },
    ],
    pageable: { pageNumber: 0 },
    last: true,
    totalPages: 1,
    totalElements: 1,
    size: 10,
    number: 0,
    first: true,
    numberOfElements: 1,
    empty: false,
  },
  omregningStatistikkCsv: '',
}

const meta: Meta = {
  title: 'Sider/Omregning/Statistikk',
  component: OmregningStatistikk,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(OmregningStatistikk, mockData),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(OmregningStatistikk, {
      ...mockData,
      omregningStatistikkPage: {
        ...mockData.omregningStatistikkPage,
        content: [],
        totalElements: 0,
        numberOfElements: 0,
        empty: true,
      },
    }),
}
