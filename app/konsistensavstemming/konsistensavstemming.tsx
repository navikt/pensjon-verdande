import {
  BodyLong,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Detail,
  Heading,
  Skeleton,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { Suspense, useState } from 'react'
import { Await, Form, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { apiPost } from '~/services/api.server'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { Route } from './+types/konsistensavstemming'

const behandlingType = 'KonsistensavstemmingBehandling'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Konsistensavstemming | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const accessToken = await requireAccessToken(request)

  const behandlinger = getBehandlinger(accessToken, {
    behandlingType: behandlingType,
    page: page ? +page : 0,
    size: size ? +size : 9,
    sort: searchParams.get('sort'),
  })

  return {
    behandlinger,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const PENAFP = (formData.get('PENAFP') as string) === 'true'
  const PENAFPP = (formData.get('PENAFPP') as string) === 'true'
  const PENAP = (formData.get('PENAP') as string) === 'true'
  const PENBP = (formData.get('PENBP') as string) === 'true'
  const PENFP = (formData.get('PENFP') as string) === 'true'
  const PENGJ = (formData.get('PENGJ') as string) === 'true'
  const PENGY = (formData.get('PENGY') as string) === 'true'
  const PENKP = (formData.get('PENKP') as string) === 'true'
  const UFOREUT = (formData.get('UFOREUT') as string) === 'true'
  const avstemmingsdato = formData.get('avstemmingsdato') as string

  await apiPost('/api/vedtak/avstemming/konsistens/start', {
    penAfp: PENAFP,
    penAfpp: PENAFPP,
    penPenap: PENAP,
    penPenbp: PENBP,
    penPenfp: PENFP,
    penPengj: PENGJ,
    penPengy: PENGY,
    penPenkp: PENKP,
    penUforeut: UFOREUT,
    avstemmingsdato,
  }, request)

  return
}

function areDatesValid(dateFom: string) {
  if (
    // Sjekk at format er YYYY-MM
    !dateFom.match(/\d{4}-\d{2}/)
  ) {
    return false
  }

  const today = new Date()
  const minimumDate = new Date(new Date().setFullYear(today.getFullYear() - 1))
  const inputFom = new Date(dateFom)

  // Sjekk at input er gyldig dato
  if (!Number.isNaN(inputFom.getTime())) {
    // Sjekk at dato ikke er for langt tilbake i tid
    if (inputFom < minimumDate) {
      return false
    } else if (inputFom > today) {
      // Sjekk at ikke i framtiden
      return false
    } else {
      return true
    }
  } else {
    return false
  }
}

export default function Konsistensavstemming({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  const [avstemmingsdato, setAvstemmingsdato] = useState<string | ''>('')

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Opprett avstemming
        </Heading>
        <VStack gap="space-8">
          <BodyLong>Oppretter behandlinger for konsistensavstemming mot Oppdrag</BodyLong>
          <Detail>Avstemmingsperiode fom settes til starten av angitt måned.</Detail>
        </VStack>
      </Box>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <CheckboxGroup legend="Fagområder">
            <Checkbox name={'PENAFP'} value={'true'} defaultChecked={true}>
              PENAFP
            </Checkbox>
            <Checkbox name={'PENAFPP'} value={'true'} defaultChecked={true}>
              PENAFPP
            </Checkbox>
            <Checkbox name={'PENAP'} value={'true'} defaultChecked={true}>
              PENAP
            </Checkbox>
            <Checkbox name={'PENBP'} value={'true'} defaultChecked={true}>
              PENBP
            </Checkbox>
            <Checkbox name={'PENFP'} value={'true'} defaultChecked={true}>
              PENFP
            </Checkbox>
            <Checkbox name={'PENGJ'} value={'true'} defaultChecked={true}>
              PENGJ
            </Checkbox>
            <Checkbox name={'PENGY'} value={'true'} defaultChecked={true}>
              PENGY
            </Checkbox>
            <Checkbox name={'PENKP'} value={'true'} defaultChecked={true}>
              PENKP
            </Checkbox>
            <Checkbox name={'UFOREUT'} value={'true'} defaultChecked={true}>
              UFOREUT
            </Checkbox>
          </CheckboxGroup>
          <TextField
            label="Avstemmingsdato:"
            name="avstemmingsdato"
            type="text"
            description={'(ÅÅÅÅ-MM)'}
            onChange={(e) => {
              const v = e.currentTarget.value
              setAvstemmingsdato(v === '' ? '' : v)
            }}
            value={avstemmingsdato}
          />
          <Button
            type="submit"
            disabled={avstemmingsdato === '' || !areDatesValid(avstemmingsdato)}
            loading={isSubmitting}
          >
            Opprett avstemming-behandlinger
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
