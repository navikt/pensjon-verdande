import React from 'react'
import type { AktivitetDTO, BehandlingDto } from '~/types'
import Card from '~/components/card/Card'
import { Entry } from '~/components/entry/Entry'
import { formatIsoTimestamp } from '~/common/date'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { Box, CopyButton, HStack, Tabs, Tooltip } from '@navikt/ds-react'
import { EnvelopeClosedIcon, InboxDownIcon, InboxUpIcon } from '@navikt/aksel-icons'

export type Props = {
  behandling: BehandlingDto
  aktivitet: AktivitetDTO
}

export default function AktivitetCard(props: Props) {
  const getCurrentChild = () => {
    const location = useLocation();
    let childPath = location.pathname.split('/').slice(-1)[0]
    if (childPath === "" || !isNaN(+childPath)) {
      return "input"
    } else {
      return childPath
    }
  }

  const navigate = useNavigate();

  return (
    <>
    <Box.New
      background={'default'}
      style={{ padding: '6px' }}
      borderRadius="medium"
      shadow="dialog"
    >
      <Card id={props.aktivitet.uuid}>
        <Card.Header>
          <Card.Heading>
            {props.behandling.type} - {props.aktivitet.type}
          </Card.Heading>
        </Card.Header>
        <Card.Body>
          <Card.Grid>
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
            <Entry labelText={'Status'}>{props.aktivitet.status}</Entry>
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
          </Card.Grid>
        </Card.Body>
      </Card>
    </Box.New>
      <Box.New
        background={"sunken"}
        style={{ padding: '6px', marginTop: '12px' }}
        borderRadius='medium'
        shadow="dialog"
      >
        <Tabs
          value=''
          onChange={(value) => {
            navigate(`./${value}`)
          }}
        >
          <Tabs.List>
            <Tabs.Tab
              value='felt/input'
              label='Input'
              icon={<InboxDownIcon />}
            />
            <Tabs.Tab
              value='felt/output'
              label='Output'
              icon={<InboxUpIcon />}
            />
            <Tabs.Tab
              value='felt/message'
              label='Message'
              icon={<EnvelopeClosedIcon />}
            />
          </Tabs.List>
          <Outlet/>
        </Tabs>
      </Box.New>
      </>
  )
}
