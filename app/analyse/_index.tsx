import { redirect } from 'react-router'
import type { Route } from './+types/_index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/ytelse/nokkeltall${url.search}`)
}
