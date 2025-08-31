import type { AktivitetDTO, BehandlingDto } from '~/types'
import { Entry } from '~/components/entry/Entry'
import { formatIsoTimestamp } from '~/common/date'
import { Link, Outlet, useNavigate } from 'react-router'
import { Box, CopyButton, Heading, HGrid, HStack, Tabs, Tooltip, VStack } from '@navikt/ds-react'
import { EnvelopeClosedIcon, InboxDownIcon, InboxUpIcon } from '@navikt/aksel-icons'
import { decodeBehandling } from '~/common/decodeBehandling'
import { decodeAktivitetStatus } from '~/common/decode'

export type Props = {
  behandling: BehandlingDto
  aktivitet: AktivitetDTO
  pathname: string
}

export default function AktivitetCard(props: Props) {
  const getCurrentChild = () => {

    const strings = props.pathname.split('/').slice(-2)
    const childPath = strings[0]
    if (childPath === '' || !Number.isNaN(+childPath)) {
      return ''
    } else {
      return strings.join("/")
    }
  }

  const navigate = useNavigate()

  return (
    <>
      <Heading size={'large'}>
        {`${decodeBehandling(props.behandling.type)} - ${props.aktivitet.type}`}
      </Heading>
      <VStack gap={'4'}>
        <Box.New
          background={'raised'}
          borderRadius={'xlarge'}
          borderWidth={'1'}
          borderColor={'neutral-subtleA'}
          padding={'4'}
        >
          <HGrid columns={{ md: 2, lg: 3, xl: 4 }} gap="space-24">
            <Entry labelText={'BehandlingId'}>
              <HStack align="start">
                <Link to={`/behandling/${props.behandling.behandlingId}`}>
                  {props.behandling.behandlingId}
                </Link>
                <Tooltip content="Kopier behandlingsidentifikator">
                  <CopyButton
                    copyText={props.behandling.behandlingId.toString()}
                    size={'xsmall'}
                  />
                </Tooltip>
              </HStack>
            </Entry>
            <Entry labelText={'AktivitetId'}>
              <HStack align="start">
                {props.aktivitet.aktivitetId}
                <Tooltip content="Kopier aktivitetsidentifikator">
                  <CopyButton
                    copyText={props.aktivitet.aktivitetId.toString()}
                    size={'xsmall'}
                  />
                </Tooltip>
              </HStack>
            </Entry>
            <Entry labelText={'Status'}>{decodeAktivitetStatus(props.aktivitet.status)}</Entry>
            <Entry labelText={'Funksjonell identifikator'}>
              {props.aktivitet.funksjonellIdentifikator}
            </Entry>

            <Entry labelText={'Opprettet'}>
              {formatIsoTimestamp(props.aktivitet.opprettet)}
            </Entry>
            <Entry labelText={'Siste kjøring'}>
              {formatIsoTimestamp(props.aktivitet.sisteAktiveringsdato)}
            </Entry>
            <Entry labelText={'Utsatt til'}>
              {formatIsoTimestamp(props.aktivitet.utsattTil)}
            </Entry>

            <Entry labelText={'Antall ganger kjørt'}>
              {props.aktivitet.antallGangerKjort}
            </Entry>
            <Entry labelText={'Vent på foregående aktiviteter'}>
              {props.aktivitet.ventPaForegaendeAktiviteter ? 'ja' : 'nei'}
            </Entry>
          </HGrid>
        </Box.New>
        <Box.New
          background={"raised"}
          style={{ padding: '6px', marginTop: '12px' }}
          borderColor={"neutral-subtle"}
          borderWidth={"1"}
          borderRadius={"medium"}
          shadow={"dialog"}
        >
          <Tabs
            value={getCurrentChild()}
            onChange={(value) => {
              navigate(`./${value}`)
            }}
          >
            <Tabs.List>
              <Tabs.Tab
                value="felt/input"
                label="Input"
                icon={<InboxDownIcon />}
              />
              <Tabs.Tab
                value="felt/output"
                label="Output"
                icon={<InboxUpIcon />}
              />
              <Tabs.Tab
                value="felt/message"
                label="Message"
                icon={<EnvelopeClosedIcon />}
              />
            </Tabs.List>
            <Outlet />
          </Tabs>
        </Box.New>
      </VStack>
    </>
  )
}
