import { useFetchers, useRevalidator } from 'react-router';
import { useEffect } from 'react'


export function useRevalidateOnInterval({ enabled = false, interval = 1000 }: { enabled?: boolean; interval?: number }) {

  const fetchers = useFetchers()

  let revalidate = useRevalidator()
  useEffect(function revalidateOnInterval() {
    if (!enabled) return
    if(fetchers.map(fetcher => fetcher.state).includes('loading')) return
    let intervalId = setInterval(revalidate.revalidate, interval)
    return () => clearInterval(intervalId)
  }, [enabled, fetchers, interval, revalidate])
}
