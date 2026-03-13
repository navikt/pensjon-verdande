import { redirect } from 'react-router'
import type { Route } from './+types/aktiviteter-index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/aktiviteter-og-tid/aktivitetsvarighet${url.search}`)
}
