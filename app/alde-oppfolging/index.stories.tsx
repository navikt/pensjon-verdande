import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import AldeOppfolging from './index'
import type {
  AldeBehandlingNavn,
  AldeFordelingKontrollpunktOverTidDto,
  AldeFordelingStatusMedAktivitet,
  AldeFordelingStatusOverTidDto,
} from './types'

const mockAldeStatusFordeling = [
  { status: 'FULLFORT', antall: 1250 },
  { status: 'UNDER_BEHANDLING', antall: 42 },
  { status: 'AVBRUTT', antall: 8 },
  { status: 'DEBUG', antall: 3 },
  { status: 'FEILENDE', antall: 5 },
  { status: 'STOPPET', antall: 2 },
]

const mockBehandlingFordeling = [
  { behandlingType: 'FleksibelApSak', antall: 980 },
  { behandlingType: 'FleksibelApSoknad', antall: 270 },
  { behandlingType: 'FleksibelApEndring', antall: 60 },
]

const mockAvbrutteBehandlinger = [
  { opprettet: '15.06.2024 10:30', begrunnelse: 'Manglende grunnlagsdata' },
  { opprettet: '14.06.2024 14:15', begrunnelse: 'Feil i inntektsopplysninger' },
  { opprettet: '13.06.2024 09:00', begrunnelse: 'Ugyldig samboerforhold' },
]

const mockAldeBehandlinger: AldeBehandlingNavn[] = [
  { friendlyName: 'Fleksibel AP (sak)', handlerName: 'FleksibelApSakHandler', behandlingType: 'FleksibelApSak' },
  {
    friendlyName: 'Fleksibel AP (søknad)',
    handlerName: 'FleksibelApSoknadHandler',
    behandlingType: 'FleksibelApSoknad',
  },
  {
    friendlyName: 'Fleksibel AP (endring)',
    handlerName: 'FleksibelApEndringHandler',
    behandlingType: 'FleksibelApEndring',
  },
]

const mockStatusfordelingOverTid: AldeFordelingStatusOverTidDto[] = [
  {
    dato: '2024-06-10',
    fordeling: [
      { status: 'FULLFORT', antall: 180 },
      { status: 'UNDER_BEHANDLING', antall: 10 },
    ],
  },
  {
    dato: '2024-06-11',
    fordeling: [
      { status: 'FULLFORT', antall: 200 },
      { status: 'UNDER_BEHANDLING', antall: 8 },
    ],
  },
  {
    dato: '2024-06-12',
    fordeling: [
      { status: 'FULLFORT', antall: 190 },
      { status: 'UNDER_BEHANDLING', antall: 12 },
      { status: 'AVBRUTT', antall: 3 },
    ],
  },
  {
    dato: '2024-06-13',
    fordeling: [
      { status: 'FULLFORT', antall: 210 },
      { status: 'UNDER_BEHANDLING', antall: 6 },
    ],
  },
  {
    dato: '2024-06-14',
    fordeling: [
      { status: 'FULLFORT', antall: 195 },
      { status: 'UNDER_BEHANDLING', antall: 4 },
      { status: 'FEILENDE', antall: 2 },
    ],
  },
  {
    dato: '2024-06-15',
    fordeling: [
      { status: 'FULLFORT', antall: 175 },
      { status: 'UNDER_BEHANDLING', antall: 2 },
    ],
  },
]

const mockKontrollpunktFordelingOverTid: AldeFordelingKontrollpunktOverTidDto = {
  fordeling: [
    { dato: '2024-06-10', data: [{ type: 'SAMBOER', antall: 5, enhet: 'stk' }] },
    { dato: '2024-06-11', data: [{ type: 'SAMBOER', antall: 8, enhet: 'stk' }] },
    { dato: '2024-06-12', data: [{ type: 'SAMBOER', antall: 3, enhet: 'stk' }] },
  ],
}

const mockStatusfordelingAldeAktiviteter: AldeFordelingStatusMedAktivitet[] = [
  { status: 'FULLFORT', aktivitet: 'HentGrunnlag', antall: 1200 },
  { status: 'FULLFORT', aktivitet: 'BeregnYtelse', antall: 1150 },
  { status: 'UNDER_BEHANDLING', aktivitet: 'HentGrunnlag', antall: 20 },
  { status: 'UNDER_BEHANDLING', aktivitet: 'BeregnYtelse', antall: 15 },
  { status: 'FEILENDE', aktivitet: 'IverksettVedtak', antall: 3 },
]

const meta: Meta = {
  title: 'Sider/ALDE-oppfølging',
  component: AldeOppfolging,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () =>
    renderWithLoader(AldeOppfolging, {
      avbrutteBehandlinger: mockAvbrutteBehandlinger,
      statusfordelingOverTid: mockStatusfordelingOverTid,
      aldeStatusFordeling: mockAldeStatusFordeling,
      behandlingFordeling: mockBehandlingFordeling,
      aldeBehandlinger: mockAldeBehandlinger,
      fomDato: '2024-06-10',
      tomDato: '2024-06-15',
      behandlingstype: 'FleksibelApSak',
      kontrollpunktFordelingOverTid: mockKontrollpunktFordelingOverTid,
      statusfordelingAldeAktiviteter: mockStatusfordelingAldeAktiviteter,
      nowIso: '2024-06-15T12:00:00.000Z',
    }),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(AldeOppfolging, {
      avbrutteBehandlinger: [],
      statusfordelingOverTid: [],
      aldeStatusFordeling: [],
      behandlingFordeling: [],
      aldeBehandlinger: mockAldeBehandlinger,
      fomDato: '2024-06-10',
      tomDato: '2024-06-15',
      behandlingstype: 'FleksibelApSak',
      kontrollpunktFordelingOverTid: { fordeling: [] },
      statusfordelingAldeAktiviteter: [],
      nowIso: '2024-06-15T12:00:00.000Z',
    }),
}
