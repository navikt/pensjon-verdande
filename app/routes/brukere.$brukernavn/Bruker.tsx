import { Box, Checkbox, CheckboxGroup, Table, Tabs } from '@navikt/ds-react'
import Card from '~/components/card/Card'
import { useState } from 'react'
import { BrukerResponse, decodeOmfang, Tilgangsmeta, tilgangsmetaSort } from '~/types/brukere'
import { useFetcher } from 'react-router'
import { uniqueFilter } from '~/common/utils'
import { ClockDashedIcon, KeyHorizontalIcon } from '@navikt/aksel-icons'
import { formatIsoTimestamp } from '~/common/date'

export interface Props {
  tilgangskontrollmeta: Tilgangsmeta[],
  bruker: BrukerResponse
}

export default function Bruker(props: Props) {
  const fetcher = useFetcher()

  const [gitteTilganger, setTilganger] = useState<string[]>(props.bruker.tilganger || []);

  function toggleTilgang(oppgave: Tilgangsmeta) {
    let eksisterendeTilgang = gitteTilganger.includes(oppgave.operasjonNavn)

    setTilganger((list) =>
      list.includes(oppgave.operasjonNavn)
        ? list.filter((id) => id !== oppgave.operasjonNavn)
        : [...list, oppgave.operasjonNavn],
    )

    fetcher.submit({
      operasjon: oppgave.operasjonNavn,
    }, {
      method: eksisterendeTilgang ? 'delete' : 'put',
      action: `/brukere/${encodeURI(props.bruker.brukernavn)}`,
    })
  }

  function decodeOperasjon(operasjon: string) {
    return props.tilgangskontrollmeta.find(it => it.operasjonNavn == operasjon)
      ?.operasjonBeskrivelse
      ?? operasjon
  }

  return (
    <>
      <Box
        background={'surface-default'}
        style={{ padding: '6px' }}
        borderRadius="medium"
        shadow="medium"
      >

        <Card>
          <Card.Header>
            <Card.Heading>
              Tilgangskontroll
            </Card.Heading>
          </Card.Header>
          <Card.Body>
            <dl>
              <dt>Navident</dt>
              <dd>{props.bruker.brukernavn}</dd>
              <dt>Fornavn</dt>
              <dd>{props.bruker.fornavn}</dd>
              <dt>Etternavn</dt>
              <dd>{props.bruker.etternavn}</dd>
            </dl>
          </Card.Body>
        </Card>
      </Box>

      <div style={{margin: "12px"}}></div>

      <Box
        background={'surface-default'}
        style={{ padding: '6px' }}
        borderRadius="medium"
        shadow="medium"
      >
        <Card>
          <Tabs defaultValue="tilganger">
            <Tabs.List>
              <Tabs.Tab
                value="tilganger"
                label="Tilganger"
                icon={<KeyHorizontalIcon aria-hidden />}
              />
              <Tabs.Tab
                value="historikk"
                label="Historikk"
                icon={<ClockDashedIcon aria-hidden />}
              />
            </Tabs.List>
            <Tabs.Panel value="tilganger" style={{paddingTop: "12px"}}>
              {
                props.tilgangskontrollmeta.sort((a, b) => a.omfangBeskrivelse.localeCompare(b.omfangBeskrivelse)).map(it => it.omfangNavn).filter(uniqueFilter).map(omfangNavn => {
                  return (
                    <Card.Body key={omfangNavn} >
                      <CheckboxGroup legend={decodeOmfang(props.tilgangskontrollmeta, omfangNavn)} value={gitteTilganger}>
                        {
                          props.tilgangskontrollmeta.filter(it => it.omfangNavn == omfangNavn).sort(tilgangsmetaSort).map((oppgave) => {
                            return (<Checkbox key={oppgave.operasjonNavn} value={oppgave.operasjonNavn} onChange={() => toggleTilgang(oppgave)}>
                              {oppgave.operasjonBeskrivelse}
                            </Checkbox>)
                          })
                        }
                      </CheckboxGroup>
                    </Card.Body>
                  )
                })
              }
            </Tabs.Panel>
              <Tabs.Panel value="historikk" style={{paddingTop: "12px"}}>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Operasjon</Table.HeaderCell>
                    <Table.HeaderCell>Fra</Table.HeaderCell>
                    <Table.HeaderCell>Til</Table.HeaderCell>
                    <Table.HeaderCell>Gitt av</Table.HeaderCell>
                    <Table.HeaderCell>Fjernet av</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {props.bruker.tilgangsHistorikk.sort((a, b) => Date.parse(b.fra) - Date.parse(a.fra)).map((endring, index) => (
                    <Table.Row key={index}>
                      <Table.DataCell>{decodeOperasjon(endring.operasjon)}</Table.DataCell>
                      <Table.DataCell>{formatIsoTimestamp(endring.fra)}</Table.DataCell>
                      <Table.DataCell>{endring.til ? formatIsoTimestamp(endring.til) : 'Nåværende'}</Table.DataCell>
                      <Table.DataCell>{endring.gittAvBruker}</Table.DataCell>
                      <Table.DataCell>{endring.fjernetAvBruker}</Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Tabs.Panel>
          </Tabs>

        </Card>
      </Box>
    </>

  )
}
