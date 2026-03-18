import {
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Heading,
  HStack,
  Modal,
  Select,
  TextField,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { useRef, useState } from 'react'
import { Form, redirect, useNavigation } from 'react-router'
import { toIsoDate } from '~/common/date'
import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import { opprettKontrollKvalitetssjekk } from '~/kontroll-kvalitetssjekk/kontroll-kvalitetssjekk.server'
import { getBehandlinger } from '~/services/behandling.server'
import type { BehandlingerPage } from '~/types'
import type { Route } from './+types/kontroll-kvalitetssjekk._index'

function defaultDatoer() {
  const now = new Date()
  // Til: siste dag forrige måned
  const til = new Date(now.getFullYear(), now.getMonth(), 0)
  // Fra: første dag 4 måned (slik at vi ender opp med 4 hel måned per default)
  const fra = new Date(now.getFullYear(), now.getMonth() - 4, 1)
  return { fra, til }
}

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Kontroll kvalitet | Verdande' }]
}

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const fomDato = formData.get('fomDato') as string
  const tomDato = formData.get('tomDato') as string
  const antallPerEnhet = Number(formData.get('antallPerEnhet'))
  const vedtakType = formData.get('vedtakType') as string
  const kravGjelder = formData.getAll('kravGjelder') as string[]
  const response = await opprettKontrollKvalitetssjekk(
    { fomDato, tomDato, antallPerEnhet, vedtakType, kravGjelder },
    request,
  )
  return redirect(`/behandling/${response?.behandlingId}`)
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url)

  const behandlinger = await getBehandlinger(request, {
    behandlingType: 'KontrollKvalitetssjekk',
    status: searchParams.get('status'),
    page: +(searchParams.get('page') ?? 0),
    size: +(searchParams.get('size') ?? 5),
    sort: searchParams.get('sort'),
  })

  return { behandlinger: behandlinger as BehandlingerPage }
}

export default function OpprettKontrollKvalitetssjekkRoute({ loaderData }: Route.ComponentProps) {
  const { behandlinger } = loaderData
  const modalRef = useRef<HTMLDialogElement>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  const { fra: defaultFra, til: defaultTil } = defaultDatoer()
  const [fraDate, setFraDate] = useState<Date>(defaultFra)
  const [tilDate, setTilDate] = useState<Date>(defaultTil)
  const [kravGjelder, setKravGjelder] = useState(['FORSTEG_BH', 'F_BH_BO_UTL', 'F_BH_MED_UTL'])

  const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
    defaultSelected: { from: defaultFra, to: defaultTil },
    onRangeChange: (range) => {
      if (range?.from) setFraDate(range.from)
      if (range?.to) setTilDate(range.to)
    },
  })

  return (
    <div>
      <Heading level="1" size="large">
        Kontroll kvalitet
      </Heading>
      <Form id="skjema" method="post">
        <VStack gap="space-16">
          <input type="hidden" name="fomDato" value={toIsoDate(fraDate)} />
          <input type="hidden" name="tomDato" value={toIsoDate(tilDate)} />
          <DatePicker {...datepickerProps}>
            <HStack gap="space-16">
              <DatePicker.Input {...fromInputProps} label="Fra" />
              <DatePicker.Input {...toInputProps} label="Til" />
            </HStack>
          </DatePicker>
          <HStack gap="space-16">
            <TextField
              label="Antall per enhet"
              name="antallPerEnhet"
              type="number"
              defaultValue={10}
              style={{ width: '10rem' }}
            />
            <Select label="Vedtak type" name="vedtakType" defaultValue="MAN">
              <option value="AUTO">Automatisk</option>
              <option value="DEL_AUTO">Del-automatisk</option>
              <option value="MAN">Manuell</option>
            </Select>
          </HStack>
          <CheckboxGroup legend="Krav gjelder" value={kravGjelder} onChange={setKravGjelder}>
            <Checkbox value="FORSTEG_BH">Førstegangsbehandling</Checkbox>
            <Checkbox value="F_BH_BO_UTL">Førstegangsbehandling bosatt utland</Checkbox>
            <Checkbox value="F_BH_MED_UTL">Førstegangsbehandling kun utland</Checkbox>
          </CheckboxGroup>
          {kravGjelder.map((v) => (
            <input key={v} type="hidden" name="kravGjelder" value={v} />
          ))}
          <HStack gap="space-16">
            <Button type="button" onClick={() => modalRef.current?.showModal()}>
              Opprett kontroll
            </Button>
          </HStack>
        </VStack>
      </Form>
      <div style={{ marginTop: '2rem' }}>
        <Heading level="2" size="medium" spacing>
          Eksisterende behandlinger
        </Heading>
        <BehandlingerTable
          visStatusSoek={true}
          visBehandlingTypeSoek={false}
          visAnsvarligTeamSoek={false}
          behandlingerResponse={behandlinger}
        />
      </div>
      <Modal ref={modalRef} header={{ heading: 'Start kontroll: kvalitet' }} size="small">
        <Modal.Body>
          <VStack gap="space-16">
            <div>Er du sikker på at du vil starte en ny kontroll kvalitet-behandling?</div>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <Button form="skjema" type="submit" disabled={isSubmitting} loading={isSubmitting}>
            Start behandling
          </Button>
          <Button type="button" variant="secondary" onClick={() => modalRef.current?.close()}>
            Tilbake
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
