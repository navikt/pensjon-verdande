/**
 * Storybook stories for the Behandlingsanalyse module.
 * Each story renders a tab component with mock data inside the analyse layout.
 */
import type { Meta, StoryObj } from '@storybook/react'
import { createRoutesStub } from 'react-router'
import AktiviteterTab from './aktiviteter'
import AktiviteterLayout from './aktiviteter-layout'
import AktivitetsvarighetTab from './aktivitetsvarighet'
import AlderspensjonLayout from './alderspensjon-layout'
import AutomatiseringTab from './automatisering'
import AutomatiseringLayout from './automatisering-layout'
import DimensjonerLayout from './dimensjoner-layout'
import EndeTilEndeTab from './ende-til-ende'
import FeilanalyseTab from './feilanalyse'
import GjenforsokTab from './gjenforsok'
import GruppeTab from './gruppe'
import KoTab from './ko'
import KontrollpunkterTab from './kontrollpunkter'
import KravtypeTab from './kravtype'
import KvalitetLayout from './kvalitet-layout'
import ManuelleTab from './manuelle'
import {
  mockAktivitetData,
  mockAktivitetsvarighetData,
  mockAlderspensjonMottakereData,
  mockAutomatiseringData,
  mockBehandlingKravAlderData,
  mockBehandlingstidPerTypeData,
  mockEndeTilEndeData,
  mockFeilanalyseData,
  mockFeilklassifiseringData,
  mockGjenforsokData,
  mockGruppeData,
  mockKoData,
  mockKontrollpunktData,
  mockKravStatistikkData,
  mockKravTidsserieData,
  mockKravtypeData,
  mockManuelleData,
  mockOppsummering,
  mockPlanlagtData,
  mockPrioritetData,
  mockRouteLoaderData,
  mockSaksbehandlingstidData,
  mockSakstypeData,
  mockStatustrendData,
  mockStoppetData,
  mockTeamytelseData,
  mockTidspunktData,
  mockVarighetData,
  mockVedtakstypeData,
} from './mocks'
import MottakereAlderTab from './mottakere-alder'
import Nokkeltall from './nokkeltall'
import PlanlagtTab from './planlagt'
import PrioritetTab from './prioritet'
import AnalyseLayout from './route'
import SakBehandlingKravAlderTab from './sak-behandling-krav-alder'
import SakBehandlingstidTab from './sak-behandlingstid'
import SakKravLayout from './sak-krav-layout'
import SakKravStatistikkTab from './sak-krav-statistikk'
import SakstypeTab from './sakstype'
import StatustrendTab from './statustrend'
import StoppetTab from './stoppet'
import TeamytelseTab from './teamytelse'
import TidspunktTab from './tidspunkt'
import VarighetTab from './varighet'
import VedtakstypeTab from './vedtakstype'
import YtelseLayout from './ytelse-layout'

const meta: Meta = {
  title: 'Sider/Analyse',
}

export default meta
type Story = StoryObj

const sectionLayouts: Record<string, { path: string; Component: React.ComponentType; loader?: () => unknown }> = {
  ytelse: { path: 'ytelse', Component: YtelseLayout },
  automatisering: { path: 'automatisering', Component: AutomatiseringLayout },
  kvalitet: { path: 'kvalitet', Component: KvalitetLayout },
  'aktiviteter-og-tid': { path: 'aktiviteter-og-tid', Component: AktiviteterLayout },
  'sak-krav': {
    path: 'sak-krav',
    // biome-ignore lint/suspicious/noExplicitAny: createRoutesStub type mismatch with react-router typed routes
    Component: SakKravLayout as any,
    loader: () => ({
      fom: '2026-01-01',
      tom: '2026-03-01',
      aggregering: 'MAANED',
      sakTyper: [],
      kravGjelderListe: [],
      behandlingstyper: [],
      kravTidsserie: mockKravTidsserieData(),
    }),
  },
  dimensjoner: { path: 'dimensjoner', Component: DimensjonerLayout },
}

