import { PencilIcon } from '@navikt/aksel-icons'
import {
  Alert,
  BodyLong,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  HStack,
  Link,
  Skeleton,
  TextField,
  VStack,
} from '@navikt/ds-react'
import { Suspense, useState } from 'react'
import { Await, Form, useNavigation } from 'react-router'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { apiPost } from '~/services/api.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { Route } from './+types/egenerklaeringOmsorgspoeng'

const behandlingType = 'VedtakMedInnvilgetOmsorgspoengBatch'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'VedtakMedInnvilgetOmsorgspoengBatch | Verdande' }]
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size')
  const page = searchParams.get('page')

  const behandlinger = getBehandlinger(request, {
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
  const kjorAlle = (formData.get('kjorAlle') as string) === 'true'
  const kjorKunUttakssteg = (formData.get('kjorKunUttakssteg') as string) === 'true'
  const kjoreAr = formData.get('kjoreAr') as string

  await apiPost(
    '/api/omsorgspoeng/egenerklaering/batch',
    {
      kjorAlle: kjorAlle,
      kjorKunUttakssteg: kjorKunUttakssteg,
      kjoreAr: kjoreAr,
    },
    request,
  )

  return
}

export default function EgenerklaeringOmsorgspoeng({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData
  const navigation = useNavigation()

  const isSubmitting = navigation.state === 'submitting'

  const kjoreAr = new Date().getFullYear() - 2
  const [useDefaultParametre, setUseDefaultParametre] = useState(true)

  return (
    <VStack gap={'space-16'}>
      <Box className={'aksel-pageblock--lg'}>
        <Heading size={'medium'} level={'1'}>
          Distribuere egenerklæringsbrev for vedtak om omsorgspoeng
        </Heading>
        <VStack gap="space-8">
          <BodyLong>
            Oppretter batch-behandling for distribuering av egenerklæringsbrev for vedtak om omsorgspoeng
          </BodyLong>
        </VStack>
        <Link
          href="https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Felles/Omsorgsopptjening/DistribuereEgenerklæringsbrevForVedtakOmOmsorgspoeng.html"
          target="_blank"
        >
          Dokumentasjon
        </Link>
      </Box>
      <div>
        <Button
          icon={<PencilIcon aria-hidden />}
          size="small"
          variant={'secondary'}
          onClick={() => setUseDefaultParametre(false)}
        >
          Endre standard kjøreparametre
        </Button>
      </div>
      <Form method="post" style={{ width: '20em' }}>
        <VStack gap={'space-16'}>
          <CheckboxGroup legend="Modus" readOnly={useDefaultParametre}>
            <Checkbox name={'kjorAlle'} value={'true'} defaultChecked={true}>
              Kjør alle
            </Checkbox>
            <Checkbox name={'kjorKunUttakssteg'} value={'true'} defaultChecked={false}>
              Kjør kun uttakssteg
            </Checkbox>
          </CheckboxGroup>
          <TextField label="Kjøreår" description={'Gjeldende år - 2'} value={kjoreAr} name="kjoreAr" readOnly />
          <HStack gap="space-12" align="center">
            <div>
              <Button type="submit" loading={isSubmitting}>
                Opprett batch-behandling
              </Button>
            </div>
          </HStack>
        </VStack>
      </Form>
      <Heading level="2" size="medium" style={{ marginTop: '2em' }}>
        Eksisterende behandlinger
      </Heading>
      <Suspense fallback={<Skeleton variant="rectangle" width="100%" height={407} />}>
        <Await
          resolve={behandlinger}
          errorElement={
            <Alert variant="warning">
              VedtakMedInnvilgetOmsorgspoengBatch-behandlinger kunne ikke lastes. Dette kan skyldes tregt svar fra
              tjenesten. Forsøk å laste siden på nytt.
            </Alert>
          }
        >
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
