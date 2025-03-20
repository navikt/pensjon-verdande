import { useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'


export function useRevalidateOnInterval({ enabled = false, interval = 1000 }: { enabled?: boolean; interval?: number }) {
  let revalidate = useRevalidator()
  useEffect(function revalidateOnInterval() {
    if (!enabled) return
    let intervalId = setInterval(revalidate.revalidate, interval)
    return () => clearInterval(intervalId)
  }, [enabled, interval, revalidate])
}
