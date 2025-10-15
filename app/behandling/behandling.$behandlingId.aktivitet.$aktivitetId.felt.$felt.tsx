import type { LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import invariant from 'tiny-invariant'
import xmlFormat from 'xml-formatter'
import { replaceTemplates } from '~/common/replace-templates'
import { apiGetRawStringOrUndefined } from '~/services/api.server'

const AKSEPTERTE_FELTER = ['input', 'message', 'output'] as const

const erAkseptertFelt = (x: unknown): x is (typeof AKSEPTERTE_FELTER)[number] =>
  typeof x === 'string' && (AKSEPTERTE_FELTER as readonly string[]).includes(x)

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
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

export default function Felt() {
  const { value } = useLoaderData<typeof loader>()
  console.log(value)

  try {
    if (!value) {
      return <pre></pre>
    } else if (value.startsWith('<?xml')) {
      console.log(value.substring(0, 10))
      return <pre>{xmlFormat(value)}</pre>
    } else {
      console.log(value.substring(0, 10))
      return <pre>{JSON.stringify(value, null, 2)}</pre>
    }
  } catch (_error) {
    return <pre>{value}</pre>
  }
}
