// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSortableTable } from './useSortableTable'

type TestItem = { name: string; count: number; optional?: number | null }

const testData: TestItem[] = [
  { name: 'Bravo', count: 10 },
  { name: 'Alpha', count: 30 },
  { name: 'Charlie', count: 20 },
]

const getValue = (item: TestItem, key: string): number | string | null => {
  switch (key) {
    case 'name':
      return item.name
    case 'count':
      return item.count
    case 'optional':
      return item.optional ?? null
    default:
      return null
  }
}

describe('useSortableTable', () => {
  it('sorterer med default key og retning', () => {
    const { result } = renderHook(() => useSortableTable(testData, 'count', 'descending', getValue))
    expect(result.current.sorted.map((d) => d.count)).toEqual([30, 20, 10])
    expect(result.current.sort).toEqual({ orderBy: 'count', direction: 'descending' })
  })

  it('sorterer ascending som default', () => {
    const { result } = renderHook(() => useSortableTable(testData, 'count', 'ascending', getValue))
    expect(result.current.sorted.map((d) => d.count)).toEqual([10, 20, 30])
  })

  it('sorterer strenger med localeCompare', () => {
    const { result } = renderHook(() => useSortableTable(testData, 'name', 'ascending', getValue))
    expect(result.current.sorted.map((d) => d.name)).toEqual(['Alpha', 'Bravo', 'Charlie'])
  })

  it('toggler retning ved klikk på samme kolonne', () => {
    const { result } = renderHook(() => useSortableTable(testData, 'count', 'descending', getValue))
    expect(result.current.sort.direction).toBe('descending')

    act(() => {
      result.current.handleSort('count')
    })
    expect(result.current.sort.direction).toBe('ascending')
    expect(result.current.sorted.map((d) => d.count)).toEqual([10, 20, 30])

    act(() => {
      result.current.handleSort('count')
    })
    expect(result.current.sort.direction).toBe('descending')
  })

  it('bytter til descending ved klikk på ny kolonne', () => {
    const { result } = renderHook(() => useSortableTable(testData, 'count', 'ascending', getValue))

    act(() => {
      result.current.handleSort('name')
    })
    expect(result.current.sort).toEqual({ orderBy: 'name', direction: 'descending' })
    expect(result.current.sorted.map((d) => d.name)).toEqual(['Charlie', 'Bravo', 'Alpha'])
  })

  it('plasserer null-verdier sist', () => {
    const dataWithNulls: TestItem[] = [
      { name: 'A', count: 1, optional: null },
      { name: 'B', count: 2, optional: 5 },
      { name: 'C', count: 3, optional: 3 },
    ]
    const { result } = renderHook(() => useSortableTable(dataWithNulls, 'optional', 'ascending', getValue))
    expect(result.current.sorted.map((d) => d.optional ?? null)).toEqual([3, 5, null])
  })

  it('plasserer null-verdier sist også ved descending', () => {
    const dataWithNulls: TestItem[] = [
      { name: 'A', count: 1, optional: null },
      { name: 'B', count: 2, optional: 5 },
      { name: 'C', count: 3, optional: 3 },
    ]
    const { result } = renderHook(() => useSortableTable(dataWithNulls, 'optional', 'descending', getValue))
    expect(result.current.sorted.map((d) => d.optional ?? null)).toEqual([5, 3, null])
  })

  it('håndterer tom liste', () => {
    const { result } = renderHook(() => useSortableTable([] as TestItem[], 'count', 'descending', getValue))
    expect(result.current.sorted).toEqual([])
  })

  it('muterer ikke opprinnelig data', () => {
    const original = [...testData]
    renderHook(() => useSortableTable(testData, 'count', 'ascending', getValue))
    expect(testData).toEqual(original)
  })
})
