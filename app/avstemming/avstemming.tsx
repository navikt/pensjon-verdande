import { BodyLong, Box, Button, DatePicker, Heading, Skeleton, TextField, VStack } from '@navikt/ds-react'
import { Suspense, useState } from 'react'
import {
  type ActionFunctionArgs,
  Await,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router'
import { opprettAvstemmingGrensesnittBehandling } from '~/avstemming/avstemming.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'

const behandlingType = 'AvstemmingGrensesnittBehandling'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)

  const behandlinger = getBehandlinger(accessToken, {
    behandlingType: behandlingType,
    page: page ? +page : 0,
    size: size ? +size : 10,
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

  const response = await opprettAvstemmingGrensesnittBehandling(
    accessToken,
    updates.underkomponentKode as string,
    updates.avstemmingsperiodeStart as string,
    updates.avstemmingsperiodeEnd as string,
  )

  return redirect(`/behandling/${response.behandlingId}`)
}

export default function Avstemming() {
  const { behandlinger } = useLoaderData<typeof loader>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'
  const [underkomponentKode, setUnderkomponentKode] = useState<string | ''>('')

  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const day = new Date().getDate()
  const defaultAvstemmingsdato = new Date(`${month} ${day - 1} ${year}`)
  const [avstemmingsperiodeStart, setAvstemmingsperiodeStart] = useState<Date | undefined>(defaultAvstemmingsdato)
  const [avstemmingsperiodeEnd, setAvstemmingsperiodeEnd] = useState<Date | undefined>(defaultAvstemmingsdato)

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Opprett avstemming
        </Heading>
        <VStack gap="2">
          <BodyLong>Oppretter avstemming mot Oppdrag</BodyLong>
        </VStack>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
          <TextField
            label="Underkomponent-kode:"
            name="underkomponentKode"
            type="text"
            placeholder="PENAP"
            onChange={(e) => {
              const v = e.currentTarget.value
              setUnderkomponentKode(v === '' ? '' : v)
            }}
            value={underkomponentKode}
          />
          Avstemmingsperiode start (fom):
          <DatePicker.Standalone
            selected={avstemmingsperiodeStart}
            today={defaultAvstemmingsdato}
            onSelect={setAvstemmingsperiodeStart}
            fromDate={new Date(`1 Jan ${year - 1}`)}
            toDate={defaultAvstemmingsdato}
            dropdownCaption
          />
          Avstemmingsperiode end (tom):
          <DatePicker.Standalone
            selected={avstemmingsperiodeEnd}
            today={defaultAvstemmingsdato}
            onSelect={setAvstemmingsperiodeEnd}
            fromDate={new Date(`1 Jan ${year - 1}`)}
            toDate={defaultAvstemmingsdato}
            dropdownCaption
          />
          <Button
            type="submit"
            disabled={
              underkomponentKode === '' || avstemmingsperiodeStart === undefined || avstemmingsperiodeEnd === undefined
            }
            loading={isSubmitting}
          >
            Opprett avstemming-behandling
          </Button>
        </VStack>
      </Form>

      <Heading level="2" size="medium" style={{ marginTop: '2em' }}>
        Eksisterende avstemminger
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
