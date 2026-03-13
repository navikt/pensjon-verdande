import { redirect } from 'react-router'
import type { Route } from './+types/dimensjoner-index'

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  throw redirect(`/analyse/dimensjoner/teamytelse${url.search}`)
}
