import { redirect } from 'react-router'
import type { Route } from './+types/automatisering-index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/automatisering/oversikt${url.search}`)
}
