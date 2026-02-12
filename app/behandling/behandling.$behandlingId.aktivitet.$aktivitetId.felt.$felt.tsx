import invariant from 'tiny-invariant'
import xmlFormat from 'xml-formatter'
import { replaceTemplates } from '~/common/replace-templates'
import { apiGetRawStringOrUndefined } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.aktivitet.$aktivitetId.felt.$felt'

const AKSEPTERTE_FELTER = ['input', 'message', 'output'] as const

const erAkseptertFelt = (x: unknown): x is (typeof AKSEPTERTE_FELTER)[number] =>
  typeof x === 'string' && (AKSEPTERTE_FELTER as readonly string[]).includes(x)

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const { behandlingId, aktivitetId, felt } = params

  invariant(behandlingId, 'Mangler parameter behandlingId')
  invariant(aktivitetId, 'Mangler parameter aktivitetId')
  invariant(felt, 'Mangler parameter felt')

  if (!erAkseptertFelt(felt)) {
    throw new Error(`Ukjent felt '${String(felt)}'`)
  }

  const url = replaceTemplates('/api/behandling/{behandlingId}/aktivitet/{aktivitetId}/{felt}' as const, {
    behandlingId,
    aktivitetId,
    felt,
  })

  const value = await apiGetRawStringOrUndefined(url, request)

  return {
    value,
  }
}

export default function Felt({ loaderData }: Route.ComponentProps) {
  const { value } = loaderData

  try {
    if (!value) {
      return <pre></pre>
    } else if (value.startsWith('<?xml')) {
      return <pre>{xmlFormat(value)}</pre>
    } else {
      return <pre>{JSON.stringify(value, null, 2)}</pre>
    }
  } catch (_error) {
    return <pre>{value}</pre>
  }
}
