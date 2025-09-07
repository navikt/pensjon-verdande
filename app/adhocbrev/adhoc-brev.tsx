import { type ActionFunctionArgs, Form, redirect, } from 'react-router'
import { useRef, } from 'react'
import { BodyShort, Select, VStack } from '@navikt/ds-react'
import { requireAccessToken } from '~/services/auth.server'
import { opprettAdhocBrevBehandling } from '~/adhocbrev/adhoc-brev.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettAdhocBrevBehandling(accessToken, updates.brevmal as string, updates.ekskluderAvdoed === 'true')

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function AdhocBrev() {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <h1>Opprett ADHOC Brevbestilling batchkjøring på brevmal for sak</h1>
      <Form method="post" style={{width: '25em'}}>
        <VStack gap={"4"}>
        <BodyShort style={{ fontWeight: 'bold' }}>
          Brevmal kode for Sak:
        </BodyShort>
          <input
            ref={inputRef}
            defaultValue="ERSTATT MED BREVMAL KODE"
            aria-label="Brevmal"
            name="brevmal"
            type="text"
            placeholder="Brevmal"
            style={{ width: 'auto' }}
          />
          <Select
            label="Ekskluder avdøde"
            size={'small'}
            name={'ekskluderAvdoed'}
            defaultValue={'true'}
            style={{ maxWidth: '5em' }}
          >
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <button type="submit">
            Opprett
          </button>
        </VStack>
      </Form>
    </div>
  )
}
