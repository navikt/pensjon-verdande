import { redirect } from 'react-router'
import type { Route } from './+types/alderspensjon-index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/alderspensjon/mottakere${url.search}`)
}
