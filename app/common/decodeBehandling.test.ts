import { expect, test } from 'vitest'
import { decodeBehandling } from '~/common/decodeBehandling'

test('deler opp på store bokstaver', () => {
  expect(decodeBehandling('EtLangNavnBehandling')).toBe('Et lang navn')
})

test('beholder forkortelser samlet', () => {
  expect(decodeBehandling('EtLangNavnAFPBehandling')).toBe('Et lang navn AFP')
})

test('støtter æøå', () => {
  expect(decodeBehandling('HentLøpendeUføretrygdBehandling')).toBe('Hent løpende uføretrygd')
})
