import { expect, test } from 'vitest'
import { decodeBehandling } from '~/common/decodeBehandling'

test('deler opp på store bokstaver', () => {
  expect(decodeBehandling('EtLangNavnBehandling')).toBe('Et Lang Navn')
})

test('beholder forkortelser samlet', () => {
  expect(decodeBehandling('EtLangNavnAFPBehandling')).toBe('Et Lang Navn AFP')
})

test('støtter æøå', () => {
  expect(decodeBehandling('HentLøpendeUføretrygdBehandling')).toBe('Hent Løpende Uføretrygd')
})
