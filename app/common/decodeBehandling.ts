export function splitOnCapitals(string: string) {
  let match = string.match(/([A-ZÆØÅ]{2,}|[A-ZÆØÅ][a-zæøå]+)/g)
  if (match) {
    return match.join(' ')
  } else {
    return string
  }
}

const oversettinger = [
  ['AfpPrivatBehandling', 'Privat AFP'],
  ['AfpEtteroppgjorBehandling', 'AFP Etteroppgjør'],
  ['BarnepensjonOpphoerBehandling', 'Opphør barnepensjon'],
  ['DistribuerBrevBehandling', 'Distribuer brev'],
  ['DodsmeldingBehandling', 'Dødsmelding'],
  ['EndreAttesteringsstatusBehandling', 'Endre attesteringsstatus'],
  ['EndringAvUttaksgradBehandling', 'Endring av uttaksgrad'],
  ['EtteroppgjorUTBehandling', 'Etteroppgjør uføretrygd'],
  ['FleksibelApSakBehandling', 'Alderspensjonssøknad'],
  ['ForelderBarnMeldingBehandling', 'Forelder og barn melding'],
  ['ForventetInntektUTBehandling', 'Forventet inntekt uføretrygd'],
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
