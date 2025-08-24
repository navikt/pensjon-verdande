import { type RouteConfig } from "@react-router/dev/routes";

export default [
  {
    id: 'routes/opptjening.manedlig.omregning.kategoriserBruker',
    file: 'routes/opptjening.manedlig.omregning.kategoriserBruker.tsx',
    path: 'opptjening/manedlig/omregning/kategoriserBruker',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.manedlig.omregning.uttrekk',
    file: 'routes/opptjening.manedlig.omregning.uttrekk.tsx',
    path: 'opptjening/manedlig/omregning/uttrekk',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/aktivitet.$behandlingId.$aktivitetId',
    file: 'routes/aktivitet.$behandlingId.$aktivitetId.tsx',
    path: 'aktivitet/:behandlingId/:aktivitetId',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.manedlig.omregning._index',
    file: 'routes/opptjening.manedlig.omregning._index.tsx',
    path: 'opptjening/manedlig/omregning',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/bestem-etteroppgjor-resultat._index',
    file: 'routes/bestem-etteroppgjor-resultat._index.tsx',
    path: 'bestem-etteroppgjor-resultat',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/oppdatersakstatus.oppdatersakstatus',
    file: 'routes/oppdatersakstatus.oppdatersakstatus.tsx',
    path: 'oppdatersakstatus/oppdatersakstatus',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.kategoriserBruker._index',
    file: 'routes/opptjening.kategoriserBruker._index.tsx',
    path: 'opptjening/kategoriserBruker',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.arlig.omregning.uttrekk',
    file: 'routes/opptjening.arlig.omregning.uttrekk.tsx',
    path: 'opptjening/arlig/omregning/uttrekk',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.manedlig.uttrekk._index',
    file: 'routes/opptjening.manedlig.uttrekk._index.tsx',
    path: 'opptjening/manedlig/uttrekk',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/opptjening.arlig.omregning._index',
    file: 'routes/opptjening.arlig.omregning._index.tsx',
    path: 'opptjening/arlig/omregning',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/batch.inntektskontroll.opprett',
    file: 'routes/batch.inntektskontroll.opprett.tsx',
    path: 'batch/inntektskontroll/opprett',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/lever-samboeropplysning._index',
    file: 'routes/lever-samboeropplysning._index.tsx',
    path: 'lever-samboeropplysning',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/batch.inntektskontroll._index',
    file: 'routes/batch.inntektskontroll._index.tsx',
    path: 'batch/inntektskontroll',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/manglende-foreign-key-indexer',
    file: 'routes/manglende-foreign-key-indexer.tsx',
    path: 'manglende-foreign-key-indexer',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/leveattester-sokos-spkmottak',
    file: 'routes/leveattester-sokos-spkmottak.tsx',
    path: 'leveattester-sokos-spkmottak',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/omregningStatistikk._index',
    file: 'routes/omregningStatistikk._index.tsx',
    path: 'omregningStatistikk',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/behandling.$behandlingId',
    file: 'routes/behandling.$behandlingId.tsx',
    path: 'behandling/:behandlingId',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/behandling.$behandlingId.sendTilManuellMedKontrollpunkt',
        file: 'routes/behandling.$behandlingId.sendTilManuellMedKontrollpunkt.tsx',
        path: 'sendTilManuellMedKontrollpunkt',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.fortsettAvhengigeBehandlinger',
        file: 'routes/behandling.$behandlingId.fortsettAvhengigeBehandlinger.tsx',
        path: 'fortsettAvhengigeBehandlinger',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.behandlingManuellOpptelling',
        file: 'routes/behandling.$behandlingId.behandlingManuellOpptelling.tsx',
        path: 'behandlingManuellOpptelling',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.ikkeFullforteAktiviteter',
        file: 'routes/behandling.$behandlingId.ikkeFullforteAktiviteter.tsx',
        path: 'ikkeFullforteAktiviteter',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.avhengigeBehandlinger',
        file: 'routes/behandling.$behandlingId.avhengigeBehandlinger.tsx',
        path: 'avhengigeBehandlinger',
        index: undefined,
        caseSensitive: undefined,
        children: [
          {
            id: 'routes/behandling.$behandlingId.avhengigeBehandlinger.fortsett',
            file: 'routes/behandling.$behandlingId.avhengigeBehandlinger.fortsett.tsx',
            path: 'fortsett',
            index: undefined,
            caseSensitive: undefined
          }
        ]
      },
      {
        id: 'routes/behandling.$behandlingId.oppdaterAnsvarligTeam',
        file: 'routes/behandling.$behandlingId.oppdaterAnsvarligTeam.tsx',
        path: 'oppdaterAnsvarligTeam',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.sendTilOppdragPaNytt',
        file: 'routes/behandling.$behandlingId.sendTilOppdragPaNytt.tsx',
        path: 'sendTilOppdragPaNytt',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.oppdragskvittering',
        file: 'routes/behandling.$behandlingId.oppdragskvittering.tsx',
        path: 'oppdragskvittering',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.manuelleOppgaver',
        file: 'routes/behandling.$behandlingId.manuelleOppgaver.tsx',
        path: 'manuelleOppgaver',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.oppdragsmelding',
        file: 'routes/behandling.$behandlingId.oppdragsmelding.tsx',
        path: 'oppdragsmelding',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.fjernFraDebug',
        file: 'routes/behandling.$behandlingId.fjernFraDebug.tsx',
        path: 'fjernFraDebug',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.runBehandling',
        file: 'routes/behandling.$behandlingId.runBehandling.tsx',
        path: 'runBehandling',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.aktiviteter',
        file: 'routes/behandling.$behandlingId.aktiviteter.tsx',
        path: 'aktiviteter',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.taTilDebug',
        file: 'routes/behandling.$behandlingId.taTilDebug.tsx',
        path: 'taTilDebug',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.fortsett',
        file: 'routes/behandling.$behandlingId.fortsett.tsx',
        path: 'fortsett',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId._index',
        file: 'routes/behandling.$behandlingId._index.tsx',
        path: undefined,
        index: true,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.output',
        file: 'routes/behandling.$behandlingId.output.tsx',
        path: 'output',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.input',
        file: 'routes/behandling.$behandlingId.input.tsx',
        path: 'input',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/behandling.$behandlingId.stopp',
        file: 'routes/behandling.$behandlingId.stopp.tsx',
        path: 'stopp',
        index: undefined,
        caseSensitive: undefined
      }
    ]
  },
  {
    id: 'routes/omregning.omregningsaker',
    file: 'routes/omregning.omregningsaker.tsx',
    path: 'omregning/omregningsaker',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/oppdatersakstatus._index',
    file: 'routes/oppdatersakstatus._index.tsx',
    path: 'oppdatersakstatus',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/aldersovergang.opprett',
    file: 'routes/aldersovergang.opprett.tsx',
    path: 'aldersovergang/opprett',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/omregning.behandlinger',
    file: 'routes/omregning.behandlinger.tsx',
    path: 'omregning/behandlinger',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/aldersovergang._index',
    file: 'routes/aldersovergang._index.tsx',
    path: 'aldersovergang',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/batch-opprett._index',
    file: 'routes/batch-opprett._index.tsx',
    path: 'batch-opprett',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/behandlinger.$status',
    file: 'routes/behandlinger.$status.tsx',
    path: 'behandlinger/:status',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/behandlinger.$status.fortsett',
        file: 'routes/behandlinger.$status.fortsett.tsx',
        path: 'fortsett',
        index: undefined,
        caseSensitive: undefined
      }
    ]
  },
  {
    id: 'routes/adhocbrev.adhocbrev',
    file: 'routes/adhocbrev.adhocbrev.tsx',
    path: 'adhocbrev/adhocbrev',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/behandlinger._index',
    file: 'routes/behandlinger._index.tsx',
    path: 'behandlinger',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/brukere.$brukernavn',
    file: 'routes/brukere.$brukernavn/route.tsx',
    path: 'brukere/:brukernavn',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/omregning.omregning',
    file: 'routes/omregning.omregning.tsx',
    path: 'omregning/omregning',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/batch.reguleringv2',
    file: 'routes/batch.reguleringv2.tsx',
    path: 'batch/reguleringv2',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/batch.reguleringv2.administrerbehandlinger',
        file: 'routes/batch.reguleringv2.administrerbehandlinger.tsx',
        path: 'administrerbehandlinger',
        index: undefined,
        caseSensitive: undefined,
        children: [
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId.tsx',
            path: 'hentTotaloversiktBehandlinger/:behandlingId',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling.tsx',
            path: 'fortsettFamilieReguleringerTilBehandling',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer.tsx',
            path: 'fortsettFeilendeFamilieReguleringer',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak.tsx',
            path: 'fortsettFeilendeIverksettVedtak',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus.tsx',
            path: 'fortsettFaktoromregningsmodus',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus.tsx',
            path: 'fortsettFeilhandteringmodus',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser.tsx',
            path: 'fortsettNyAvviksgrenser',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser.tsx',
            path: 'oppdaterAvviksgrenser',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.administrerbehandlinger.hentStatistikk',
            file: 'routes/batch.reguleringv2.administrerbehandlinger.hentStatistikk.tsx',
            path: 'hentStatistikk',
            index: undefined,
            caseSensitive: undefined
          }
        ]
      },
      {
        id: 'routes/batch.reguleringv2.avsluttendeaktiviteter',
        file: 'routes/batch.reguleringv2.avsluttendeaktiviteter.tsx',
        path: 'avsluttendeaktiviteter',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/batch.reguleringv2.ekskludertesaker',
        file: 'routes/batch.reguleringv2.ekskludertesaker.tsx',
        path: 'ekskludertesaker',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/batch.reguleringv2.orkestrering',
        file: 'routes/batch.reguleringv2.orkestrering.tsx',
        path: 'orkestrering',
        index: undefined,
        caseSensitive: undefined,
        children: [
          {
            id: 'routes/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId.tsx',
            path: 'hentOrkestreringStatistikk/:behandlingId',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger',
            file: 'routes/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger.tsx',
            path: 'hentAggregerteFeilmeldinger',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.fortsett.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.fortsett.$behandlingId.tsx',
            path: 'fortsett/:behandlingId',
            index: undefined,
            caseSensitive: undefined
          },
          {
            id: 'routes/batch.reguleringv2.orkestrering.pause.$behandlingId',
            file: 'routes/batch.reguleringv2.orkestrering.pause.$behandlingId.tsx',
            path: 'pause/:behandlingId',
            index: undefined,
            caseSensitive: undefined
          }
        ]
      },
      {
        id: 'routes/batch.reguleringv2.uttrekk',
        file: 'routes/batch.reguleringv2.uttrekk.tsx',
        path: 'uttrekk',
        index: undefined,
        caseSensitive: undefined,
        children: [
          {
            id: 'routes/batch.reguleringv2.uttrekk.startUttrekk',
            file: 'routes/batch.reguleringv2.uttrekk.startUttrekk.tsx',
            path: 'startUttrekk',
            index: undefined,
            caseSensitive: undefined
          }
        ]
      }
    ]
  },
  {
    id: 'routes/adhocbrev._index',
    file: 'routes/adhocbrev._index.tsx',
    path: 'adhocbrev',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/afp-etteroppgjor',
    file: 'routes/afp-etteroppgjor/route.tsx',
    path: 'afp-etteroppgjor',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/afp-etteroppgjor.start',
        file: 'routes/afp-etteroppgjor.start/route.tsx',
        path: 'start',
        index: undefined,
        caseSensitive: undefined
      }
    ]
  },
  {
    id: 'routes/batch.regulering',
    file: 'routes/batch.regulering.tsx',
    path: 'batch/regulering',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/omregning._index',
    file: 'routes/omregning._index.tsx',
    path: 'omregning',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen090.bpen090',
    file: 'routes/bpen090.bpen090.tsx',
    path: 'bpen090/bpen090',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen091.bpen091',
    file: 'routes/bpen091.bpen091.tsx',
    path: 'bpen091/bpen091',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen096.bpen096',
    file: 'routes/bpen096.bpen096.tsx',
    path: 'bpen096/bpen096',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/auth.microsoft',
    file: 'routes/auth.microsoft.tsx',
    path: 'auth/microsoft',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen090._index',
    file: 'routes/bpen090._index.tsx',
    path: 'bpen090',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen091._index',
    file: 'routes/bpen091._index.tsx',
    path: 'bpen091',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/bpen096._index',
    file: 'routes/bpen096._index.tsx',
    path: 'bpen096',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/brukere._index',
    file: 'routes/brukere._index/route.tsx',
    path: 'brukere',
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/auth.callback',
    file: 'routes/auth.callback.tsx',
    path: 'auth/callback',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/laaste-vedtak',
    file: 'routes/laaste-vedtak.tsx',
    path: 'laaste-vedtak',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/laaste-vedtak.bekreftOppdragsmeldingManuelt',
        file: 'routes/laaste-vedtak.bekreftOppdragsmeldingManuelt.tsx',
        path: 'bekreftOppdragsmeldingManuelt',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.hentVedtakIOppdrag.$vedtakId',
        file: 'routes/laaste-vedtak.hentVedtakIOppdrag.$vedtakId.tsx',
        path: 'hentVedtakIOppdrag/:vedtakId',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.oppdaterKanIverksettes',
        file: 'routes/laaste-vedtak.oppdaterKanIverksettes.tsx',
        path: 'oppdaterKanIverksettes',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.oppdaterAksjonspunkt',
        file: 'routes/laaste-vedtak.oppdaterAksjonspunkt.tsx',
        path: 'oppdaterAksjonspunkt',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.oppdaterKommentar',
        file: 'routes/laaste-vedtak.oppdaterKommentar.tsx',
        path: 'oppdaterKommentar',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.uttrekkStatus',
        file: 'routes/laaste-vedtak.uttrekkStatus.tsx',
        path: 'uttrekkStatus',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.oppdaterTeam',
        file: 'routes/laaste-vedtak.oppdaterTeam.tsx',
        path: 'oppdaterTeam',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.runUttrekk',
        file: 'routes/laaste-vedtak.runUttrekk.tsx',
        path: 'runUttrekk',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laaste-vedtak.laasOpp',
        file: 'routes/laaste-vedtak.laasOpp.tsx',
        path: 'laasOpp',
        index: undefined,
        caseSensitive: undefined
      }
    ]
  },
  {
    id: 'routes/linke-dnr-fnr',
    file: 'routes/linke-dnr-fnr.tsx',
    path: 'linke-dnr-fnr',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/laas-opp-sak',
    file: 'routes/laas-opp-sak.tsx',
    path: 'laas-opp-sak',
    index: undefined,
    caseSensitive: undefined,
    children: [
      {
        id: 'routes/laas-opp-sak.settTilManuell',
        file: 'routes/laas-opp-sak.settTilManuell.tsx',
        path: 'settTilManuell',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laas-opp-sak.hentSak',
        file: 'routes/laas-opp-sak.hentSak.tsx',
        path: 'hentSak',
        index: undefined,
        caseSensitive: undefined
      },
      {
        id: 'routes/laas-opp-sak.laasOpp',
        file: 'routes/laas-opp-sak.laasOpp.tsx',
        path: 'laasOpp',
        index: undefined,
        caseSensitive: undefined
      }
    ]
  },
  {
    id: 'routes/auth.failed',
    file: 'routes/auth.failed.tsx',
    path: 'auth/failed',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/infobanner',
    file: 'routes/infobanner.tsx',
    path: 'infobanner',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/dashboard',
    file: 'routes/dashboard/route.tsx',
    path: 'dashboard',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/kalender',
    file: 'routes/kalender/route.tsx',
    path: 'kalender',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/batcher',
    file: 'routes/batcher.tsx',
    path: 'batcher',
    index: undefined,
    caseSensitive: undefined
  },
  {
    id: 'routes/_index',
    file: 'routes/_index.tsx',
    path: undefined,
    index: true,
    caseSensitive: undefined
  },
  {
    id: 'routes/sok',
    file: 'routes/sok.tsx',
    path: 'sok',
    index: undefined,
    caseSensitive: undefined
  }
] satisfies RouteConfig
