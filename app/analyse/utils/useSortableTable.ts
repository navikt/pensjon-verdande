import { useMemo, useState } from 'react'

type SortDirection = 'ascending' | 'descending'

export type SortState = {
  orderBy: string
  direction: SortDirection
}

/**
 * Generisk hook for sorterbare tabeller.
 * Returnerer sort-state, handler og sortert data for bruk med @navikt/ds-react Table.
 */
export function useSortableTable<T>(
  data: T[],
  defaultSortKey: string,
  defaultDirection: SortDirection = 'descending',
  getValue: (item: T, key: string) => number | string | null,
) {
  const [sort, setSort] = useState<SortState>({ orderBy: defaultSortKey, direction: defaultDirection })

  function handleSort(sortKey: string) {
    setSort((prev) =>
      prev.orderBy === sortKey
        ? { orderBy: sortKey, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' }
        : { orderBy: sortKey, direction: 'descending' },
    )
  }

  const sorted = useMemo(() => {
    const copy = [...data]
    copy.sort((a, b) => {
      const aVal = getValue(a, sort.orderBy)
      const bVal = getValue(b, sort.orderBy)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
      return sort.direction === 'ascending' ? cmp : -cmp
    })
    return copy
  }, [data, sort, getValue])

  return { sort, handleSort, sorted }
}
