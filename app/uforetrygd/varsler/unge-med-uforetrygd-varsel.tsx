import { BodyShort, Button, DatePicker, Heading, HStack, useDatepicker, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import { useFetcher } from 'react-router'
import { apiPost } from '~/services/api.server'
import type { Route } from './+types/unge-med-uforetrygd-varsel'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Unge med uføretrygd varsel | Verdande' }]
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const kriterieDato = formData.get('kriterieDato') as string

  await apiPost('/api/uforetrygd/varsler/unge-med-ufore/start', kriterieDato, request)
}

export default function UngeMedUforetrygdVarselPage() {
  const fetcher = useFetcher()
  const [kriterieDato, setKriterieDato] = useState<Date | undefined>(undefined)

  const { datepickerProps, inputProps } = useDatepicker({
    onDateChange: (d) => setKriterieDato(d),
  })

  const lagreOgSendInn = () => {
    fetcher.submit({ kriterieDato: kriterieDato ? kriterieDato.toISOString() : '' }, { method: 'POST' })
  }

  return (
    <VStack gap="space-20" style={{ maxWidth: '75em', margin: '2em' }}>
      <Heading size="large">Start kampanje: Unge med uføretrygd</Heading>
      <BodyShort>
        Dette vil finne alle personer som er mellom 18 og 29 og har hatt uføretrygd i minst 2 år før datoen du velger
        her og sende dem til ufore-varsler for utsending av SMS.
      </BodyShort>
      <HStack gap="space-20" align="end">
        <DatePicker {...datepickerProps}>
          <DatePicker.Input {...inputProps} label="Kriterie dato" />
        </DatePicker>

        <Button onClick={() => lagreOgSendInn()} loading={fetcher.state === 'submitting'}>
          Start kampanje
        </Button>
      </HStack>
    </VStack>
  )
}
