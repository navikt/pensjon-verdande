import React from 'react'
import type { AktivitetDTO, BehandlingDto } from '~/types'
import Card from '~/components/card/Card'
import { Entry } from '~/components/entry/Entry'
import { formatIsoTimestamp } from '~/common/date'
import { Link } from 'react-router';
import { Box, CopyButton, HStack, Tooltip } from '@navikt/ds-react'

export type Props = {
  behandling: BehandlingDto
  aktivitet: AktivitetDTO
}

export default function AktivitetCard(props: Props) {
  return (
    <Box.New
      background={'surface-default'}
      style={{ padding: '6px' }}
      borderRadius="medium"
      shadow="medium"
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
  )
}
