import { index, layout, prefix, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('index.tsx'),

  route('auth/callback', 'auth/auth.callback.tsx'),
  route('auth/microsoft', 'auth/auth.microsoft.tsx'),

  route('api/sok', 'api/sok.ts'),
  route('api/opprettet-per-dag', 'api/opprettet-per-dag.ts'),

  layout('layout.tsx', [
    route('adhocbrev', 'adhocbrev/adhoc-brev.tsx'),
    route('afp-etteroppgjor', 'afp-etteroppgjor/afp-etteroppgjor.tsx'),

    route('alde', 'alde-oppfolging/index.tsx'),

    route('analyse', 'analyse/route.tsx', [
      index('analyse/_index.tsx'),

      // Ytelse — overordnet ytelsesovervåking
      route('ytelse', 'analyse/ytelse-layout.tsx', [
        index('analyse/ytelse-index.tsx'),
        route('nokkeltall', 'analyse/nokkeltall.tsx'),
        route('statustrend', 'analyse/statustrend.tsx'),
        route('varighet', 'analyse/varighet.tsx'),
        route('ko', 'analyse/ko.tsx'),
        route('ende-til-ende', 'analyse/ende-til-ende.tsx'),
      ]),

      // Automatisering — automatiseringsgrad og blokkere
      route('automatisering', 'analyse/automatisering-layout.tsx', [
        index('analyse/automatisering-index.tsx'),
        route('oversikt', 'analyse/automatisering.tsx'),
        route('kontrollpunkter', 'analyse/kontrollpunkter.tsx'),
        route('manuelle', 'analyse/manuelle.tsx'),
      ]),

      // Kvalitet — feilhåndtering og kvalitetsovervåking
      route('kvalitet', 'analyse/kvalitet-layout.tsx', [
        index('analyse/kvalitet-index.tsx'),
        route('stoppet', 'analyse/stoppet.tsx'),
        route('feilanalyse', 'analyse/feilanalyse.tsx'),
        route('gjenforsok', 'analyse/gjenforsok.tsx'),
      ]),

      // Aktiviteter og tid — aktivitetsnivå og tidsmønstre
      route('aktiviteter-og-tid', 'analyse/aktiviteter-layout.tsx', [
        index('analyse/aktiviteter-index.tsx'),
        route('aktivitetsvarighet', 'analyse/aktivitetsvarighet.tsx'),
        route('kalendertid', 'analyse/kalendertid.tsx'),
        route('aktiviteter', 'analyse/aktiviteter.tsx'),
        route('tidspunkt', 'analyse/tidspunkt.tsx'),
        route('planlagt', 'analyse/planlagt.tsx'),
      ]),

      // Sak & Krav — sak/krav-perspektiv (Styringscockpit)
      route('sak-krav', 'analyse/sak-krav-layout.tsx', [
        index('analyse/sak-krav-index.tsx'),
        route('krav', 'analyse/sak-krav-statistikk.tsx'),
        route('behandlingstid', 'analyse/sak-behandlingstid.tsx'),
      ]),

      // Dimensjoner — tverrgående analyse etter forretningsdimensjoner
      route('dimensjoner', 'analyse/dimensjoner-layout.tsx', [
        index('analyse/dimensjoner-index.tsx'),
        route('teamytelse', 'analyse/teamytelse.tsx'),
        route('prioritet', 'analyse/prioritet.tsx'),
        route('gruppe', 'analyse/gruppe.tsx'),
        route('sakstype', 'analyse/sakstype.tsx'),
        route('kravtype', 'analyse/kravtype.tsx'),
        route('vedtakstype', 'analyse/vedtakstype.tsx'),
        route('auto-brev', 'analyse/auto-brev.tsx'),
        route('behandling-krav-alder', 'analyse/sak-behandling-krav-alder.tsx'),
      ]),

      // Bakoverkompatibel catch-all for gamle fane-URL-er (f.eks. /analyse/nokkeltall → /analyse/ytelse/nokkeltall)
      route('*', 'analyse/redirect-tab.tsx'),
    ]),
    route('analyse/eksport', 'analyse/eksport.tsx'),

    route('aldersovergang', 'aldersovergang/aldersovergang._index.tsx'),

    route('aldersovergang/opprett', 'aldersovergang/aldersovergang.opprett.tsx'),
    route('alderspensjon/forstegangsbehandling/soknader', 'alderspensjon/forstegangsbehandling/soknader.tsx'),

    route('audit', 'audit/audit.index.tsx'),

    route('avstemming', 'avstemming/avstemming.tsx'),

    route('konsistensavstemming', 'konsistensavstemming/konsistensavstemming.tsx'),

    route('batch/inntektskontroll', 'inntektskontroll/batch.inntektskontroll._index.tsx'),

    route('batch/regulering', 'regulering/batch.regulering.tsx', [
      route('administrerbehandlinger', 'regulering/batch.regulering.administrerbehandlinger.tsx', [
        route('endrePrioritetBatch', 'regulering/batch.regulering.administrerbehandlinger.endrePrioritetBatch.tsx'),
        route('endrePrioritetOnline', 'regulering/batch.regulering.administrerbehandlinger.endrePrioritetOnline.tsx'),
        route(
          'hentTotaloversiktBehandlinger/:behandlingId',
          'regulering/batch.regulering.administrerbehandlinger.hentTotaloversiktBehandlinger.$behandlingId.tsx',
        ),
        route(
          'fortsettFamilieReguleringerTilBehandling',
          'regulering/batch.regulering.administrerbehandlinger.fortsettFamilieReguleringerTilBehandling.tsx',
        ),
        route(
          'fortsettFeilendeFamilieReguleringer',
          'regulering/batch.regulering.administrerbehandlinger.fortsettFeilendeFamilieReguleringer.tsx',
        ),
        route(
          'fortsettFeilendeIverksettVedtak',
          'regulering/batch.regulering.administrerbehandlinger.fortsettFeilendeIverksettVedtak.tsx',
        ),
        route(
          'fortsettFaktoromregningsmodus',
          'regulering/batch.regulering.administrerbehandlinger.fortsettFaktoromregningsmodus.tsx',
        ),
        route(
          'fortsettFeilhandteringmodus',
          'regulering/batch.regulering.administrerbehandlinger.fortsettFeilhandteringmodus.tsx',
        ),
        route(
          'fortsettNyAvviksgrenser',
          'regulering/batch.regulering.administrerbehandlinger.fortsettNyAvviksgrenser.tsx',
        ),
        route('oppdaterAvviksgrenser', 'regulering/batch.regulering.administrerbehandlinger.oppdaterAvviksgrenser.tsx'),
        route('hentStatistikk', 'regulering/batch.regulering.administrerbehandlinger.hentStatistikk.tsx'),
      ]),
      route('avsluttendeaktiviteter', 'regulering/batch.regulering.avsluttendeaktiviteter.tsx'),
      route('ekskludertesaker', 'regulering/batch.regulering.ekskludertesaker.tsx', [
        route('hentEkskluderteSaker', 'regulering/batch.regulering.ekskludertesaker.hent.tsx'),
        route('leggTilEkskluderteSaker', 'regulering/batch.regulering.ekskludertesaker.leggTil.tsx'),
        route('fjernEkskluderteSaker', 'regulering/batch.regulering.ekskludertesaker.fjern.tsx'),
      ]),
      route('orkestrering', 'regulering/batch.regulering.orkestrering.tsx', [
        route(
          'hentOrkestreringStatistikk/:behandlingId',
          'regulering/batch.regulering.orkestrering.hentOrkestreringStatistikk.$behandlingId.tsx',
        ),
        route(
          'hentAggregerteFeilmeldinger',
          'regulering/batch.regulering.orkestrering.hentAggregerteFeilmeldinger.tsx',
        ),
        route('fortsett/:behandlingId', 'regulering/batch.regulering.orkestrering.fortsett.$behandlingId.tsx'),
        route('pause/:behandlingId', 'regulering/batch.regulering.orkestrering.pause.$behandlingId.tsx'),
      ]),
      route('uttrekk', 'regulering/batch.regulering.uttrekk.tsx', [
        route('startUttrekk', 'regulering/batch.regulering.uttrekk.startUttrekk.tsx'),
        route('oppdaterUttrekk', 'regulering/batch.regulering.uttrekk.oppdaterUttrekk.tsx'),
      ]),
    ]),

    route('batcher', 'batcher/batcher.tsx'),

    ...prefix('behandling/:behandlingId', [
      route('', 'behandling/behandling.$behandlingId.tsx', [
        index('behandling/behandling.$behandlingId._index.tsx'),

        route(
          'behandlingManuellKategori/:behandlingManuellKategori',
          'behandling/behandling.$behandlingId.behandlingManuellKategori.$behandlingManuellKategori.tsx',
        ),
        route('behandlingManuellOpptelling', 'behandling/behandling.$behandlingId.behandlingManuellOpptelling.tsx'),
        route('ikkeFullforteAktiviteter', 'behandling/behandling.$behandlingId.ikkeFullforteAktiviteter.tsx'),
        route('avhengigeBehandlinger', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.tsx', [
          route('fortsett', 'behandling/behandling.$behandlingId.avhengigeBehandlinger.fortsett.tsx'),
        ]),
        route('audit', 'behandling/behandling.$behandlingId.audit.tsx'),
        route('oppdragskvittering', 'behandling/behandling.$behandlingId.oppdragskvittering.tsx'),
        route('manuelleOppgaver', 'behandling/behandling.$behandlingId.manuelleOppgaver.tsx'),
        route('oppdragsmelding', 'behandling/behandling.$behandlingId.oppdragsmelding.tsx'),
        route('aktiviteter', 'behandling/behandling.$behandlingId.aktiviteter.tsx'),
        route('logs', 'behandling/behandling.$behandlingId.logs.tsx'),
        route('output', 'behandling/behandling.$behandlingId.output.tsx'),
        route('input', 'behandling/behandling.$behandlingId.input.tsx'),
        route('uttrekk', 'behandling/behandling.$behandlingId.uttrekk.tsx'),
        route('detaljertFremdrift', 'behandling/behandling.$behandlingId.detaljertFremdrift.tsx'),
        route('relaterteFamiliebehandlinger', 'behandling/behandling.$behandlingId.relaterteFamiliebehandlinger.tsx'),
      ]),

      route('aktivitet/:aktivitetId', 'behandling/behandling.$behandlingId.aktivitet.$aktivitetId.tsx', [
        route('felt/:felt', 'behandling/behandling.$behandlingId.aktivitet.$aktivitetId.felt.$felt.tsx'),
      ]),

      route('kjoring/:kjoringId/logs', 'behandling/kjoring/kjoring-logs.tsx'),
    ]),

    route('behandlingserie', 'behandlingserie/behandlingserie.tsx'),
    route('behandlinger', 'behandlinger/behandlinger._index.tsx'),
    route('behandlinger/:status', 'behandlinger/behandlinger.$status.tsx', [
      route('fortsett', 'behandlinger/behandlinger.$status.fortsett.tsx'),
    ]),

    route('bestem-etteroppgjor-resultat', 'uforetrygd/bestem-etteroppgjor-resultat._index.tsx'),

    route('vedlikehold-barn', 'uforetrygd/vedlikehold-barn.tsx'),

    route('bpen090', 'uforetrygd/bpen090.tsx'),

    route('bpen091', 'uforetrygd/bpen091.tsx'),

    route('bpen096', 'uforetrygd/bpen096.tsx'),

    route('hvilenderett', 'uforetrygd/hvilende-rett.tsx'),

    route('varsel-regelendring2026', 'uforetrygd/varsel-regelendring2026.tsx'),

    route('brukere', 'brukere/index.tsx'),
    route('brukere/:brukernavn', 'brukere/$brukernavn.tsx'),

    route('dashboard', 'dashboard/route.tsx'),

    route('infobanner', 'vedlikehold/infobanner.tsx'),

    route('kalender', 'kalender/route.tsx'),

    route('etteroppgjor-historikk-ufore', 'vedlikehold/etteroppgjor-historikk-ufore.tsx'),

    route('laas-opp-sak', 'vedlikehold/laas-opp-sak.tsx', [
      route(':sakId', 'vedlikehold/laas-opp-sak.$sakId.tsx'),
      route('settTilManuell', 'vedlikehold/laas-opp-sak.settTilManuell.tsx'),
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

    route('leveattest-kontroll', 'leveattest-kontroll/leveattest-kontroll.tsx'),

    route('leveattester-sokos-spkmottak', 'vedlikehold/leveattester-sokos-spkmottak.tsx'),

    route('lever-samboeropplysning', 'samboeropplysninger/lever-samboeropplysning._index.tsx'),

    route('linke-dnr-fnr', 'vedlikehold/linke-dnr-fnr.tsx'),

    route('feil-registrer-krav', 'vedlikehold/feil-registrer-krav.tsx'),

    route('manglende-foreign-key-indexer', 'vedlikehold/manglende-foreign-key-indexer.tsx'),

    route('brev-bestilling', 'brev-bestilling/index.tsx'),

    route('scheduler-styring', 'vedlikehold/scheduler-styring.tsx'),

    route('manuell-behandling', 'manuell-behandling/index.tsx'),
    route('manuell-behandling-uttrekk', 'manuell-behandling/uttrekk.tsx'),

    route('omregning', 'omregning/omregning._index.tsx'),
    route('omregning/behandlinger', 'omregning/omregning.behandlinger.tsx'),
    route('omregning/omregning', 'omregning/omregning.omregning.tsx'),
    route('omregning/omregningsaker', 'omregning/omregning.omregningsaker.tsx'),
    route('omregningStatistikk', 'omregning/omregningStatistikk._index.tsx'),
    route('omregningStatistikk/:behandlingsnoekkel.csv', 'omregning/omregningStatistikk.$behandlingsnoekkel.csv.tsx'),

    route('opptjening/arlig/omregning', 'opptjening/arlig/opptjening.arlig.omregning.tsx'),
    route('opptjening/manedlig/omregning', 'opptjening/manedlig/opptjening.manedlig.omregning.tsx'),
    route('/opptjening/manedlig/omregning/opprett', 'opptjening/manedlig/opptjening.manedlig.omregning.opprett.tsx'),

    route('kontroll-saerskilt-sats', 'kontroll-saerskilt-sats/kontroll-saerskilt-sats._index.tsx'),
    route('kontroll-kvalitetssjekk', 'kontroll-kvalitetssjekk/kontroll-kvalitetssjekk._index.tsx'),
  ]),
] satisfies RouteConfig
