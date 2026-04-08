import type { AutoBrevOppsummering } from './index'

const NULL_TOKEN = '__NULL__'
const KEY_SEP = '\u001F'

function encodeValue(v: string | null): string {
  return v ?? NULL_TOKEN
}

/** Nøkkel som identifiserer visuelt like rader — brukes for sammenslåing og som React key */
export function brevRowKey(r: AutoBrevOppsummering): string {
  return [r.behandlingstype, r.brevkode, r.brevnavn, r.brevType].map((v) => encodeValue(v ?? null)).join(KEY_SEP)
}

/** Slår sammen rader med lik visuell identitet og summerer antall */
export function mergeRows(rows: AutoBrevOppsummering[]): AutoBrevOppsummering[] {
  const merged = new Map<string, AutoBrevOppsummering>()
  for (const r of rows) {
    const key = brevRowKey(r)
    const existing = merged.get(key)
    if (existing) {
      existing.antall += r.antall
    } else {
      merged.set(key, { ...r })
    }
  }
  return [...merged.values()]
}
