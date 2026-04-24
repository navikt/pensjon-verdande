import { beforeEach, describe, expect, it } from 'vitest'
import type { Kriterium } from './kriterier'
import { fjernSensitive, hentSensitive, lagreSensitive, tomAlleSensitive } from './sensitive-state'

// Minimal in-memory sessionStorage for node test-miljø.
class MemoryStorage {
  private store: Record<string, string> = {}
  getItem(k: string) {
    return Object.hasOwn(this.store, k) ? this.store[k] : null
  }
  setItem(k: string, v: string) {
    this.store[k] = v
  }
  removeItem(k: string) {
    delete this.store[k]
  }
  clear() {
    this.store = {}
  }
  key(i: number) {
    return Object.keys(this.store)[i] ?? null
  }
  get length() {
    return Object.keys(this.store).length
  }
}

// biome-ignore lint/suspicious/noExplicitAny: stub window for node-tests
const g = globalThis as any
g.window = g.window ?? {}
g.window.sessionStorage = new MemoryStorage()

describe('sensitive-state (sessionStorage)', () => {
  beforeEach(() => {
    tomAlleSensitive()
  })

  it('returnerer tom liste når ingenting er lagret', () => {
    expect(hentSensitive('hash1')).toEqual([])
  })

  it('lagrer og henter sensitive kriterier per query-hash', () => {
    const k: Kriterium[] = [{ type: 'OPPRETTET_AV', identer: ['Z990123'] }]
    lagreSensitive('hash1', k)
    expect(hentSensitive('hash1')).toEqual(k)
    expect(hentSensitive('hash2')).toEqual([])
  })

  it('lagring av tom liste fjerner entry', () => {
    lagreSensitive('hash1', [{ type: 'OPPRETTET_AV', identer: ['Z990123'] }])
    lagreSensitive('hash1', [])
    expect(hentSensitive('hash1')).toEqual([])
  })

  it('fjernSensitive sletter spesifikk hash', () => {
    lagreSensitive('hash1', [{ type: 'OPPRETTET_AV', identer: ['Z990123'] }])
    lagreSensitive('hash2', [{ type: 'OPPRETTET_AV', identer: ['Z990456'] }])
    fjernSensitive('hash1')
    expect(hentSensitive('hash1')).toEqual([])
    expect(hentSensitive('hash2')).not.toEqual([])
  })

  it('begrenser til 20 mest nylige entries', () => {
    for (let i = 0; i < 25; i++) {
      lagreSensitive(`hash${i}`, [{ type: 'OPPRETTET_AV', identer: [`Z${i}`] }])
    }
    // De 5 eldste skal være borte
    expect(hentSensitive('hash0')).toEqual([])
    expect(hentSensitive('hash24')).not.toEqual([])
  })
})
