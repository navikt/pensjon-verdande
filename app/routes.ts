import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  route('adhocbrev', 'routes/adhocbrev._index.tsx', [
    //index('routes/adhocbrev._index.tsx'),
  ]),
  route('adhocbrev/adhocbrev', 'routes/adhocbrev.adhocbrev.tsx'),

  route('afp-etteroppgjor', 'routes/afp-etteroppgjor/route.tsx', [
    route('start', 'routes/afp-etteroppgjor.start/route.tsx'),
  ]),

  route('aktivitet/:behandlingId/:aktivitetId', 'routes/aktivitet.$behandlingId.$aktivitetId.tsx'),

  route('aldersovergang', 'routes/aldersovergang._index.tsx', [
    //index('routes/aldersovergang._index.tsx'),
  ]),

  route('aldersovergang/opprett', 'routes/aldersovergang.opprett.tsx'),

  route('auth/callback', 'routes/auth.callback.tsx'),
  route('auth/failed', 'routes/auth.failed.tsx'),
  route('auth/microsoft', 'routes/auth.microsoft.tsx'),

  route('batch-opprett', 'routes/batch-opprett._index.tsx', [
    //index('routes/batch-opprett._index.tsx'),
  ]),

  route('batch/inntektskontroll', 'routes/batch.inntektskontroll._index.tsx', [
    //index('routes/batch.inntektskontroll._index.tsx'),
  ]),
  route('batch/inntektskontroll/opprett', 'routes/batch.inntektskontroll.opprett.tsx'),

  route('batch/regulering', 'routes/batch.regulering.tsx'),
  route('batch/reguleringv2', 'routes/batch.reguleringv2.tsx', [
    route('administrerbehandlinger', 'routes/batch.reguleringv2.administrerbehandlinger.tsx', [
      route('hentTotaloversiktBehandlinger/:behandlingId', 'routes/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId.tsx'),
      route('fortsettFamilieReguleringerTilBehandling', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling.tsx'),
      route('fortsettFeilendeFamilieReguleringer', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer.tsx'),
      route('fortsettFeilendeIverksettVedtak', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak.tsx'),
      route('fortsettFaktoromregningsmodus', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus.tsx'),
      route('fortsettFeilhandteringmodus', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus.tsx'),
      route('fortsettNyAvviksgrenser', 'routes/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser.tsx'),
      route('oppdaterAvviksgrenser', 'routes/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser.tsx'),
      route('hentStatistikk', 'routes/batch.reguleringv2.administrerbehandlinger.hentStatistikk.tsx'),
    ]),
    route('avsluttendeaktiviteter', 'routes/batch.reguleringv2.avsluttendeaktiviteter.tsx'),
    route('ekskludertesaker', 'routes/batch.reguleringv2.ekskludertesaker.tsx'),
    route('orkestrering', 'routes/batch.reguleringv2.orkestrering.tsx', [
      route('hentOrkestreringStatistikk/:behandlingId', 'routes/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId.tsx'),
      route('hentAggregerteFeilmeldinger', 'routes/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger.tsx'),
      route('fortsett/:behandlingId', 'routes/batch.reguleringv2.orkestrering.fortsett.$behandlingId.tsx'),
      route('pause/:behandlingId', 'routes/batch.reguleringv2.orkestrering.pause.$behandlingId.tsx'),
    ]),
    route('uttrekk', 'routes/batch.reguleringv2.uttrekk.tsx', [
      route('startUttrekk', 'routes/batch.reguleringv2.uttrekk.startUttrekk.tsx'),
    ]),
  ]),

  route('batcher', 'routes/batcher.tsx'), index('routes/_index.tsx'),

  route('behandling/:behandlingId', 'behandling/behandling.$behandlingId.tsx', [
    index('behandling/behandling.$behandlingId._index.tsx'),

    route('sendTilManuellMedKontrollpunkt', 'behandling/behandling.$behandlingId.sendTilManuellMedKontrollpunkt.tsx'),
    route('fortsettAvhengigeBehandlinger', 'behandling/behandling.$behandlingId.fortsettAvhengigeBehandlinger.tsx'),
    route('behandlingManuellOpptelling', 'behandling/behandling.$behandlingId.behandlingManuellOpptelling.tsx'),
    route('ikkeFullforteAktiviteter', 'behandling/behandling.$behandlingId.ikkeFullforteAktiviteter.tsx'),
    route('avhengigeBehandlinger', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.tsx', [
      route('fortsett', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.fortsett.tsx'),
    ]),
    route('oppdaterAnsvarligTeam', 'behandling/behandling.$behandlingId.oppdaterAnsvarligTeam.tsx'),
    route('sendTilOppdragPaNytt', 'behandling/behandling.$behandlingId.sendTilOppdragPaNytt.tsx'),
    route('oppdragskvittering', 'behandling/behandling.$behandlingId.oppdragskvittering.tsx'),
    route('manuelleOppgaver', 'behandling/behandling.$behandlingId.manuelleOppgaver.tsx'),
    route('oppdragsmelding', 'behandling/behandling.$behandlingId.oppdragsmelding.tsx'),
    route('fjernFraDebug', 'behandling/behandling.$behandlingId.fjernFraDebug.tsx'),
    route('runBehandling', 'behandling/behandling.$behandlingId.runBehandling.tsx'),
    route('aktiviteter', 'behandling/behandling.$behandlingId.aktiviteter.tsx'),
    route('taTilDebug', 'behandling/behandling.$behandlingId.taTilDebug.tsx'),
    route('fortsett', 'behandling/behandling.$behandlingId.fortsett.tsx'),
    route('output', 'behandling/behandling.$behandlingId.output.tsx'),
    route('input', 'behandling/behandling.$behandlingId.input.tsx'),
    route('stopp', 'behandling/behandling.$behandlingId.stopp.tsx'),
  ]),

  route('behandlinger', 'routes/behandlinger._index.tsx', [
    //index('routes/behandlinger._index.tsx'),
  ]),
  route('behandlinger/:status', 'routes/behandlinger.$status.tsx', [
    route('fortsett', 'routes/behandlinger.$status.fortsett.tsx'),
  ]),

  route('bestem-etteroppgjor-resultat', 'routes/bestem-etteroppgjor-resultat._index.tsx'),

  route('bpen090', 'routes/bpen090._index.tsx', [
    //index('routes/bpen090._index.tsx'),
  ]),

  route('bpen090/bpen090', 'routes/bpen090.bpen090.tsx'),

  route('bpen091', 'routes/bpen091._index.tsx', [
    //index('routes/bpen091._index.tsx'),
  ]),

  route('bpen091/bpen091', 'routes/bpen091.bpen091.tsx'),

  route('bpen096', 'routes/bpen096._index.tsx', [
    //index('routes/bpen096._index.tsx'),
  ]),
  route('bpen096/bpen096', 'routes/bpen096.bpen096.tsx'),

  route('brukere', 'routes/brukere._index/route.tsx', [
    //index('routes/brukere._index/route.tsx'),
  ]),
  route('brukere/:brukernavn', 'routes/brukere.$brukernavn/route.tsx'),

  route('dashboard', 'routes/dashboard/route.tsx'),

  route('infobanner', 'routes/infobanner.tsx'),

  route('kalender', 'routes/kalender/route.tsx'),

  route('laas-opp-sak', 'routes/laas-opp-sak.tsx', [
    route('settTilManuell', 'routes/laas-opp-sak.settTilManuell.tsx'),
    route('hentSak', 'routes/laas-opp-sak.hentSak.tsx'),
    route('laasOpp', 'routes/laas-opp-sak.laasOpp.tsx'),
  ]),

  route('laaste-vedtak', 'routes/laaste-vedtak.tsx', [
    route('bekreftOppdragsmeldingManuelt', 'routes/laaste-vedtak.bekreftOppdragsmeldingManuelt.tsx'),
    route('hentVedtakIOppdrag/:vedtakId', 'routes/laaste-vedtak.hentVedtakIOppdrag.$vedtakId.tsx'),
    route('oppdaterKanIverksettes', 'routes/laaste-vedtak.oppdaterKanIverksettes.tsx'),
    route('oppdaterAksjonspunkt', 'routes/laaste-vedtak.oppdaterAksjonspunkt.tsx'),
    route('oppdaterKommentar', 'routes/laaste-vedtak.oppdaterKommentar.tsx'),
    route('uttrekkStatus', 'routes/laaste-vedtak.uttrekkStatus.tsx'),
    route('oppdaterTeam', 'routes/laaste-vedtak.oppdaterTeam.tsx'),
    route('runUttrekk', 'routes/laaste-vedtak.runUttrekk.tsx'),
    route('laasOpp', 'routes/laaste-vedtak.laasOpp.tsx'),
  ]),

  route('leveattester-sokos-spkmottak', 'routes/leveattester-sokos-spkmottak.tsx'),

  route('lever-samboeropplysning', 'routes/lever-samboeropplysning._index.tsx', [
    //index('routes/lever-samboeropplysning._index.tsx'),
  ]),

  route('linke-dnr-fnr', 'routes/linke-dnr-fnr.tsx'),

  route('manglende-foreign-key-indexer', 'routes/manglende-foreign-key-indexer.tsx'),

  route('omregning', 'routes/omregning._index.tsx', [
    //index('routes/omregning._index.tsx'),
  ]),
  route('omregning/behandlinger', 'routes/omregning.behandlinger.tsx'),
  route('omregning/omregning', 'routes/omregning.omregning.tsx'),
  route('omregning/omregningsaker', 'routes/omregning.omregningsaker.tsx'),
  route('omregningStatistikk', 'routes/omregningStatistikk._index.tsx', [
    //index('routes/omregningStatistikk._index.tsx'),
  ]),

  route('oppdatersakstatus', 'routes/oppdatersakstatus._index.tsx', [
    //index('routes/oppdatersakstatus._index.tsx'),
  ]),
  route('oppdatersakstatus/oppdatersakstatus', 'routes/oppdatersakstatus.oppdatersakstatus.tsx'),

  route('opptjening/kategoriserBruker', 'routes/opptjening.kategoriserBruker._index.tsx', [
    //index('routes/opptjening.kategoriserBruker._index.tsx'),
  ]),
  route('opptjening/arlig/omregning/uttrekk', 'routes/opptjening.arlig.omregning.uttrekk.tsx'),
  route('opptjening/manedlig/uttrekk', 'routes/opptjening.manedlig.uttrekk._index.tsx', [
    //index('routes/opptjening.manedlig.uttrekk._index.tsx'),
  ]),
  route('opptjening/arlig/omregning', 'routes/opptjening.arlig.omregning._index.tsx', [
    //index('routes/opptjening.arlig.omregning._index.tsx'),
  ]),
  route('opptjening/manedlig/omregning', 'routes/opptjening.manedlig.omregning._index.tsx'),
  route('opptjening/manedlig/omregning/kategoriserBruker', 'routes/opptjening.manedlig.omregning.kategoriserBruker.tsx'),
  route('opptjening/manedlig/omregning/uttrekk', 'routes/opptjening.manedlig.omregning.uttrekk.tsx'),

  route('sok', 'routes/sok.tsx'),
] satisfies RouteConfig