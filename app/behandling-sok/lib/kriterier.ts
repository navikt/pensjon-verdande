/**
 * DSL-typer + dispatcher-map for generisk behandlingssøk.
 *
 * Speiler `/api/behandling/sok`-kontrakten i pensjon-pen. Feltnavn er valgt etter spec-eksempelet
 * (`aktivitetTyper`, `kontrollpunktTyper`, `statuser`); øvrige er kvalifiserte gjetninger basert
 * på spec-tabellen og kan måtte justeres mot backend ved første test.
 */

export type Operator = 'AND' | 'OR'

export type Kriterium =
  | { type: 'OPPRETTET_I_PERIODE'; fom: string; tom: string }
  | { type: 'FULLFORT_I_PERIODE'; fom: string; tom: string }
  | { type: 'STOPPET_I_PERIODE'; fom: string; tom: string }
  | { type: 'SIST_KJORT_I_PERIODE'; fom: string; tom: string }
  | { type: 'HAR_STATUS'; statuser: string[] }
  | { type: 'HAR_PRIORITET'; prioriteter: number[] }
  | { type: 'HAR_ANSVARLIG_TEAM'; team: string[] }
  | { type: 'OPPRETTET_AV'; identer: string[] }
  | { type: 'ER_BATCH'; verdi: boolean }
  | { type: 'TILHORER_BEHANDLINGSSERIE'; uuid: string }
  | { type: 'HAR_AKTIVITET_AV_TYPE'; aktivitetTyper: string[]; operator: Operator }
  | { type: 'AKTIVITET_KJORT_FLERE_GANGER_ENN'; terskel: number }
  | { type: 'HAR_AAPEN_MANUELL_BEHANDLING' }
  | { type: 'HAR_AAPEN_BREVBESTILLING' }
  | { type: 'HAR_FEILET_KJORING'; siden?: string | null }
  | { type: 'KRAVHODE_HAR_STATUS'; statuser: string[] }
  | { type: 'KRAVHODE_HAR_KONTROLLPUNKT'; kontrollpunktTyper: string[]; operator: Operator }
  | { type: 'KRAVHODE_HAR_BEHANDLINGTYPE'; behandlingTyper: string[] }
  | { type: 'KONTROLLPUNKT_ER_KRITISK' }
  | { type: 'KRAV_GJELDER'; koder: string[] }
  | { type: 'SAK_HAR_TYPE'; sakstyper: string[] }
  | { type: 'KRAV_HAR_EIERENHET'; eierenheter: string[] }

export type KriterieType = Kriterium['type']

export type KriterieGruppe = 'Tid' | 'Behandling' | 'Aktiviteter' | 'Krav & sak'

/** Editor-primitives — hver dekker én eller flere kriterietyper. */
export type EditorKomponent =
  | 'PeriodeEditor'
  | 'MultiSelectEditor'
  | 'MultiSelectMedOperatorEditor'
  | 'CheckboxEditor'
  | 'ToggleEditor'
  | 'TallEditor'
  | 'TagInputEditor'
  | 'UuidEditor'
  | 'ValgfriDatoEditor'
  | 'MultiTallEditor'

/**
 * Hvilken metadata-nøkkel skal MultiSelectEditor lese fra for å fylle dropdown.
 * `none` = editoren bruker ikke metadata.
 */
export type MetadataNokkel =
  | 'behandlingStatuser'
  | 'kravStatuser'
  | 'kravGjelderKoder'
  | 'sakstyper'
  | 'eierenheter'
  | 'ansvarligeTeam'
  | 'aktivitetTyper'
  | 'kontrollpunktTyper'
  | 'kravhodeBehandlingTyper'
  | 'none'

export type KriterieDefinisjon = {
  type: KriterieType
  visningsnavn: string
  gruppe: KriterieGruppe
  editor: EditorKomponent
  /** Hvilken metadata-feltnavn dekoder/popuerer dropdown. */
  metadataNokkel: MetadataNokkel
  /** Felt-nøkkelen i Kriterium-objektet for den valgte verdien (multi/single). */
  verdiNokkel?: keyof Kriterium
  /**
   * Sensitive kriterier holdes utenfor URL og lagres i sessionStorage istedenfor.
   * NAV-identer og UUID kan røpe at en bestemt person/behandlingsserie eksisterer.
   */
  sensitiv: boolean
  /** Default-verdi når brukeren legger til kriteriet. */
  defaultVerdi: () => Kriterium
  /** Et tids-kriterium (★) — minst ett kreves. */
  tidsfilter: boolean
}