const tabToSection: Record<string, { section: string; path: string }> = {
  nokkeltall: { section: 'ytelse', path: 'nokkeltall' },
  statustrend: { section: 'ytelse', path: 'statustrend' },
  varighet: { section: 'ytelse', path: 'varighet' },
  ko: { section: 'ytelse', path: 'ko' },
  'ende-til-ende': { section: 'ytelse', path: 'ende-til-ende' },
  oversikt: { section: 'automatisering', path: 'oversikt' },
  kontrollpunkter: { section: 'automatisering', path: 'kontrollpunkter' },
  manuelle: { section: 'automatisering', path: 'manuelle' },
  stoppet: { section: 'kvalitet', path: 'stoppet' },
  feilanalyse: { section: 'kvalitet', path: 'feilanalyse' },
  gjenforsok: { section: 'kvalitet', path: 'gjenforsok' },
  aktivitetsvarighet: { section: 'aktiviteter-og-tid', path: 'aktivitetsvarighet' },
  kalendertid: { section: 'aktiviteter-og-tid', path: 'kalendertid' },
  aktiviteter: { section: 'aktiviteter-og-tid', path: 'aktiviteter' },
  tidspunkt: { section: 'aktiviteter-og-tid', path: 'tidspunkt' },
  planlagt: { section: 'aktiviteter-og-tid', path: 'planlagt' },
  teamytelse: { section: 'dimensjoner', path: 'teamytelse' },
  prioritet: { section: 'dimensjoner', path: 'prioritet' },
  gruppe: { section: 'dimensjoner', path: 'gruppe' },
  sakstype: { section: 'dimensjoner', path: 'sakstype' },
  kravtype: { section: 'dimensjoner', path: 'kravtype' },
  vedtakstype: { section: 'dimensjoner', path: 'vedtakstype' },
  'auto-brev': { section: 'dimensjoner', path: 'auto-brev' },
  'sak-krav-statistikk': { section: 'sak-krav', path: 'krav' },
  'sak-behandlingstid': { section: 'sak-krav', path: 'behandlingstid' },
  'sak-behandling-krav-alder': { section: 'dimensjoner', path: 'behandling-krav-alder' },
}

// biome-ignore lint/suspicious/noExplicitAny: Route components have varying prop shapes
function renderAnalyseTab(TabComponent: React.ComponentType<any>, tabLoaderData: unknown, tabPath = 'nokkeltall') {
  const mapping = tabToSection[tabPath] || { section: 'ytelse', path: tabPath }
  const section = sectionLayouts[mapping.section]
  const Stub = createRoutesStub([
    {
      path: '/analyse',
      // biome-ignore lint/suspicious/noExplicitAny: createRoutesStub type mismatch with react-router typed routes
      Component: AnalyseLayout as any,
      loader: () => mockRouteLoaderData(),
      children: [
        {
          path: section.path,
          // biome-ignore lint/suspicious/noExplicitAny: createRoutesStub type mismatch with react-router typed routes
          Component: section.Component as any,
          ...(section.loader ? { loader: section.loader } : {}),
          children: [
            {
              path: mapping.path,
              Component: TabComponent,
              loader: () => tabLoaderData,
            },
          ],
        },
      ],
    },
  ])
  return (
    <Stub
      initialEntries={[
        `/analyse/${section.path}/${mapping.path}?behandlingType=FleksibelApSak&fom=2026-01-01&tom=2026-03-01&aggregering=UKE`,
      ]}
    />
  )
}

export const NokkeltallStory: Story = {
  name: 'Nøkkeltall',
  render: () => renderAnalyseTab(Nokkeltall, { oppsummering: mockOppsummering(), oppsummeringFeil: null }),
}

export const NokkeltallMedFeil: Story = {
  name: 'Nøkkeltall (med feil)',
  render: () =>
    renderAnalyseTab(Nokkeltall, {
      oppsummering: null,
      oppsummeringFeil: '504 – Gateway Timeout',
    }),
}

export const StatustrendStory: Story = {
  name: 'Statustrend',
  render: () => renderAnalyseTab(StatustrendTab, mockStatustrendData(), 'statustrend'),
}

export const VarighetStory: Story = {
  name: 'Varighet',
  render: () => renderAnalyseTab(VarighetTab, mockVarighetData(), 'varighet'),
}

export const AutomatiseringStory: Story = {
  name: 'Automatisering',
  render: () => renderAnalyseTab(AutomatiseringTab, mockAutomatiseringData(), 'oversikt'),
}

export const KoStory: Story = {
  name: 'Gjennomstrømning',
  render: () => renderAnalyseTab(KoTab, mockKoData(), 'ko'),
}

export const FeilanalyseStory: Story = {
  name: 'Feilanalyse',
  render: () =>
    renderAnalyseTab(
      FeilanalyseTab,
      { feil: mockFeilanalyseData(), klassifisering: mockFeilklassifiseringData() },
      'feilanalyse',
    ),
}

export const GjenforsokStory: Story = {
  name: 'Gjenforsøk',
  render: () => renderAnalyseTab(GjenforsokTab, mockGjenforsokData(), 'gjenforsok'),
}

export const AktivitetsvarighetStory: Story = {
  name: 'Flaskehals',
  render: () => renderAnalyseTab(AktivitetsvarighetTab, mockAktivitetsvarighetData(), 'aktivitetsvarighet'),
}

