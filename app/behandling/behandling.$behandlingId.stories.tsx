import type { Meta, StoryObj } from '@storybook/react'
import type { HalLinks } from '~/types'
import { mockBehandlingDto } from '../../.storybook/mocks/data'
import { renderWithLoader } from '../../.storybook/mocks/router'
import Behandling from './behandling.$behandlingId'

const link = { href: '#', type: 'POST' }

const baseLoaderData = {
  aldeBehandlingUrlTemplate: undefined,
  detaljertFremdrift: undefined,
  psakSakUrlTemplate: 'https://psak.intern.nav.no/sak/{sakId}',
}

const meta: Meta = {
  title: 'Sider/Behandling',
  component: Behandling,
}

export default meta
type Story = StoryObj

type KnappControls = {
  fortsett: boolean
  godkjennOpprettelse: boolean
  bekreftStoppBehandling: boolean
  fortsettAvhengigeBehandlinger: boolean
  endrePlanlagtStartet: boolean
  fjernFraDebug: boolean
  taTilDebug: boolean
  sendOppdragPaNytt: boolean
  stopp: boolean
  sendTilManuellMedKontrollpunkt: boolean
  kjorLokalt: boolean
  behandlingserie: boolean
  planlagtStartet: boolean
}

function buildLinks(args: KnappControls): HalLinks {
  const links: HalLinks = {}
  if (args.fortsett) links.fortsett = link
  if (args.godkjennOpprettelse) links.godkjennOpprettelse = link
  if (args.bekreftStoppBehandling) links.bekreftStoppBehandling = link
  if (args.fortsettAvhengigeBehandlinger) {
    links.fortsettAvhengigeBehandlinger = link
    links.avhengigeBehandlinger = link
  }
  if (args.fjernFraDebug) links.fjernFraDebug = link
  if (args.taTilDebug) links.taTilDebug = link
  if (args.sendOppdragPaNytt) links.sendOppdragsmeldingPaNytt = link
  if (args.stopp) links.stopp = link
  if (args.sendTilManuellMedKontrollpunkt) links.sendTilManuellMedKontrollpunkt = link
  if (args.kjorLokalt) links.runBehandling = link
  return links
}

export const Interaktiv: StoryObj<KnappControls> = {
  name: 'Interaktiv (Controls)',
  args: {
    fortsett: false,
    godkjennOpprettelse: false,
    bekreftStoppBehandling: false,
    fortsettAvhengigeBehandlinger: false,
    endrePlanlagtStartet: false,
    fjernFraDebug: false,
    taTilDebug: false,
    sendOppdragPaNytt: false,
    stopp: true,
    sendTilManuellMedKontrollpunkt: false,
    kjorLokalt: false,
    behandlingserie: false,
    planlagtStartet: false,
  },
  argTypes: {
    fortsett: { control: 'boolean', name: 'Fortsett' },
    godkjennOpprettelse: { control: 'boolean', name: 'Godkjenn opprettelse' },
    bekreftStoppBehandling: { control: 'boolean', name: 'Bekreft oppfølging' },
    fortsettAvhengigeBehandlinger: { control: 'boolean', name: 'Fortsett avhengige' },
    endrePlanlagtStartet: { control: 'boolean', name: 'Endre planlagt startet' },
    fjernFraDebug: { control: 'boolean', name: 'Fjern fra debug' },
    taTilDebug: { control: 'boolean', name: 'Ta til debug' },
    sendOppdragPaNytt: { control: 'boolean', name: 'Send oppdrag på nytt' },
    stopp: { control: 'boolean', name: 'Stopp behandling' },
    sendTilManuellMedKontrollpunkt: { control: 'boolean', name: 'Send til manuell' },
    kjorLokalt: { control: 'boolean', name: 'Kjør lokalt' },
    behandlingserie: { control: 'boolean', name: 'Gå til behandlingserie' },
    planlagtStartet: { control: 'boolean', name: 'Har planlagt startet-tidspunkt' },
  },
  render: (args) =>
    renderWithLoader(Behandling, {
      ...baseLoaderData,
      behandling: mockBehandlingDto({
        status: 'UNDER_BEHANDLING',
        planlagtStartet: args.planlagtStartet ? '2024-12-01T08:00:00' : null,
        behandlingKjoringer: args.endrePlanlagtStartet ? [] : [{ kjoringId: 1 } as any],
        behandlingSerieId: args.behandlingserie ? 'serie-123' : null,
        muligeKontrollpunkt: args.sendTilManuellMedKontrollpunkt
          ? [
              { kontrollpunkt: 'KP001', decode: 'Kontroller inntektsgrunnlag' },
              { kontrollpunkt: 'KP002', decode: 'Kontroller trygdetid' },
            ]
          : [],
        _links: buildLinks(args),
      }),
    }),
}

export const Default: Story = {
  render: () =>
    renderWithLoader(Behandling, {
      ...baseLoaderData,
      behandling: mockBehandlingDto({
        behandlingId: 100001,
        type: 'ForstegangsbehandlingAlder',
        status: 'UNDER_BEHANDLING',
        fnr: '12345678901',
        sakId: 50001,
        kravId: 60001,
        ansvarligTeam: 'Team Pensjon',
      }),
    }),
}

export const Fullfort: Story = {
  render: () =>
    renderWithLoader(Behandling, {
      ...baseLoaderData,
      behandling: mockBehandlingDto({
        behandlingId: 100002,
        type: 'Omregning',
        status: 'FULLFORT',
        ferdig: '2024-06-15T12:30:00',
        fnr: '98765432100',
        sakId: 50002,
      }),
    }),
}

export const MedAlleKnapper: Story = {
  name: 'Alle knapper synlige',
  render: () =>
    renderWithLoader(Behandling, {
      ...baseLoaderData,
      behandling: mockBehandlingDto({
        status: 'UNDER_BEHANDLING',
        planlagtStartet: null,
        behandlingSerieId: 'serie-123',
        behandlingKjoringer: [],
        muligeKontrollpunkt: [{ kontrollpunkt: 'KP001', decode: 'Kontroller inntektsgrunnlag' }],
        _links: {
          fortsett: link,
          godkjennOpprettelse: link,
          bekreftStoppBehandling: link,
          fortsettAvhengigeBehandlinger: link,
          avhengigeBehandlinger: link,
          fjernFraDebug: link,
          sendOppdragsmeldingPaNytt: link,
          stopp: link,
          sendTilManuellMedKontrollpunkt: link,
          runBehandling: link,
        },
      }),
    }),
}
