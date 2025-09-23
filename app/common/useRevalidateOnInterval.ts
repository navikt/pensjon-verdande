import { useEffect } from 'react'
import { useFetchers, useRevalidator } from 'react-router'

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
}: {
  enabled?: boolean
  interval?: number
}) {
  const fetchers = useFetchers()

  const revalidate = useRevalidator()
  useEffect(
    function revalidateOnInterval() {
      if (!enabled) return
      if (fetchers.map((fetcher) => fetcher.state).includes('loading')) return
      const intervalId = setInterval(revalidate.revalidate, interval)
      return () => clearInterval(intervalId)
    },
    [enabled, fetchers, interval, revalidate],
  )
}
