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

      <Box.New background={'raised'} style={{ padding: '6px' }} borderRadius="medium" shadow="dialog">
        <Tabs defaultValue="tilganger">
          <Tabs.List>
            <Tabs.Tab value="tilganger" label="Tilganger" icon={<KeyHorizontalIcon aria-hidden />} />
            <Tabs.Tab value="historikk" label="Historikk" icon={<ClockDashedIcon aria-hidden />} />
          </Tabs.List>
          <Tabs.Panel value="tilganger">
            <Box.New padding={'space-4'}>
              <BrukersTilganger
                bruker={props.bruker}
                readonly={props.readOnly}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilganger>
            </Box.New>
          </Tabs.Panel>
          <Tabs.Panel value="historikk">
            <Box.New padding={'space-4'}>
              <BrukersTilgangsLogg
                bruker={props.bruker}
                tilgangskontrollmeta={props.tilgangskontrollmeta}
              ></BrukersTilgangsLogg>
            </Box.New>
          </Tabs.Panel>
        </Tabs>
      </Box.New>
    </>
  )
}
