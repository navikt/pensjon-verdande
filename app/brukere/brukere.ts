
export type Tilgangsmeta = {
  operasjonNavn: string
  operasjonBeskrivelse: string
  omfangNavn: string
  omfangBeskrivelse: string
}

export type BrukerResponse = {
  brukernavn: string;

  fornavn?: string | null;
  etternavn?: string | null;

  tilganger: string[];
  tilgangsHistorikk: BrukerTilgang[];
};

export type MeResponse = BrukerResponse &{
  verdandeRoller: string[],
}

export type BrukerTilgang = {
  brukernavn: string
  fra: string
  til?: string | null
  operasjon: string
  gittAvBruker: string
  fjernetAvBruker?: string | null
}

export const tilgangsmetaSort = (a: Tilgangsmeta, b: Tilgangsmeta) => a.operasjonBeskrivelse.localeCompare(b.operasjonBeskrivelse, 'nb', { sensitivity: 'base' })

export const decodeOmfang = (meta: Tilgangsmeta[], omfang: string) => meta.find(it => it.omfangNavn === omfang)?.omfangBeskrivelse ?? omfang

export const decodeOperasjon = (meta: Tilgangsmeta[], operasjon: string)=> meta.find(it => it.operasjonNavn === operasjon)?.operasjonBeskrivelse ?? operasjon
