import type { ActionFunctionArgs } from '@remix-run/node'
import { requireAccessToken } from '~/services/auth.server'
import { useLoaderData } from '@remix-run/react'
import {
  Alert,
  BodyLong,
  Button,
  DatePicker,
  Heading,
  HStack,
  Loader,
  Modal,
  ProgressBar,
  Stepper,
  VStack,
} from '@navikt/ds-react'
import React, { useState } from 'react'
import { ReguleringOrkestrering, ReguleringStatistikk, ReguleringStatus, ReguleringUttrekk } from '~/regulering.types'
import { Behandlingstatus } from '~/types'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'


export const loader = async ({ request }: ActionFunctionArgs) => {


  const accessToken = await requireAccessToken(request)

  const regulering: ReguleringStatus = {
    steg: 2,
    uttrekk: {
      behandlingId: '123',
      status: Behandlingstatus.FULLFORT,
      feilmelding: null,
      steg: 'A190PopoulerFamileTabell',
      satsDato: '01.05.2025',
      uttrekkDato: '10.05.2025',
    },
    orkestrering: {
      behandlingId: "1234",
      status: Behandlingstatus.UNDER_BEHANDLING,
      antall:1100000,
      antallOpprettet: 500000,
      isFerdig: true,
      feilmelding: null,
    }
  }

  return { regulering }
}

export default function OpprettReguleringBatchRoute() {
  const { regulering } =
    useLoaderData<typeof loader>()

  const [reguleringSteg, setReguleringSteg] = useState(regulering.steg)


  return (
    <VStack gap="5">
      <Heading level="1" size="medium">Regulering</Heading>
      <HStack>
        <Stepper
          aria-labelledby="stepper-heading"
          activeStep={reguleringSteg}
          onStepChange={setReguleringSteg}
          orientation="horizontal"
        >
          <Stepper.Step href="#" completed>Uttrekk</Stepper.Step>
          <Stepper.Step href="#">Orkestrering</Stepper.Step>
          <Stepper.Step href="#">Administrer tilknyttede behandlinger</Stepper.Step>
        </Stepper>
      </HStack>
      {reguleringSteg === 1 && <Uttrekk uttrekk={regulering.uttrekk}></Uttrekk>}
      {reguleringSteg === 2 && <Orkestrering orkestrering={regulering.orkestrering} />}
      {reguleringSteg === 3 && <AdministrerTilknyttetdeBehandlinger orkestrering={regulering.orkestrering} />}
    </VStack>
  )
}


export function AdministrerTilknyttetdeBehandlinger({orkestrering}: {orkestrering: ReguleringOrkestrering | null}) {

  const statistikk: ReguleringStatistikk = {
    orkestrering: {
      opprettet: 100000,
      under_behandling: 99999,
      feilende: 0,
      feilendeDrilldown: [],
      stoppet: 0,
      fullfort: 1,
    },
    familie: {
      opprettet: 100000,
      under_behandling: 99999,
      feilende: 0,
      feilendeDrilldown: [],
      stoppet: 0,
      fullfort: 1,
    },
    iverksettVedtak: {
      opprettet: 100000,
      under_behandling: 99999,
      feilende: 0,
      feilendeDrilldown: [],
      stoppet: 0,
      fullfort: 1,
    }
  };

  return (
    <HStack>
      <Bar
        id={"123"}
        data={{
          labels: ['Orkestrering', "Familie", "Iverksett vedtak"],
          datasets: [
            {
              label: 'Opprettet',
              data: [1123],
              borderWidth: 1,
            },
            {
              label: 'Under behandling',
              data: [11233],
              borderWidth: 1,
            },
            {
              label: 'Feilende',
              data: [11232],
              borderWidth: 1,
            },
            {
              label: 'Stoppet',
              data: [11231],
              borderWidth: 1,
            },
            {
              label: 'Fullført',
              data: [112311],
              borderWidth: 1,
            },

          ],
        }}
        options={{
          responsive: true,
        }}
      />
    </HStack>
  )
}