const i = (verdi: string): string => verdi // identity helper for readability

export const KRITERIE_DEFINISJONER: Record<KriterieType, KriterieDefinisjon> = {
  OPPRETTET_I_PERIODE: {
    type: 'OPPRETTET_I_PERIODE',
    visningsnavn: 'Opprettet i periode',
    gruppe: 'Tid',
    editor: 'PeriodeEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: true,
    defaultVerdi: () => ({ type: 'OPPRETTET_I_PERIODE', fom: '', tom: '' }),
  },
  FULLFORT_I_PERIODE: {
    type: 'FULLFORT_I_PERIODE',
    visningsnavn: 'Fullført i periode',
    gruppe: 'Tid',
    editor: 'PeriodeEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: true,
    defaultVerdi: () => ({ type: 'FULLFORT_I_PERIODE', fom: '', tom: '' }),
  },
  STOPPET_I_PERIODE: {
    type: 'STOPPET_I_PERIODE',
    visningsnavn: 'Stoppet i periode',
    gruppe: 'Tid',
    editor: 'PeriodeEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: true,
    defaultVerdi: () => ({ type: 'STOPPET_I_PERIODE', fom: '', tom: '' }),
  },
  SIST_KJORT_I_PERIODE: {
    type: 'SIST_KJORT_I_PERIODE',
    visningsnavn: 'Sist kjørt i periode',
    gruppe: 'Tid',
    editor: 'PeriodeEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: true,
    defaultVerdi: () => ({ type: 'SIST_KJORT_I_PERIODE', fom: '', tom: '' }),
  },
  HAR_STATUS: {
    type: 'HAR_STATUS',
    visningsnavn: 'Har behandlingsstatus',
    gruppe: 'Behandling',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'behandlingStatuser',
    verdiNokkel: 'statuser' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_STATUS', statuser: [] }),
  },
  HAR_PRIORITET: {
    type: 'HAR_PRIORITET',
    visningsnavn: 'Har prioritet',
    gruppe: 'Behandling',
    editor: 'MultiTallEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_PRIORITET', prioriteter: [] }),
  },
  HAR_ANSVARLIG_TEAM: {
    type: 'HAR_ANSVARLIG_TEAM',
    visningsnavn: 'Har ansvarlig team',
    gruppe: 'Behandling',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'ansvarligeTeam',
    verdiNokkel: 'team' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_ANSVARLIG_TEAM', team: [] }),
  },
  OPPRETTET_AV: {
    type: 'OPPRETTET_AV',
    visningsnavn: 'Opprettet av',
    gruppe: 'Behandling',
    editor: 'TagInputEditor',
    metadataNokkel: 'none',
    sensitiv: true,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'OPPRETTET_AV', identer: [] }),
  },
  ER_BATCH: {
    type: 'ER_BATCH',
    visningsnavn: 'Er batch-behandling',
    gruppe: 'Behandling',
    editor: 'ToggleEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'ER_BATCH', verdi: true }),
  },
  TILHORER_BEHANDLINGSSERIE: {
    type: 'TILHORER_BEHANDLINGSSERIE',
    visningsnavn: 'Tilhører behandlingsserie',
    gruppe: 'Behandling',
    editor: 'UuidEditor',
    metadataNokkel: 'none',
    sensitiv: true,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'TILHORER_BEHANDLINGSSERIE', uuid: '' }),
  },
  HAR_AKTIVITET_AV_TYPE: {
    type: 'HAR_AKTIVITET_AV_TYPE',
    visningsnavn: 'Har aktivitet av type',
    gruppe: 'Aktiviteter',
    editor: 'MultiSelectMedOperatorEditor',
    metadataNokkel: 'aktivitetTyper',
    verdiNokkel: 'aktivitetTyper' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_AKTIVITET_AV_TYPE', aktivitetTyper: [], operator: 'OR' }),
  },
  AKTIVITET_KJORT_FLERE_GANGER_ENN: {
    type: 'AKTIVITET_KJORT_FLERE_GANGER_ENN',
    visningsnavn: 'Aktivitet kjørt flere ganger enn',
    gruppe: 'Aktiviteter',
    editor: 'TallEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'AKTIVITET_KJORT_FLERE_GANGER_ENN', terskel: 1 }),
  },
  HAR_AAPEN_MANUELL_BEHANDLING: {
    type: 'HAR_AAPEN_MANUELL_BEHANDLING',
    visningsnavn: 'Har åpen manuell behandling',
    gruppe: 'Aktiviteter',
    editor: 'CheckboxEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_AAPEN_MANUELL_BEHANDLING' }),
  },
  HAR_AAPEN_BREVBESTILLING: {
    type: 'HAR_AAPEN_BREVBESTILLING',
    visningsnavn: 'Har åpen brevbestilling',
    gruppe: 'Aktiviteter',
    editor: 'CheckboxEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_AAPEN_BREVBESTILLING' }),
  },
  HAR_FEILET_KJORING: {
    type: 'HAR_FEILET_KJORING',
    visningsnavn: 'Har feilet kjøring',
    gruppe: 'Behandling',
    editor: 'ValgfriDatoEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'HAR_FEILET_KJORING', siden: null }),
  },
  KRAVHODE_HAR_STATUS: {
    type: 'KRAVHODE_HAR_STATUS',
    visningsnavn: 'Kravhode har status',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'kravStatuser',
    verdiNokkel: 'statuser' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KRAVHODE_HAR_STATUS', statuser: [] }),
  },
  KRAVHODE_HAR_KONTROLLPUNKT: {
    type: 'KRAVHODE_HAR_KONTROLLPUNKT',
    visningsnavn: 'Kravhode har kontrollpunkt',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectMedOperatorEditor',
    metadataNokkel: 'kontrollpunktTyper',
    verdiNokkel: 'kontrollpunktTyper' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KRAVHODE_HAR_KONTROLLPUNKT', kontrollpunktTyper: [], operator: 'OR' }),
  },
  KRAVHODE_HAR_BEHANDLINGTYPE: {
    type: 'KRAVHODE_HAR_BEHANDLINGTYPE',
    visningsnavn: 'Kravhode har behandlingstype',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'kravhodeBehandlingTyper',
    verdiNokkel: 'behandlingTyper' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KRAVHODE_HAR_BEHANDLINGTYPE', behandlingTyper: [] }),
  },
  KONTROLLPUNKT_ER_KRITISK: {
    type: 'KONTROLLPUNKT_ER_KRITISK',
    visningsnavn: 'Kontrollpunkt er kritisk',
    gruppe: 'Krav & sak',
    editor: 'CheckboxEditor',
    metadataNokkel: 'none',
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KONTROLLPUNKT_ER_KRITISK' }),
  },
  KRAV_GJELDER: {
    type: 'KRAV_GJELDER',
    visningsnavn: 'Krav gjelder',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'kravGjelderKoder',
    verdiNokkel: 'koder' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KRAV_GJELDER', koder: [] }),
  },
  SAK_HAR_TYPE: {
    type: 'SAK_HAR_TYPE',
    visningsnavn: 'Sak har type',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'sakstyper',
    verdiNokkel: 'sakstyper' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'SAK_HAR_TYPE', sakstyper: [] }),
  },
  KRAV_HAR_EIERENHET: {
    type: 'KRAV_HAR_EIERENHET',
    visningsnavn: 'Krav har eierenhet',
    gruppe: 'Krav & sak',
    editor: 'MultiSelectEditor',
    metadataNokkel: 'eierenheter',
    verdiNokkel: 'eierenheter' as keyof Kriterium,
    sensitiv: false,
    tidsfilter: false,
    defaultVerdi: () => ({ type: 'KRAV_HAR_EIERENHET', eierenheter: [] }),
  },
}

