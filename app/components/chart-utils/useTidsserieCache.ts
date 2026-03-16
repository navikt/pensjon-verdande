import { useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'

type TidsserieResponseLike = { datapunkter: unknown[] }

export function useTidsserieCache<TDatapunkt, TResponse extends TidsserieResponseLike>(
  defaultDatapunkter: TDatapunkt[],
  apiPath: string,
  defaultAntallTimer: number,
) {
  const [antallTimer, setAntallTimer] = useState(defaultAntallTimer)
  const fetcher = useFetcher<TResponse>()
  const [cache, setCache] = useState<Map<number, TDatapunkt[]>>(
    () => new Map([[defaultAntallTimer, defaultDatapunkter]]),
  )
  const pendingKeyRef = useRef<number | null>(null)
  const fetcherLoad = fetcher.load

  useEffect(() => {
    setCache((prev) => new Map(prev).set(defaultAntallTimer, defaultDatapunkter))
  }, [defaultDatapunkter, defaultAntallTimer])

  useEffect(() => {
    if (!cache.has(antallTimer)) {
      pendingKeyRef.current = antallTimer
      fetcherLoad(`${apiPath}?timer=${antallTimer}`)
    }
  }, [antallTimer, fetcherLoad, cache, apiPath])

  useEffect(() => {
    if (fetcher.data && 'datapunkter' in fetcher.data && fetcher.state === 'idle' && pendingKeyRef.current !== null) {
      const key = pendingKeyRef.current
      pendingKeyRef.current = null
      setCache((prev) => new Map(prev).set(key, (fetcher.data as TResponse).datapunkter as TDatapunkt[]))
    }
  }, [fetcher.data, fetcher.state])

  const datapunkter = cache.get(antallTimer) ?? defaultDatapunkter
  const isLoading = fetcher.state === 'loading' && !cache.has(antallTimer)

  return { antallTimer, setAntallTimer, datapunkter, isLoading }
}
