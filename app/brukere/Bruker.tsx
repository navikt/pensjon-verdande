import { ClockDashedIcon, KeyHorizontalIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Heading, Tabs } from '@navikt/ds-react'
import BrukersTilganger from '~/brukere/BrukersTilganger'
import { BrukersTilgangsLogg } from '~/brukere/BrukersTilgangsLogg'
import type { BrukerResponse, Tilgangsmeta } from '~/brukere/brukere'

export interface Props {
  tilgangskontrollmeta: Tilgangsmeta[]
  bruker: BrukerResponse
  readOnly: boolean
}

export default function Bruker(props: Props) {
  return (
    <>
      <Heading level="1" size="xlarge">
        {props.bruker.fornavn} {props.bruker.etternavn}
        <BodyShort size={'small'}>{props.bruker.brukernavn}</BodyShort>
      </Heading>
      <Box background={'raised'} style={{ padding: '6px' }} borderRadius="4" shadow="dialog">
        <Tabs defaultValue="tilganger">
          <Tabs.List>
            <Tabs.Tab value="tilganger" label="Tilganger" icon={<KeyHorizontalIcon aria-hidden />} />
            <Tabs.Tab value="historikk" label="Historikk" icon={<ClockDashedIcon aria-hidden />} />
          </Tabs.List>
          <Tabs.Panel value="tilganger">
            <Box padding={'space-16'}>
              <BrukersTilganger
                bruker={props.bruker}
                readonly={props.readOnly}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilganger>
            </Box>
          </Tabs.Panel>
          <Tabs.Panel value="historikk">
            <Box padding={'space-16'}>
              <BrukersTilgangsLogg
                bruker={props.bruker}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilgangsLogg>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </>
  )
}