export const ALLE_KRITERIE_TYPER: KriterieType[] = Object.keys(KRITERIE_DEFINISJONER) as KriterieType[]

export function erKjentKriterieType(s: string): s is KriterieType {
  return s in KRITERIE_DEFINISJONER
}

export function isSensitiv(k: Kriterium): boolean {
  return KRITERIE_DEFINISJONER[k.type].sensitiv
}

export function harTidsfilter(kriterier: Kriterium[]): boolean {
  return kriterier.some((k) => KRITERIE_DEFINISJONER[k.type].tidsfilter)
}

/* ──────────────────── Validering ──────────────────── */

export const NAV_IDENT_REGEX = /^[A-Za-z0-9_.]{1,32}$/
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const ISO_DATO_REGEX = /^\d{4}-\d{2}-\d{2}$/

export type Valideringsfeil = {
  /** Indeks i kriterier-array. */
  kriterieIndeks: number
  /** Felt i kriteriet (for fokusering). */
  felt?: string
  melding: string
}

export type ValideringsResultat = {
  feil: Valideringsfeil[]
  manglerTidsfilter: boolean
}

export function parseStrictIsoDate(s: string): Date | null {
  if (!ISO_DATO_REGEX.test(s)) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null
  return date
}

export function maanederMellom(fom: Date, tom: Date): number {
  const aar = tom.getFullYear() - fom.getFullYear()
  const mnd = tom.getMonth() - fom.getMonth()
  const dag = tom.getDate() < fom.getDate() ? -1 : 0
  return aar * 12 + mnd + dag
}

