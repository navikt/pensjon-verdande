import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import SchedulerStyringPage from './scheduler-styring'

const meta: Meta = {
  title: 'Sider/Vedlikehold/Scheduler-styring',
  component: SchedulerStyringPage,
}

export default meta
type Story = StoryObj

const schedulerStyring = {
  erAktiv: true,
  endretAv: 'Z999999',
  endretDato: '2026-03-04T10:00:00',
}

const typeStyringer = [
  {
    behandlingCode: 'DagligAvstemmingBehandling',
    erAktiv: true,
    maksSamtidige: null,
    endretAv: null,
    endretDato: null,
  },
  {
    behandlingCode: 'PersonAjourholdBehandling',
    erAktiv: false,
    maksSamtidige: 3,
    endretAv: 'Z999999',
    endretDato: '2026-03-04T09:00:00',
  },
  {
    behandlingCode: 'AldersovergangKontrollBehandling',
    erAktiv: true,
    maksSamtidige: null,
    endretAv: null,
    endretDato: null,
  },
  {
    behandlingCode: 'AfpStat65KontrollBehandling',
    erAktiv: true,
    maksSamtidige: 2,
    endretAv: 'Z888888',
    endretDato: '2026-03-03T15:30:00',
  },
  {
    behandlingCode: 'DistribuerBrevBehandling',
    erAktiv: true,
    maksSamtidige: null,
    endretAv: null,
    endretDato: null,
  },
  {
    behandlingCode: 'EtteroppgjorUTBehandling',
    erAktiv: false,
    maksSamtidige: null,
    endretAv: 'Z999999',
    endretDato: '2026-03-02T12:00:00',
  },
  {
    behandlingCode: 'ForventetInntektUTBehandling',
    erAktiv: true,
    maksSamtidige: 5,
    endretAv: 'Z888888',
    endretDato: '2026-03-01T08:00:00',
  },
  {
    behandlingCode: 'IverksettVedtakBehandling',
    erAktiv: true,
    maksSamtidige: null,
    endretAv: null,
    endretDato: null,
  },
]

const audit = [
  {
    behandlingCode: 'PersonAjourholdBehandling',
    handling: 'DEAKTIVER',
    gammelVerdi: 'true',
    nyVerdi: 'false',
    utfortAv: 'Z999999',
    utfortDato: '2026-03-04T09:00:00',
  },
  {
    behandlingCode: 'AfpStat65KontrollBehandling',
    handling: 'ENDRE_MAKS_SAMTIDIGE',
    gammelVerdi: null,
    nyVerdi: '2',
    utfortAv: 'Z888888',
    utfortDato: '2026-03-03T15:30:00',
  },
  {
    behandlingCode: 'GLOBAL',
    handling: 'AKTIVER',
    gammelVerdi: 'false',
    nyVerdi: 'true',
    utfortAv: 'Z999999',
    utfortDato: '2026-03-03T08:00:00',
  },
]

export const Default: Story = {
  render: () => renderWithLoader(SchedulerStyringPage, { schedulerStyring, typeStyringer, audit }),
}

export const GlobalStoppet: Story = {
  render: () =>
    renderWithLoader(SchedulerStyringPage, {
      schedulerStyring: { ...schedulerStyring, erAktiv: false },
      typeStyringer,
      audit,
    }),
}

export const AlleDeaktivert: Story = {
  render: () =>
    renderWithLoader(SchedulerStyringPage, {
      schedulerStyring: { ...schedulerStyring, erAktiv: false },
      typeStyringer: typeStyringer.map((k) => ({ ...k, erAktiv: false })),
      audit,
    }),
}

export const IngenAudit: Story = {
  render: () => renderWithLoader(SchedulerStyringPage, { schedulerStyring, typeStyringer, audit: [] }),
}