export const TidspunktStory: Story = {
  name: 'Tidspunkt',
  render: () => renderAnalyseTab(TidspunktTab, mockTidspunktData(), 'tidspunkt'),
}

export const TeamytelseStory: Story = {
  name: 'Team',
  render: () => renderAnalyseTab(TeamytelseTab, mockTeamytelseData(), 'teamytelse'),
}

export const PrioritetStory: Story = {
  name: 'Prioritet',
  render: () => renderAnalyseTab(PrioritetTab, mockPrioritetData(), 'prioritet'),
}

export const StoppetStory: Story = {
  name: 'Stoppede',
  render: () => renderAnalyseTab(StoppetTab, mockStoppetData(), 'stoppet'),
}

export const PlanlagtStory: Story = {
  name: 'Planlegging',
  render: () => renderAnalyseTab(PlanlagtTab, mockPlanlagtData(), 'planlagt'),
}

export const GruppeStory: Story = {
  name: 'Grupper',
  render: () => renderAnalyseTab(GruppeTab, mockGruppeData(), 'gruppe'),
}

export const SakstypeStory: Story = {
  name: 'Sakstype',
  render: () => renderAnalyseTab(SakstypeTab, mockSakstypeData(), 'sakstype'),
}

export const KravtypeStory: Story = {
  name: 'Kravtype',
  render: () => renderAnalyseTab(KravtypeTab, mockKravtypeData(), 'kravtype'),
}

export const VedtakstypeStory: Story = {
  name: 'Vedtak',
  render: () => renderAnalyseTab(VedtakstypeTab, mockVedtakstypeData(), 'vedtakstype'),
}

export const AktiviteterStory: Story = {
  name: 'Aktiviteter',
  render: () => renderAnalyseTab(AktiviteterTab, mockAktivitetData(), 'aktiviteter'),
}

export const ManuelleStory: Story = {
  name: 'Manuelle oppgaver',
  render: () => renderAnalyseTab(ManuelleTab, mockManuelleData(), 'manuelle'),
}

export const KontrollpunkterStory: Story = {
  name: 'Kontrollpunkter',
  render: () => renderAnalyseTab(KontrollpunkterTab, mockKontrollpunktData(), 'kontrollpunkter'),
}

export const EndeTilEndeStory: Story = {
  name: 'Ende-til-ende',
  render: () => renderAnalyseTab(EndeTilEndeTab, mockEndeTilEndeData(), 'ende-til-ende'),
}

// --- Sak & Krav ---

export const KravStatistikkStory: Story = {
  name: 'Kravstatistikk',
  render: () => renderAnalyseTab(SakKravStatistikkTab, mockKravStatistikkData(), 'sak-krav-statistikk'),
}

export const SakBehandlingstidStory: Story = {
  name: 'Saksbehandlingstid',
  render: () =>
    renderAnalyseTab(
      SakBehandlingstidTab,
      {
        tabell: mockSaksbehandlingstidData(),
        perTypeMottatt: mockBehandlingstidPerTypeData(),
        perTypeVedtak: mockBehandlingstidPerTypeData(),
        perAlderGruppeMottatt: mockBehandlingstidPerTypeData(),
        perAlderGruppeVedtak: mockBehandlingstidPerTypeData(),
        perAlderAarMottatt: mockBehandlingstidPerTypeData(),
        perAlderAarVedtak: mockBehandlingstidPerTypeData(),
      },
      'sak-behandlingstid',
    ),
}

export const BehandlingKravAlderStory: Story = {
  name: 'Behandling per alder',
  render: () => renderAnalyseTab(SakBehandlingKravAlderTab, mockBehandlingKravAlderData(), 'sak-behandling-krav-alder'),
}

// --- Alderspensjon ---

function renderAlderspensjonTab() {
  const Stub = createRoutesStub([
    {
      path: '/analyse/alderspensjon',
      // biome-ignore lint/suspicious/noExplicitAny: createRoutesStub type mismatch with react-router typed routes
      Component: AlderspensjonLayout as any,
      loader: () => ({ fom: '2024-01-01', tom: '2026-01-01', aggregering: 'MAANED' }),
      children: [
        {
          path: 'mottakere',
          // biome-ignore lint/suspicious/noExplicitAny: createRoutesStub type mismatch with react-router typed routes
          Component: MottakereAlderTab as any,
          loader: () => mockAlderspensjonMottakereData(),
        },
      ],
    },
  ])
  return <Stub initialEntries={['/analyse/alderspensjon/mottakere?fom=2024-01-01&tom=2026-01-01&aggregering=MAANED']} />
}

export const AlderspensjonMottakereStory: Story = {
  name: 'Alderspensjon — mottakere',
  render: renderAlderspensjonTab,
}
