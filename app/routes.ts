import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('index.tsx'),

  route('auth/callback', 'auth/auth.callback.tsx'),
  route('auth/failed', 'auth/auth.failed.tsx'),
  route('auth/microsoft', 'auth/auth.microsoft.tsx'),

  layout('layout.tsx', [
    route('adhocbrev', 'adhocbrev/adhocbrev._index.tsx'),
    route('adhocbrev/adhocbrev', 'adhocbrev/adhocbrev.adhocbrev.tsx'),

    route('afp-etteroppgjor', 'afp-etteroppgjor/afp-etteroppgjor.tsx'),

    route('aldersovergang', 'aldersovergang/aldersovergang._index.tsx'),

    route('aldersovergang/opprett', 'aldersovergang/aldersovergang.opprett.tsx'),

    route('batch/inntektskontroll', 'inntektskontroll/batch.inntektskontroll._index.tsx'),

    route('batch/regulering', 'regulering/batch.regulering.tsx'),

    route('batch/reguleringv2', 'regulering/batch.reguleringv2.tsx', [
      route('administrerbehandlinger', 'regulering/batch.reguleringv2.administrerbehandlinger.tsx', [
        route('hentTotaloversiktBehandlinger/:behandlingId', 'regulering/batch.reguleringv2.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId.tsx'),
        route('fortsettFamilieReguleringerTilBehandling', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling.tsx'),
        route('fortsettFeilendeFamilieReguleringer', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeFamilieReguleringer.tsx'),
        route('fortsettFeilendeIverksettVedtak', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettFeilendeIverksettVedtak.tsx'),
        route('fortsettFaktoromregningsmodus', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettFaktoromregningsmodus.tsx'),
        route('fortsettFeilhandteringmodus', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettFeilhandteringmodus.tsx'),
        route('fortsettNyAvviksgrenser', 'regulering/batch.reguleringv2.administrerbehandlinger.fortsettNyAvviksgrenser.tsx'),
        route('oppdaterAvviksgrenser', 'regulering/batch.reguleringv2.administrerbehandlinger.oppdaterAvviksgrenser.tsx'),
        route('hentStatistikk', 'regulering/batch.reguleringv2.administrerbehandlinger.hentStatistikk.tsx'),
      ]),
      route('avsluttendeaktiviteter', 'regulering/batch.reguleringv2.avsluttendeaktiviteter.tsx'),
      route('ekskludertesaker', 'regulering/batch.reguleringv2.ekskludertesaker.tsx'),
      route('orkestrering', 'regulering/batch.reguleringv2.orkestrering.tsx', [
        route('hentOrkestreringStatistikk/:behandlingId', 'regulering/batch.reguleringv2.orkestrering.hentOrkestreringStatistikk.$behandlingId.tsx'),
        route('hentAggregerteFeilmeldinger', 'regulering/batch.reguleringv2.orkestrering.hentAggregerteFeilmeldinger.tsx'),
        route('fortsett/:behandlingId', 'regulering/batch.reguleringv2.orkestrering.fortsett.$behandlingId.tsx'),
        route('pause/:behandlingId', 'regulering/batch.reguleringv2.orkestrering.pause.$behandlingId.tsx'),
      ]),
      route('uttrekk', 'regulering/batch.reguleringv2.uttrekk.tsx', [
        route('startUttrekk', 'regulering/batch.reguleringv2.uttrekk.startUttrekk.tsx'),
      ]),
    ]),

    route('batcher', 'batcher/batcher.tsx'),

    ...prefix('behandling/:behandlingId', [
      route('', 'behandling/behandling.$behandlingId.tsx', [
        index('behandling/behandling.$behandlingId._index.tsx'),

        route('behandlingManuellKategori/:behandlingManuellKategori', 'behandling/behandling.$behandlingId.behandlingManuellKategori.$behandlingManuellKategori.tsx'),
        route('behandlingManuellOpptelling', 'behandling/behandling.$behandlingId.behandlingManuellOpptelling.tsx'),
        route('ikkeFullforteAktiviteter', 'behandling/behandling.$behandlingId.ikkeFullforteAktiviteter.tsx'),
        route('avhengigeBehandlinger', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.tsx', [
          route('fortsett', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.fortsett.tsx'),
        ]),
        route('oppdragskvittering', 'behandling/behandling.$behandlingId.oppdragskvittering.tsx'),
        route('manuelleOppgaver', 'behandling/behandling.$behandlingId.manuelleOppgaver.tsx'),
        route('oppdragsmelding', 'behandling/behandling.$behandlingId.oppdragsmelding.tsx'),
        route('aktiviteter', 'behandling/behandling.$behandlingId.aktiviteter.tsx'),
        route('output', 'behandling/behandling.$behandlingId.output.tsx'),
        route('input', 'behandling/behandling.$behandlingId.input.tsx'),
        route('uttrekk', 'behandling/behandling.$behandlingId.uttrekk.tsx'),
      ]),

      route('aktivitet/:aktivitetId', 'behandling/behandling.$behandlingId.aktivitet.$aktivitetId.tsx', [
        route('felt/:felt', 'behandling/behandling.$behandlingId.aktivitet.$aktivitetId.felt.$felt.tsx'),
      ]),
    ]),

    route('behandlinger', 'behandlinger/behandlinger._index.tsx'),
    route('behandlinger/:status', 'behandlinger/behandlinger.$status.tsx', [
      route('fortsett', 'behandlinger/behandlinger.$status.fortsett.tsx'),
    ]),

    route('bestem-etteroppgjor-resultat', 'uforetrygd/bestem-etteroppgjor-resultat._index.tsx'),

    route('bpen090', 'uforetrygd/bpen090._index.tsx'),

    route('bpen090/bpen090', 'uforetrygd/bpen090.bpen090.tsx'),

    route('bpen091', 'uforetrygd/bpen091._index.tsx'),

    route('bpen091/bpen091', 'uforetrygd/bpen091.bpen091.tsx'),

    route('bpen096', 'uforetrygd/bpen096._index.tsx'),
    route('bpen096/bpen096', 'uforetrygd/bpen096.bpen096.tsx'),

    route('brukere', 'brukere/index.tsx'),
    route('brukere/:brukernavn', 'brukere/$brukernavn.tsx'),

    route('dashboard', 'dashboard/route.tsx'),

    route('infobanner', 'vedlikehold/infobanner.tsx'),

    route('kalender', 'kalender/route.tsx'),

    route('laas-opp-sak', 'vedlikehold/laas-opp-sak.tsx', [
      route('settTilManuell', 'vedlikehold/laas-opp-sak.settTilManuell.tsx'),
      route('hentSak', 'vedlikehold/laas-opp-sak.hentSak.tsx'),
      route('laasOpp', 'vedlikehold/laas-opp-sak.laasOpp.tsx'),
    ]),

    route('laaste-vedtak', 'vedlikehold/laaste-vedtak.tsx', [
      route('bekreftOppdragsmeldingManuelt', 'vedlikehold/laaste-vedtak.bekreftOppdragsmeldingManuelt.tsx'),
      route('hentVedtakIOppdrag/:vedtakId', 'vedlikehold/laaste-vedtak.hentVedtakIOppdrag.$vedtakId.tsx'),
      route('oppdaterKanIverksettes', 'vedlikehold/laaste-vedtak.oppdaterKanIverksettes.tsx'),
      route('oppdaterAksjonspunkt', 'vedlikehold/laaste-vedtak.oppdaterAksjonspunkt.tsx'),
      route('oppdaterKommentar', 'vedlikehold/laaste-vedtak.oppdaterKommentar.tsx'),
      route('uttrekkStatus', 'vedlikehold/laaste-vedtak.uttrekkStatus.tsx'),
      route('oppdaterTeam', 'vedlikehold/laaste-vedtak.oppdaterTeam.tsx'),
      route('runUttrekk', 'vedlikehold/laaste-vedtak.runUttrekk.tsx'),
      route('laasOpp', 'vedlikehold/laaste-vedtak.laasOpp.tsx'),
    ]),

    route('leveattester-sokos-spkmottak', 'vedlikehold/leveattester-sokos-spkmottak.tsx'),

    route('lever-samboeropplysning', 'samboeropplysninger/lever-samboeropplysning._index.tsx'),

    route('linke-dnr-fnr', 'vedlikehold/linke-dnr-fnr.tsx'),

    route('manglende-foreign-key-indexer', 'vedlikehold/manglende-foreign-key-indexer.tsx'),

    route('omregning', 'omregning/omregning._index.tsx'),
    route('omregning/behandlinger', 'omregning/omregning.behandlinger.tsx'),
    route('omregning/omregning', 'omregning/omregning.omregning.tsx'),
    route('omregning/omregningsaker', 'omregning/omregning.omregningsaker.tsx'),
    route('omregningStatistikk', 'omregning/omregningStatistikk._index.tsx'),

    route('oppdatersakstatus', 'oppdatersakstatus/oppdatersakstatus._index.tsx'),
    route('oppdatersakstatus/oppdatersakstatus', 'oppdatersakstatus/oppdatersakstatus.oppdatersakstatus.tsx'),

    route('opptjening/kategoriserBruker', 'opptjening/opptjening.kategoriserBruker._index.tsx'),
    route('opptjening/arlig/omregning/uttrekk', 'opptjening/opptjening.arlig.omregning.uttrekk.tsx'),
    route('opptjening/manedlig/uttrekk', 'opptjening/opptjening.manedlig.uttrekk._index.tsx'),
    route('opptjening/arlig/omregning', 'opptjening/opptjening.arlig.omregning._index.tsx'),
    route('opptjening/manedlig/omregning', 'opptjening/opptjening.manedlig.omregning._index.tsx'),
    route('opptjening/manedlig/omregning/kategoriserBruker', 'opptjening/opptjening.manedlig.omregning.kategoriserBruker.tsx'),
    route('opptjening/manedlig/omregning/uttrekk', 'opptjening/opptjening.manedlig.omregning.uttrekk.tsx'),

    route('sok', 'sok/sok.tsx'),
  ]),
] satisfies RouteConfig