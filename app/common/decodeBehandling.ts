import type { BehandlingDto } from '~/types'

function splitOnCapitals(input: string): string {
  const parts = input.match(/[A-ZÆØÅ]{2}(?=[A-ZÆØÅ][a-zæøå])|[A-ZÆØÅ]{2,}|[A-ZÆØÅ][a-zæøå]+|[a-zæøå]+/g)

  if (!parts) {
    return input
  }

  return parts
    .map((part, index) => {
      if (index === 0) return part
      if (/^[A-ZÆØÅ]{2,}$/.test(part)) return part
      return part.toLocaleLowerCase('no-NO')
    })
    .join(' ')
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
  ['OpptjeningsendringUforeBehandling', 'Opptjeningsendring uføre'],
  ['OverforOmsorgspoengBehandling', 'Overfør omsorgspoeng'],
  ['RekonverterUpTilUtBehandling', 'Rekonverter uførepensjon til uføretrygd'],
  ['TilbakekrevingEtteroppgjorUTBehandling', 'Tilbakekreving etteroppgjør uføretrygd'],
  ['TilbakekrevingshendelseBehandling', 'Tilbakekrevingshendelse'],
  ['UtvandringAnnulleringMeldingBehandling', 'Annulert utvandringsmelding'],
  ['UtvandringMeldingBehandling', 'Utvandringsmelding'],
]
export function decodeBehandling(behandling: string | BehandlingDto) {
  const string: string = typeof behandling === 'string' ? behandling : behandling.type

  const oversetting = oversettinger.find((value) => value[0] === string)
  return oversetting ? oversetting[1] : splitOnCapitals(string.replace(/Behandling$/, ''))
}

const aktivitetRegex = /(A\d+)(.*?)(?=Aktivitet|$)/

export function decodeAktivitet(string: string, separator: string = '-') {
  const match = string.match(aktivitetRegex)
  if (match) {
    const [, code, rest] = match
    return `${code} ${separator} ${splitOnCapitals(rest)}`
  } else {
    return string
  }
}
