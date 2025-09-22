import { isAfter } from 'date-fns'
import { useMemo, useState } from 'react'

type OverrideSortFunc<T extends object> = Record<string, (a: T, b: T) => number>

interface Options {
  sortDecending?: boolean
}

function getA<Object extends object, Key extends keyof Object>(object: Object, path: Key) {
  return object[path]
}
export const defaultSortFunc =
  <T extends object>(sortPath: keyof T) =>
  (aObject: T, bObject: T): number => {
    const a = getA(aObject, sortPath)
    const b = getA(bObject, sortPath)

    if (a === b) return 0

    if (a instanceof Date || b instanceof Date) {
      const aDate = a as Date
      const bDate = b as Date

      if (aDate && !bDate) return -1
      if (!aDate && bDate) return 1
      return isAfter(aDate, bDate) ? 1 : -1
    }

    if (a && !b) return 1
    if (!a && b) return -1

    return a > b ? 1 : -1
  }

export const getSortFunc =
  <T extends object>(sortKey: keyof T, sortDecending: boolean, overrides: OverrideSortFunc<T>) =>
  (a: T, b: T) => {
    if (Object.keys(overrides).includes(sortKey as string)) {
      return getA(overrides, sortKey as string)(a, b) * (sortDecending ? -1 : 1)
    }
    return defaultSortFunc(sortKey)(a, b) * (sortDecending ? -1 : 1)
  }

/**
 * React Hook for sortering av data. Håndterer sortering stigende/synkende for (`number`, `string` og `Date`)
 *
 * @example
 * ```typescript
 * interface MinData {
 *  data: string
 *  antall: number
 * }
 * const minData = [
 *  {data: "en stk", number: 1, elementer: ["en"]},
 *  {data: "to stk", number: 2, elementer: ["en", "to"]}
 * ]
 *
 *  const overrides = {
 *    elementer: (a: MinData, b: MinData) => (
 *      // Sorterer på lenge av _elementer_ listen
 *      a.elementer.length > b.elementer.length ? 1 : -1
 *    )
 *  }
 *
 * const { sortFunc, sortKey, sortDecending, onSort } = useSort<IMinData>("data", overrides)
 *
 * const minSorterteData = minData.sort(sortFunc)
 * ```
 *
 * @param initialSortKey Key man starter å sortere på
 * @param overrides Objekt som inneholder overrides til spesifikke `sortKey`. Den er optional og dersom ingenting passeres inn så brukes bare standard sortering. Kan også brukes til å sortere på flere dataelementer da man får inn hele objektet `a` og `b`
 *
 * @returns Funksjon som kan brukes direkte i `.sort()` funksjonen til `Array`
 */
export const useSort = <T extends object>(
  initialSortKey: keyof T,
  overrides: OverrideSortFunc<T> = {},
  options: Options = {},
) => {
  const [sortKey, setSortKey] = useState<keyof T>(initialSortKey)
  const [sortDecending, setSortDecending] = useState<boolean>(options.sortDecending ?? true)

  const sortFunc = useMemo(() => getSortFunc<T>(sortKey, sortDecending, overrides), [sortKey, sortDecending, overrides])

  const onSort = (newSortKey?: string) => {
    if (!newSortKey) return
    if (sortKey === newSortKey) {
      setSortDecending(!sortDecending)
    } else {
      setSortKey(newSortKey as keyof T)
    }
  }

  return {
    sortFunc,
    sortKey,
    sortDecending,
    onSort,
  }
}
