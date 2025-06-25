function splitOnCapitals(string: string) {
  let match = string.match(/([A-ZÆØÅ]{2,}|[A-ZÆØÅ][a-zæøå]+)/g)
  if (match) {
    return match.map((value, index) => {
      if (index == 0) {
        return value
      } else {
        return value.toLocaleLowerCase('no-NO')
      }
    }) .join(' ')
  } else {
    return string
  }
}

const oversettinger = [
  ['AfpPrivatBehandling', 'Privat AFP'],
  ['AfpEtteroppgjorBehandling', 'AFP etteroppgjør'],
  ['AfpEtteroppgjorAndreAvvikBehandling', 'AFP etteroppgjør andre avvik'],
  ['AfpEtteroppgjorEtterbetalingBehandling', 'AFP etteroppgjør etterbetaling'],
  ['AfpEtteroppgjorKlassifiserBehandling', 'AFP etteroppgjør klassifiser'],
  ['AfpEtteroppgjorOpprettEtteroppgjorKravBehandling', 'AFP etteroppgjør opprett etteroppgjørskrav'],
  ['AfpEtteroppgjorTilbakekrevingBehandling', 'AFP etteroppgjør tilbakekreving'],
  ['AfpEtteroppgjorUnderSatsBehandling', 'AFP etteroppgjør under sats'],
  ['BarnepensjonOpphoerBehandling', 'Opphør barnepensjon'],
  ['DistribuerBrevBehandling', 'Distribuer brev'],
  ['DodsmeldingBehandling', 'Dødsmelding'],
  ['EndreAttesteringsstatusBehandling', 'Endre attesteringsstatus'],
  ['EndringAvUttaksgradBehandling', 'Endring av uttaksgrad'],
  ['EtteroppgjorUTBehandling', 'Etteroppgjør uføretrygd'],
  ['FleksibelApSakBehandling', 'Alderspensjonssøknad'],
  ['ForelderBarnMeldingBehandling', 'Forelder og barn melding'],
  ['ForventetInntektUTBehandling', 'Forventet inntekt uføretrygd'],
  ['HentLopendeGjenlevendeBehandling', 'Hent løpende gjenlevende'],
  ['InnvandringAnnulleringMeldingBehandling', 'Annulert innvandringsmelding'],
  ['InnvandringMeldingBehandling', 'Innvandringsmelding'],
  ['IverksettOmsorgspoengBehandling', 'Iverksett omsorgspoeng'],
  ['IverksettVedtakBehandling', 'Iverksett vedtak'],
  ['OppdaterFodselsnummerBehandling', 'Oppdater fødselsnummer'],
  ['OverforOmsorgspoengBehandling', 'Overfør omsorgspoeng'],
  ['RekonverterUpTilUtBehandling', 'Rekonverter uførepensjon til uføretrygd'],
  [
    'TilbakekrevingEtteroppgjorUTBehandling',
    'Tilbakekreving etteroppgjør uføretrygd',
  ],
  ['TilbakekrevingshendelseBehandling', 'Tilbakekrevingshendelse'],
  ['UtvandringAnnulleringMeldingBehandling', 'Annulert utvandringsmelding'],
  ['UtvandringMeldingBehandling', 'Utvandringsmelding'],
]
export function decodeBehandling(string: string) {
  let oversetting = oversettinger.find((value) => value[0] === string)
  return oversetting
    ? oversetting[1]
    : splitOnCapitals(string.replace(/Behandling$/, ''));
}
