import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import BatchOpprett_index from './omregning._index'

const mockData = {
  omregningInit: {
    toleransegrenser: ['0', '100', '500'],
    oppgaveSett: ['OPPG_01', 'OPPG_02'],
    batchbrevtyper: ['PE_AP_REGULERING', 'PE_UT_REGULERING'],
  },
  omregningSakerPage: {
    content: [],
    pageable: { pageNumber: 0 },
    last: true,
    totalPages: 1,
    totalElements: 0,
    size: 10,
    number: 0,
    first: true,
    numberOfElements: 0,
    empty: true,
  },
}

const meta: Meta = {
  title: 'Sider/Omregning',
  component: BatchOpprett_index,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(BatchOpprett_index, mockData),
}
