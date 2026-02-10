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
import { opprettAvstemmingGrensesnittBehandling } from '~/avstemming/avstemming.server'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { requireAccessToken } from '~/services/auth.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { Route } from './+types/avstemming'

const behandlingType = 'AvstemmingGrensesnittBehandling'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Avstemming | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
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

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const PENAFP = (formData.get('PENAFP') as string) === 'true'
  const PENAFPP = (formData.get('PENAFPP') as string) === 'true'
  const PENAP = (formData.get('PENAP') as string) === 'true'
  const PENBP = (formData.get('PENBP') as string) === 'true'
  const PENGJ = (formData.get('PENGJ') as string) === 'true'
  const PENGY = (formData.get('PENGY') as string) === 'true'
  const PENKP = (formData.get('PENKP') as string) === 'true'
  const PENUP = (formData.get('PENUP') as string) === 'true'
  const UFOREUT = (formData.get('UFOREUT') as string) === 'true'
  const avstemmingsperiodeStart = formData.get('fom') as string
  const avstemmingsperiodeEnd = formData.get('tom') as string
  const accessToken = await requireAccessToken(request)

  await opprettAvstemmingGrensesnittBehandling(
    accessToken,
    PENAFP,
    PENAFPP,
    PENAP,
    PENBP,
    PENGJ,
    PENGY,
    PENKP,
    PENUP,
    UFOREUT,
    avstemmingsperiodeStart,
    avstemmingsperiodeEnd,
  )

  return
}

function areDatesValid(dateFom: string, dateTom: string) {
  if (
    // Sjekk at format er YYYY-MM-DD
    !dateFom.match(/\d{4}-\d{2}-\d{2}/) ||
    !dateTom.match(/\d{4}-\d{2}-\d{2}/)
  ) {
    return false
  }

  const today = new Date()
  const minimumDate = new Date(new Date().setFullYear(today.getFullYear() - 1))
  const inputFom = new Date(dateFom)
  const inputTom = new Date(dateTom)

  // Sjekk at input er gyldig dato
  if (!Number.isNaN(inputFom.getTime()) && !Number.isNaN(inputTom.getTime())) {
    // Sjekk at dato ikke er for langt tilbake i tid
    if (inputFom < minimumDate) {
      return false
    } else if (inputFom > today) {
      // Sjekk at ikke i framtiden
      return false
    } else return inputFom <= inputTom // Sjekk at ikke fom er etter tom
  } else {
    return false
  }
}

export default function Avstemming({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  const [avstemmingsperiodeStart, setAvstemmingsperiodeStart] = useState<string | ''>('')
  const [avstemmingsperiodeEnd, setAvstemmingsperiodeEnd] = useState<string | ''>('')

  return (
    <VStack gap={'4'}>
      <Box.New className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Opprett avstemming
        </Heading>
        <VStack gap="2">
          <BodyLong>Oppretter behandlinger for grensesnittavstemming mot Oppdrag</BodyLong>
          <Detail>
            Avstemmingsperiode fom settes til starten av angitt dag. Avstemmingsperiode tom settes til slutten av angitt
            dag. For å avstemme for én dag skal altså fom og tom være satt til samme dag.
          </Detail>
        </VStack>
      </Box.New>

      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'4'}>
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
            <Checkbox name={'PENGJ'} value={'true'} defaultChecked={true}>
              PENGJ
            </Checkbox>
            <Checkbox name={'PENGY'} value={'true'} defaultChecked={true}>
              PENGY
            </Checkbox>
            <Checkbox name={'PENKP'} value={'true'} defaultChecked={true}>
              PENKP
            </Checkbox>
            <Checkbox name={'PENUP'} value={'true'} defaultChecked={true}>
              PENUP
            </Checkbox>
            <Checkbox name={'UFOREUT'} value={'true'} defaultChecked={true}>
              UFOREUT
            </Checkbox>
          </CheckboxGroup>
          <TextField
            label="Avstemmingsperiode fom:"
            name="fom"
            type="text"
            description={'(ÅÅÅÅ-MM-DD)'}
            onChange={(e) => {
              const v = e.currentTarget.value
              setAvstemmingsperiodeStart(v === '' ? '' : v)
            }}
            value={avstemmingsperiodeStart}
          />
          <TextField
            label="Avstemmingsperiode tom:"
            name="tom"
            type="text"
            description={'(ÅÅÅÅ-MM-DD)'}
            onChange={(e) => {
              const v = e.currentTarget.value
              setAvstemmingsperiodeEnd(v === '' ? '' : v)
            }}
            value={avstemmingsperiodeEnd}
          />
          <Button
            type="submit"
            disabled={
              avstemmingsperiodeStart === '' ||
              avstemmingsperiodeEnd === '' ||
              !areDatesValid(avstemmingsperiodeStart, avstemmingsperiodeEnd)
            }
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