export function validerKriterier(kriterier: Kriterium[]): ValideringsResultat {
  const feil: Valideringsfeil[] = []
  const manglerTidsfilter = !harTidsfilter(kriterier)

  kriterier.forEach((k, idx) => {
    const definisjon = KRITERIE_DEFINISJONER[k.type]
    if (definisjon.tidsfilter && 'fom' in k && 'tom' in k) {
      const fomD = parseStrictIsoDate(k.fom)
      const tomD = parseStrictIsoDate(k.tom)
      if (!fomD) feil.push({ kriterieIndeks: idx, felt: 'fom', melding: 'Fra-dato mangler eller er ugyldig' })
      if (!tomD) feil.push({ kriterieIndeks: idx, felt: 'tom', melding: 'Til-dato mangler eller er ugyldig' })
      if (fomD && tomD) {
        if (fomD > tomD)
          feil.push({ kriterieIndeks: idx, felt: 'tom', melding: 'Til-dato må være på eller etter fra-dato' })
        else if (maanederMellom(fomD, tomD) > 24)
          feil.push({ kriterieIndeks: idx, felt: 'tom', melding: 'Periode kan ikke være lengre enn 24 måneder' })
      }
    }

    if (k.type === 'OPPRETTET_AV') {
      if (k.identer.length === 0)
        feil.push({ kriterieIndeks: idx, felt: 'identer', melding: 'Minst én ident må fylles inn' })
      k.identer.forEach((ident) => {
        if (!NAV_IDENT_REGEX.test(ident))
          feil.push({ kriterieIndeks: idx, felt: 'identer', melding: `Ugyldig ident: ${i(ident)}` })
      })
    }

    if (k.type === 'TILHORER_BEHANDLINGSSERIE' && !UUID_REGEX.test(k.uuid)) {
      feil.push({
        kriterieIndeks: idx,
        felt: 'uuid',
        melding: 'UUID må være på formatet xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      })
    }

    if (k.type === 'HAR_FEILET_KJORING' && k.siden) {
      if (!parseStrictIsoDate(k.siden)) {
        feil.push({ kriterieIndeks: idx, felt: 'siden', melding: '«Siden»-dato må være gyldig' })
      }
    }

    if (k.type === 'HAR_AKTIVITET_AV_TYPE' && k.aktivitetTyper.length === 0) {
      feil.push({ kriterieIndeks: idx, felt: 'aktivitetTyper', melding: 'Velg minst én aktivitetstype' })
    }

    if (k.type === 'KRAVHODE_HAR_KONTROLLPUNKT' && k.kontrollpunktTyper.length === 0) {
      feil.push({ kriterieIndeks: idx, felt: 'kontrollpunktTyper', melding: 'Velg minst ett kontrollpunkt' })
    }

    if (k.type === 'AKTIVITET_KJORT_FLERE_GANGER_ENN' && (!Number.isInteger(k.terskel) || k.terskel < 0)) {
      feil.push({ kriterieIndeks: idx, felt: 'terskel', melding: 'Terskel må være et heltall ≥ 0' })
    }
  })

  return { feil, manglerTidsfilter }
}
