import type { Meta, StoryObj } from '@storybook/react'
import type { TidsserieDatapunkt } from '~/analyse/types'
import { AktivitetChart } from './AktivitetChart'

const meta = {
  title: 'Komponenter/AktivitetChart',
  component: AktivitetChart,
} satisfies Meta<typeof AktivitetChart>

export default meta
type Story = StoryObj<typeof meta>

const mockDatapunkter: TidsserieDatapunkt[] = [
  { periodeFra: '2024-06-15T00:00:00', status: 'FULLFORT', antall: 3 },
  { periodeFra: '2024-06-15T00:00:00', status: 'UNDER_BEHANDLING', antall: 1 },
  { periodeFra: '2024-06-15T00:00:00', status: 'STOPPET', antall: 0 },
  { periodeFra: '2024-06-15T02:00:00', status: 'FULLFORT', antall: 5 },
  { periodeFra: '2024-06-15T02:00:00', status: 'UNDER_BEHANDLING', antall: 2 },
  { periodeFra: '2024-06-15T02:00:00', status: 'STOPPET', antall: 1 },
  { periodeFra: '2024-06-15T04:00:00', status: 'FULLFORT', antall: 8 },
  { periodeFra: '2024-06-15T04:00:00', status: 'UNDER_BEHANDLING', antall: 3 },
  { periodeFra: '2024-06-15T04:00:00', status: 'STOPPET', antall: 0 },
  { periodeFra: '2024-06-15T06:00:00', status: 'FULLFORT', antall: 12 },
  { periodeFra: '2024-06-15T06:00:00', status: 'UNDER_BEHANDLING', antall: 4 },
  { periodeFra: '2024-06-15T06:00:00', status: 'STOPPET', antall: 2 },
]

export const Siste24Timer: Story = {
  args: {
    datapunkter: mockDatapunkter,
    antallTimer: 24,
  },
}

export const Siste7Dager: Story = {
  args: {
    datapunkter: mockDatapunkter,
    antallTimer: 168,
  },
}

export const TomtDatasett: Story = {
  args: {
    datapunkter: [],
    antallTimer: 24,
  },
}

const feilendeDatapunkter: TidsserieDatapunkt[] = [
  { periodeFra: '2024-06-15T00:00:00', status: 'FEILENDE', antall: 2 },
  { periodeFra: '2024-06-15T02:00:00', status: 'FEILENDE', antall: 4 },
  { periodeFra: '2024-06-15T04:00:00', status: 'FEILENDE', antall: 1 },
  { periodeFra: '2024-06-15T06:00:00', status: 'FEILENDE', antall: 3 },
]

const mockDatapunkterMedFeilende: TidsserieDatapunkt[] = [...mockDatapunkter, ...feilendeDatapunkter]

export const MedFeilendeStatus: Story = {
  args: {
    datapunkter: mockDatapunkterMedFeilende,
    antallTimer: 24,
  },
}
