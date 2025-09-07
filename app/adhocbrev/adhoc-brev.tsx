import { BodyLong, Box, Button, Heading, Select, Skeleton, TextField, VStack } from '@navikt/ds-react'
import { Suspense, useRef, useState } from 'react'
import {
  type ActionFunctionArgs,
  Await,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router'
import { opprettAdhocBrevBehandling } from '~/adhocbrev/adhoc-brev.server'
import { decodeBehandling } from '~/common/decodeBehandling'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'

const behandlingType = 'AdhocBrevBestillingBatchBehandling'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)

  const behandlinger = getBehandlinger(accessToken, {
    behandlingType: behandlingType,
    page: page ? +page : 0,
    size: size ? +size : 5,
    sort: searchParams.get('sort'),
  })

  return {
    behandlinger,
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const updates = Object.fromEntries(formData)
  const accessToken = await requireAccessToken(request)

  const response = await opprettAdhocBrevBehandling(
    accessToken,
    updates.brevmal as string,
    updates.ekskluderAvdoed === 'true',
  )

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function AdhocBrev() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const inputRef = useRef<HTMLInputElement>(null)
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const [brevmal, setBrevmal] = useState<string | ''>('')
  const [eksluderAvdod, setEksluderAvdod] = useState<string>('')

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Opprett ad-hoc brevbestilling
        </Heading>
        <BodyLong>
          <p>
            Oppretter brevbestillinger med oppgitt brevmal for verdiene angitt i tabellen{' '}
            <code>PEN.T_ADHOC_BREVBESTILLING</code>.
          </p>

          <p>
            Det er viktig at man ikke endrer innholdet i tabellen før uttrekksteget i{' '}
            <i>{decodeBehandling(behandlingType)} behandlingen</i> er gjennomført
          </p>
        </BodyLong>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <TextField
            label={'Brevmal kode for Sak:'}
            ref={inputRef}
            defaultValue=""
            name="brevmal"
            type="text"
            placeholder="Brevmal"
            onChange={(e) => {
              const v = e.currentTarget.value
              setBrevmal(v === '' ? '' : v)
            }}
            value={brevmal}
          />
          <Select
            label="Ekskluder avdøde"
            name={'ekskluderAvdoed'}
            defaultValue={'true'}
            onChange={(e) => setEksluderAvdod(e.target.value)}
            value={eksluderAvdod ?? ''}
          >
            <option value="" disabled>
              Velg
            </option>
            <option value="true">Ja</option>
            <option value="false">Nei</option>
          </Select>
          <Button type="submit" disabled={brevmal === '' || eksluderAvdod === '' || isSubmitting}>
            {isSubmitting ? 'Oppretter…' : 'Opprett'}
          </Button>
        </VStack>
      </Form>

      <Heading level={'2'} size={'medium'} style={{ marginTop: '2em' }}>
        Eksisterende ad-hoc brevbestillinger
      </Heading>
      <Suspense fallback={<Skeleton variant="rectangle" width="100%" height={407} />}>
        <Await resolve={behandlinger}>
          {(it) => (
            <BehandlingerTable
              inkluderFortsett={false}
              visStatusSoek={false}
              visAnsvarligTeamSoek={false}
              visBehandlingTypeSoek={false}
              behandlingerResponse={it}
            />
          )}
        </Await>
      </Suspense>
    </VStack>
  )
}
