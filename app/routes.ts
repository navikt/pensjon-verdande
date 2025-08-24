import { type RouteConfig } from '@react-router/dev/routes'

export default [
  {
    id: 'routes/opptjening.manedlig.omregning.kategoriserBruker',
    file: 'routes/opptjening.manedlig.omregning.kategoriserBruker.tsx',
    path: 'opptjening/manedlig/omregning/kategoriserBruker',
  },
  {
    id: 'routes/opptjening.manedlig.omregning.uttrekk',
    file: 'routes/opptjening.manedlig.omregning.uttrekk.tsx',
    path: 'opptjening/manedlig/omregning/uttrekk',
  },
  {
    id: 'routes/aktivitet.$behandlingId.$aktivitetId',
    file: 'routes/aktivitet.$behandlingId.$aktivitetId.tsx',
    path: 'aktivitet/:behandlingId/:aktivitetId',
  },
  {
    id: 'routes/opptjening.manedlig.omregning._index',
    file: 'routes/opptjening.manedlig.omregning._index.tsx',
    path: 'opptjening/manedlig/omregning',
  },
  {
    id: 'routes/bestem-etteroppgjor-resultat._index',
    file: 'routes/bestem-etteroppgjor-resultat._index.tsx',
    path: 'bestem-etteroppgjor-resultat',
  },
  {
    id: 'routes/oppdatersakstatus.oppdatersakstatus',
    file: 'routes/oppdatersakstatus.oppdatersakstatus.tsx',
    path: 'oppdatersakstatus/oppdatersakstatus',
  },
  {
    id: 'routes/opptjening.kategoriserBruker._index',
    file: 'routes/opptjening.kategoriserBruker._index.tsx',
    path: 'opptjening/kategoriserBruker',
    index: true,
  },
  {
    id: 'routes/opptjening.arlig.omregning.uttrekk',
    file: 'routes/opptjening.arlig.omregning.uttrekk.tsx',
    path: 'opptjening/arlig/omregning/uttrekk',
  },
  {
    id: 'routes/opptjening.manedlig.uttrekk._index',
    file: 'routes/opptjening.manedlig.uttrekk._index.tsx',
    path: 'opptjening/manedlig/uttrekk',
    index: true,
  },
  {
    id: 'routes/opptjening.arlig.omregning._index',
    file: 'routes/opptjening.arlig.omregning._index.tsx',
    path: 'opptjening/arlig/omregning',
    index: true,
  },
  {
    id: 'routes/batch.inntektskontroll.opprett',
    file: 'routes/batch.inntektskontroll.opprett.tsx',
    path: 'batch/inntektskontroll/opprett',
  },
  {
    id: 'routes/lever-samboeropplysning._index',
    file: 'routes/lever-samboeropplysning._index.tsx',
    path: 'lever-samboeropplysning',
    index: true,
  },
  {
    id: 'routes/batch.inntektskontroll._index',
    file: 'routes/batch.inntektskontroll._index.tsx',
    path: 'batch/inntektskontroll',
    index: true,
  },
  {
    id: 'routes/manglende-foreign-key-indexer',
    file: 'routes/manglende-foreign-key-indexer.tsx',
    path: 'manglende-foreign-key-indexer',
  },
  {
    id: 'routes/leveattester-sokos-spkmottak',
    file: 'routes/leveattester-sokos-spkmottak.tsx',
    path: 'leveattester-sokos-spkmottak',
  },
  {
    id: 'routes/omregningStatistikk._index',
    file: 'routes/omregningStatistikk._index.tsx',
    path: 'omregningStatistikk',
    index: true,
  },
  {
    id: 'routes/behandling.$behandlingId',
    file: 'routes/behandling.$behandlingId.tsx',
    path: 'behandling/:behandlingId',
    children: [
      {
        id: 'routes/behandling.$behandlingId.sendTilManuellMedKontrollpunkt',
        file: 'routes/behandling.$behandlingId.sendTilManuellMedKontrollpunkt.tsx',
        path: 'sendTilManuellMedKontrollpunkt',
      },
      {
        id: 'routes/behandling.$behandlingId.fortsettAvhengigeBehandlinger',
        file: 'routes/behandling.$behandlingId.fortsettAvhengigeBehandlinger.tsx',
        path: 'fortsettAvhengigeBehandlinger',
      },
      {
        id: 'routes/behandling.$behandlingId.behandlingManuellOpptelling',
        file: 'routes/behandling.$behandlingId.behandlingManuellOpptelling.tsx',
        path: 'behandlingManuellOpptelling',
      },
      {
        id: 'routes/behandling.$behandlingId.ikkeFullforteAktiviteter',
        file: 'routes/behandling.$behandlingId.ikkeFullforteAktiviteter.tsx',
        path: 'ikkeFullforteAktiviteter',
      },
      {
        id: 'routes/behandling.$behandlingId.avhengigeBehandlinger',
        file: 'routes/behandling.$behandlingId.avhengigeBehandlinger.tsx',
        path: 'avhengigeBehandlinger',
        children: [
          {
            id: 'routes/behandling.$behandlingId.avhengigeBehandlinger.fortsett',
            file: 'routes/behandling.$behandlingId.avhengigeBehandlinger.fortsett.tsx',
            path: 'fortsett',
          },
        ],
      },
      {
        id: 'routes/behandling.$behandlingId.oppdaterAnsvarligTeam',
        file: 'routes/behandling.$behandlingId.oppdaterAnsvarligTeam.tsx',
        path: 'oppdaterAnsvarligTeam',
      },
      {
        id: 'routes/behandling.$behandlingId.sendTilOppdragPaNytt',
        file: 'routes/behandling.$behandlingId.sendTilOppdragPaNytt.tsx',
        path: 'sendTilOppdragPaNytt',
      },
      {
        id: 'routes/behandling.$behandlingId.oppdragskvittering',
        file: 'routes/behandling.$behandlingId.oppdragskvittering.tsx',
        path: 'oppdragskvittering',
      },
      {
        id: 'routes/behandling.$behandlingId.manuelleOppgaver',
        file: 'routes/behandling.$behandlingId.manuelleOppgaver.tsx',
        path: 'manuelleOppgaver',
      },
      {
        id: 'routes/behandling.$behandlingId.oppdragsmelding',
        file: 'routes/behandling.$behandlingId.oppdragsmelding.tsx',
        path: 'oppdragsmelding',
      },
      {
        id: 'routes/behandling.$behandlingId.fjernFraDebug',
        file: 'routes/behandling.$behandlingId.fjernFraDebug.tsx',
        path: 'fjernFraDebug',
      },
      {
        id: 'routes/behandling.$behandlingId.runBehandling',
        file: 'routes/behandling.$behandlingId.runBehandling.tsx',
        path: 'runBehandling',
      },
      {
        id: 'routes/behandling.$behandlingId.aktiviteter',
        file: 'routes/behandling.$behandlingId.aktiviteter.tsx',
        path: 'aktiviteter',
      },
      {
        id: 'routes/behandling.$behandlingId.taTilDebug',
        file: 'routes/behandling.$behandlingId.taTilDebug.tsx',
        path: 'taTilDebug',
      },
      {
        id: 'routes/behandling.$behandlingId.fortsett',
        file: 'routes/behandling.$behandlingId.fortsett.tsx',
        path: 'fortsett',
      },
      {
        id: 'routes/behandling.$behandlingId._index',
        file: 'routes/behandling.$behandlingId._index.tsx',
        index: true,
      },
      {
        id: 'routes/behandling.$behandlingId.output',
        file: 'routes/behandling.$behandlingId.output.tsx',
        path: 'output',
      },
      {
        id: 'routes/behandling.$behandlingId.input',
        file: 'routes/behandling.$behandlingId.input.tsx',
        path: 'input',
      },
      {
        id: 'routes/behandling.$behandlingId.stopp',
        file: 'routes/behandling.$behandlingId.stopp.tsx',
        path: 'stopp',
      },
    ],
  },
  {
    id: 'routes/omregning.omregningsaker',
    file: 'routes/omregning.omregningsaker.tsx',
    path: 'omregning/omregningsaker',
  },
  {
    id: 'routes/oppdatersakstatus._index',
    file: 'routes/oppdatersakstatus._index.tsx',
    path: 'oppdatersakstatus',
    index: true,
  },
  {
    id: 'routes/aldersovergang.opprett',
    file: 'routes/aldersovergang.opprett.tsx',
    path: 'aldersovergang/opprett',
  },
  {
    id: 'routes/omregning.behandlinger',
    file: 'routes/omregning.behandlinger.tsx',
    path: 'omregning/behandlinger',
  },
  {
    id: 'routes/aldersovergang._index',
    file: 'routes/aldersovergang._index.tsx',
    path: 'aldersovergang',
    index: true,
  },
  {
    id: 'routes/batch-opprett._index',
    file: 'routes/batch-opprett._index.tsx',
    path: 'batch-opprett',
    index: true,
  },
  {
    id: 'routes/behandlinger.$status',
    file: 'routes/behandlinger.$status.tsx',
    path: 'behandlinger/:status',
    children: [
      {
        id: 'routes/behandlinger.$status.fortsett',
        file: 'routes/behandlinger.$status.fortsett.tsx',
        path: 'fortsett',
      },
    ],
  },
  {
    id: 'routes/adhocbrev.adhocbrev',
    file: 'routes/adhocbrev.adhocbrev.tsx',
    path: 'adhocbrev/adhocbrev',
  },
  {
    id: 'routes/behandlinger._index',
    file: 'routes/behandlinger._index.tsx',
    path: 'behandlinger',
    index: true,
  },
  {
    id: 'routes/brukere.$brukernavn',
    file: 'routes/brukere.$brukernavn/route.tsx',
    path: 'brukere/:brukernavn',
  },
  {
    id: 'routes/omregning.omregning',
    file: 'routes/omregning.omregning.tsx',
    path: 'omregning/omregning',
  },
  {
    id: 'routes/batch.reguleringv2',
    file: 'routes/batch.reguleringv2.tsx',
    path: 'batch/reguleringv2',
    children: [
      {
        id: 'routes/batch.reguleringv2.administrerbehandlinger',
        file: 'routes/batch.reguleringv2.administrerbehandlinger.tsx',
        path: 'administrerbehandlinger',
        children: [
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId.tsx',
            path: 'hentTotaloversiktBehandlinger/:behandlingId',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling.tsx',
            path: 'fortsettFamilieReguleringerTilBehandling',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer.tsx',
            path: 'fortsettFeilendeFamilieReguleringer',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak.tsx',
            path: 'fortsettFeilendeIverksettVedtak',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus.tsx',
            path: 'fortsettFaktoromregningsmodus',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus.tsx',
            path: 'fortsettFeilhandteringmodus',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser.tsx',
            path: 'fortsettNyAvviksgrenser',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser.tsx',
            path: 'oppdaterAvviksgrenser',
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.hentStatistikk',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.hentStatistikk.tsx',
            path: 'hentStatistikk',
          },
        ],
      },
      {
        id: 'routes/batch.reguleringv2.avsluttendeaktiviteter',
        file: 'routes/batch.reguleringv2.avsluttendeaktiviteter.tsx',
        path: 'avsluttendeaktiviteter',
      },
      {
        id: 'routes/batch.reguleringv2.ekskludertesaker',
        file: 'routes/batch.reguleringv2.ekskludertesaker.tsx',
        path: 'ekskludertesaker',
      },
      {
        id: 'routes/batch.reguleringv2.orkestrering',
        file: 'routes/batch.reguleringv2.orkestrering.tsx',
        path: 'orkestrering',
        children: [
          {
            id: 'routes/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId.tsx',
            path: 'hentOrkestreringStatistikk/:behandlingId',
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger',
            file: 'routes/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger.tsx',
            path: 'hentAggregerteFeilmeldinger',
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.fortsett.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.fortsett.$behandlingId.tsx',
            path: 'fortsett/:behandlingId',
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.pause.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.pause.$behandlingId.tsx',
            path: 'pause/:behandlingId',
          },
        ],
      },
      {
        id: 'routes/batch.reguleringv2.uttrekk',
        file: 'routes/batch.reguleringv2.uttrekk.tsx',
        path: 'uttrekk',
        children: [
          {
            id: 'routes/batch.reguleringv2.uttrekk.startUttrekk',
            file: 'routes/batch.reguleringv2.uttrekk.startUttrekk.tsx',
            path: 'startUttrekk',
          },
        ],
      },
    ],
  },
  {
    id: 'routes/adhocbrev._index',
    file: 'routes/adhocbrev._index.tsx',
    path: 'adhocbrev',
    index: true,
  },
  {
    id: 'routes/afp-etteroppgjor',
    file: 'routes/afp-etteroppgjor/route.tsx',
    path: 'afp-etteroppgjor',
    children: [
      {
        id: 'routes/afp-etteroppgjor.start',
        file: 'routes/afp-etteroppgjor.start/route.tsx',
        path: 'start',
      },
    ],
  },
  {
    id: 'routes/batch.regulering',
    file: 'routes/batch.regulering.tsx',
    path: 'batch/regulering',
  },
  {
    id: 'routes/omregning._index',
    file: 'routes/omregning._index.tsx',
    path: 'omregning',
    index: true,
  },
  {
    id: 'routes/bpen090.bpen090',
    file: 'routes/bpen090.bpen090.tsx',
    path: 'bpen090/bpen090',
  },
  {
    id: 'routes/bpen091.bpen091',
    file: 'routes/bpen091.bpen091.tsx',
    path: 'bpen091/bpen091',
  },
  {
    id: 'routes/bpen096.bpen096',
    file: 'routes/bpen096.bpen096.tsx',
    path: 'bpen096/bpen096',
  },
  {
    id: 'routes/auth.microsoft',
    file: 'routes/auth.microsoft.tsx',
    path: 'auth/microsoft',
  },
  {
    id: 'routes/bpen090._index',
    file: 'routes/bpen090._index.tsx',
    path: 'bpen090',
    index: true,
  },
  {
    id: 'routes/bpen091._index',
    file: 'routes/bpen091._index.tsx',
    path: 'bpen091',
    index: true,
  },
  {
    id: 'routes/bpen096._index',
    file: 'routes/bpen096._index.tsx',
    path: 'bpen096',
    index: true,
  },
  {
    id: 'routes/brukere._index',
    file: 'routes/brukere._index/route.tsx',
    path: 'brukere',
    index: true,
  },
  {
    id: 'routes/auth.callback',
    file: 'routes/auth.callback.tsx',
    path: 'auth/callback',
  },
  {
    id: 'routes/laaste-vedtak',
    file: 'routes/laaste-vedtak.tsx',
    path: 'laaste-vedtak',
    children: [
      {
        id: 'routes/laaste-vedtak.bekreftOppdragsmeldingManuelt',
        file: 'routes/laaste-vedtak.bekreftOppdragsmeldingManuelt.tsx',
        path: 'bekreftOppdragsmeldingManuelt',
      },
      {
        id: 'routes/laaste-vedtak.hentVedtakIOppdrag.$vedtakId',
        file: 'routes/laaste-vedtak.hentVedtakIOppdrag.$vedtakId.tsx',
        path: 'hentVedtakIOppdrag/:vedtakId',
      },
      {
        id: 'routes/laaste-vedtak.oppdaterKanIverksettes',
        file: 'routes/laaste-vedtak.oppdaterKanIverksettes.tsx',
        path: 'oppdaterKanIverksettes',
      },
      {
        id: 'routes/laaste-vedtak.oppdaterAksjonspunkt',
        file: 'routes/laaste-vedtak.oppdaterAksjonspunkt.tsx',
        path: 'oppdaterAksjonspunkt',
      },
      {
        id: 'routes/laaste-vedtak.oppdaterKommentar',
        file: 'routes/laaste-vedtak.oppdaterKommentar.tsx',
        path: 'oppdaterKommentar',
      },
      {
        id: 'routes/laaste-vedtak.uttrekkStatus',
        file: 'routes/laaste-vedtak.uttrekkStatus.tsx',
        path: 'uttrekkStatus',
      },
      {
        id: 'routes/laaste-vedtak.oppdaterTeam',
        file: 'routes/laaste-vedtak.oppdaterTeam.tsx',
        path: 'oppdaterTeam',
      },
      {
        id: 'routes/laaste-vedtak.runUttrekk',
        file: 'routes/laaste-vedtak.runUttrekk.tsx',
        path: 'runUttrekk',
      },
      {
        id: 'routes/laaste-vedtak.laasOpp',
        file: 'routes/laaste-vedtak.laasOpp.tsx',
        path: 'laasOpp',
      },
    ],
  },
  {
    id: 'routes/linke-dnr-fnr',
    file: 'routes/linke-dnr-fnr.tsx',
    path: 'linke-dnr-fnr',
  },
  {
    id: 'routes/laas-opp-sak',
    file: 'routes/laas-opp-sak.tsx',
    path: 'laas-opp-sak',
    children: [
      {
        id: 'routes/laas-opp-sak.settTilManuell',
        file: 'routes/laas-opp-sak.settTilManuell.tsx',
        path: 'settTilManuell',
      },
      {
        id: 'routes/laas-opp-sak.hentSak',
        file: 'routes/laas-opp-sak.hentSak.tsx',
        path: 'hentSak',
      },
      {
        id: 'routes/laas-opp-sak.laasOpp',
        file: 'routes/laas-opp-sak.laasOpp.tsx',
        path: 'laasOpp',
      },
    ],
  },
  {
    id: 'routes/auth.failed',
    file: 'routes/auth.failed.tsx',
    path: 'auth/failed',
  },
  {
    id: 'routes/infobanner',
    file: 'routes/infobanner.tsx',
    path: 'infobanner',
  },
  {
    id: 'routes/dashboard',
    file: 'routes/dashboard/route.tsx',
    path: 'dashboard',
  },
  {
    id: 'routes/kalender',
    file: 'routes/kalender/route.tsx',
    path: 'kalender',
  },
  {
    id: 'routes/batcher',
    file: 'routes/batcher.tsx',
    path: 'batcher',
  },
  {
    id: 'routes/_index',
    file: 'routes/_index.tsx',
    index: true,
  },
  {
    id: 'routes/sok',
    file: 'routes/sok.tsx',
    path: 'sok',
  },
] satisfies RouteConfig