export function Orkestrering({orkestrering}: {orkestrering: ReguleringOrkestrering | null}) {
  return(
     <>
      <HStack>
        {orkestrering !== null && (
          <>
          {!orkestrering.isFerdig &&  (
              <Alert variant="info" inline>
                <VStack gap="5">
                  <HStack gap="2">
                    <div>Oppretter FamilieRegulering ({orkestrering.antallOpprettet}/{orkestrering.antall})</div>
                    <Loader /></HStack>
                  <ProgressBar
                    value={orkestrering.antallOpprettet}
                    valueMax={orkestrering.antall}
                    size="small"
                    aria-labelledby="progress-bar-label-small"
                  />
                  <div><Button variant="secondary">Administrer tiknyttede behandlinger</Button></div>
                </VStack>
              </Alert>
            )}
            {orkestrering.isFerdig && (
              <Alert variant="success" inline>
                <VStack gap="5">
                  <div>Orkestrering er fullført</div>
                  <div><Button variant="secondary">Administrer tiknyttede behandlinger</Button></div>
                </VStack>
              </Alert>
            )}
          </>
        )}
      </HStack>
       <HStack>
         {(orkestrering === null || orkestrering.isFerdig) &&
           <Button>Start orkestrering</Button>
         }
       </HStack>
     </>
  )
}

export function Uttrekk ({uttrekk}: { uttrekk: ReguleringUttrekk | null}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <HStack>
        {uttrekk !== null &&
          <>
            {uttrekk.status === Behandlingstatus.UNDER_BEHANDLING && (
              <Alert variant="info" inline>
                <VStack gap="2">
                  <HStack gap="2">
                    <div>Uttrekk er under behandling: {uttrekk.steg}</div>
                    <Loader /></HStack>
                  <ProgressBar
                    title={uttrekk.steg}
                    value={2}
                    valueMax={8}
                    size="small"
                    aria-labelledby="progress-bar-label-small"
                  />
                </VStack>
              </Alert>
            )}
            {uttrekk.status === Behandlingstatus.STOPPET && (
              <Alert variant="error" inline>Uttrekk er stoppet manuelt</Alert>
            )}
            {uttrekk.feilmelding !== null && (
              <Alert variant="warning" inline>{uttrekk.feilmelding}</Alert>
            )}
            {uttrekk.status === Behandlingstatus.FULLFORT && (
              <Alert variant="success" inline><VStack gap="2">Uttrekk er fullført {uttrekk.uttrekkDato}</VStack></Alert>
            )}
          </>
        }
      </HStack>
      <HStack gap="3">
        {(uttrekk === null || (uttrekk.status === Behandlingstatus.FULLFORT || uttrekk.status === Behandlingstatus.STOPPET))
          && <Button variant="secondary" onClick={() => setIsOpen(true)}>Kjør uttrekk</Button>
        }
        {uttrekk?.status === Behandlingstatus.FULLFORT &&
          <Button>Gå til Orkestrering</Button>
        }
      </HStack>
      <StartUttrekkModal isOpen={isOpen} onClose={() => setIsOpen(false)}/>
    </>
  )

}

export function StartUttrekkModal({isOpen, onClose}: { isOpen: boolean, onClose: () => void }  ) {

  const year = new Date().getFullYear();
  const defaultSatsdato = new Date(`1 May ${year}`)
  const [satsDato, setSatsDato] = useState<Date | undefined>(defaultSatsdato)

  function startUttrekk() {

  }

  return (
  <Modal header={{ heading: 'Start uttrekk' }} open={isOpen} onClose={() => onClose()}>
    <Modal.Body>
      <VStack gap="5">
        <BodyLong>
          Velg satsdato
        </BodyLong>
        <DatePicker.Standalone
          selected={satsDato}
          today={defaultSatsdato}
          onSelect={setSatsDato}
          fromDate={new Date(`1 May ${year - 2}`)}
          toDate={new Date(`1 May ${year + 2}`)}
          dropdownCaption
        />
      </VStack>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={startUttrekk} >
        Start uttrekk
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => onClose()}
      >
        Avbryt
      </Button>
    </Modal.Footer>
  </Modal>   )
}