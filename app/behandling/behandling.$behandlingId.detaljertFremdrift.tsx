import {
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  Link,
  ProgressBar,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { useMemo, useState } from 'react'
import { NavLink, useLoaderData, useRevalidator } from 'react-router'
import invariant from 'tiny-invariant'
import { decodeBehandlingStatus, decodeBehandlingStatusToVariant } from '~/common/decode'
import { getDetaljertFremdrift } from '~/services/behandling.server'
import type { BehandlingDetaljertFremdriftDTO } from '~/types'
import type { Route } from './+types/behandling.$behandlingId.detaljertFremdrift'

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const detaljertFremdrift = await getDetaljertFremdrift(request, +params.behandlingId)

  invariant(detaljertFremdrift, 'Behandlingen hadde ikke en detaljertFremdrift')

  return {
    detaljertFremdrift: detaljertFremdrift,
  }
}

const pct = (ferdig: number, totalt: number) => {
  if (totalt < 0) {
    return 0
  } else if (ferdig >= totalt) {
    return 100
  } else {
    return Math.min(+((ferdig / totalt) * 100).toFixed(1), 99.9)
  }
}

const ratio = (a: number, b: number) => `${a.toLocaleString('nb-NO')} / ${b.toLocaleString('nb-NO')}`

const indentPx = (level: number) => Math.max(0, (level - 1) * 16)

type SortKey = 'level' | 'code' | 'progress' | 'errors'
const sorters: Record<SortKey, (a: BehandlingDetaljertFremdriftDTO, b: BehandlingDetaljertFremdriftDTO) => number> = {
  level: (a, b) => a.level - b.level || a.behandlingCode.localeCompare(b.behandlingCode, 'nb', { sensitivity: 'base' }),
  code: (a, b) => a.behandlingCode.localeCompare(b.behandlingCode, 'nb', { sensitivity: 'base' }),
  progress: (a, b) => pct(b.ferdig, b.totalt) - pct(a.ferdig, a.totalt),
  errors: (a, b) => b.feilende - a.feilende,
}

const StatusTag: React.FC<{
  type: string
  status: string
  antall: number
  level: number
}> = ({ type, status, antall, level }) => (
  <Tag variant={decodeBehandlingStatusToVariant(status)}>
    {level > 1 ? (
      <Link
        as={NavLink}
        to={`../avhengigeBehandlinger?behandlingType=${encodeURIComponent(type)}&status=${encodeURIComponent(status)}`}
      >
        {decodeBehandlingStatus(status)}: {antall}
      </Link>
    ) : (
      <>
        {decodeBehandlingStatus(status)}: {antall}
      </>
    )}
  </Tag>
)

export default function FremdriftRoute() {
  const { detaljertFremdrift } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  const [onlyIssues, setOnlyIssues] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('level')

  const totalPct = pct(detaljertFremdrift.ferdig, detaljertFremdrift.totalt)

  const rows = useMemo(() => {
    let list = [...detaljertFremdrift.behandlingerDetaljertFremdrift]
    if (onlyIssues) {
      list = list.filter((r) => r.feilende > 0 || r.stoppet > 0 || r.debug > 0)
    }
    return list.sort(sorters[sortKey])
  }, [detaljertFremdrift.behandlingerDetaljertFremdrift, onlyIssues, sortKey])

  const isRefreshing = revalidator.state === 'loading'

  return (
    <VStack gap="6">
      <Box.New>
        <Heading size={'small'}>
          <HStack justify="space-between" align="center">
            <Heading size="small" level={'3'}>
              Fremdrift
            </Heading>
            <Tooltip content="Andel ferdig av totalt">
              <Tag variant={totalPct === 100 ? 'success' : 'info'} size="small">
                {totalPct} %
              </Tag>
            </Tooltip>
            <Button size="small" variant="secondary" loading={isRefreshing} onClick={() => revalidator.revalidate()}>
              Last på nytt
            </Button>
          </HStack>
        </Heading>
        <VStack gap="4">
          <BodyShort>
            Totalt: <strong>{ratio(detaljertFremdrift.ferdig, detaljertFremdrift.totalt)}</strong>
          </BodyShort>
          <ProgressBar value={totalPct} aria-label="Total fremdrift" />
        </VStack>
      </Box.New>

      <Box.New>
        <HStack justify="space-between" align="center" wrap>
          <Heading size="small" level={'2'}>
            Detaljer per behandling
          </Heading>
          <HStack gap="4" wrap>
            <Switch checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)}>
              Vis kun feil/avvik
            </Switch>
            <Select
              size={'small'}
              label="Sorter"
              hideLabel
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="level">Nivå</option>
              <option value="code">Navn A–Å</option>
              <option value="progress">Fremdrift høyest først</option>
              <option value="errors">Flest feil først</option>
            </Select>
          </HStack>
        </HStack>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Behandling</Table.HeaderCell>
              <Table.HeaderCell scope="col" style={{ width: 140 }}>
                Ferdig / Totalt
              </Table.HeaderCell>
              <Table.HeaderCell scope="col" style={{ width: 160 }}>
                Fremdrift
              </Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rows.length === 0 && (
              <Table.Row>
                <Table.DataCell colSpan={4}>
                  <BodyShort>Ingen rader matcher filteret.</BodyShort>
                </Table.DataCell>
              </Table.Row>
            )}

            {rows.map((rad) => {
              const rowPct = pct(rad.ferdig, rad.totalt)
              const hasIssues = rad.feilende > 0 || rad.stoppet > 0

              const antallEtterStatus = [
                { status: 'DEBUG', antall: rad.debug },
                { status: 'FULLFORT', antall: rad.fullfort },
                { status: 'OPPRETTET', antall: rad.opprettet },
                { status: 'STOPPET', antall: rad.stoppet },
                { status: 'UNDER_BEHANDLING', antall: rad.underBehandling },
                { status: 'FEILENDE', antall: rad.feilende },
              ]

              return (
                <Table.Row
                  key={`${rad.level}-${rad.behandlingCode}`}
                  style={hasIssues ? { background: 'var(--a-surface-danger-subtle)' } : undefined}
                >
                  <Table.DataCell>
                    <div
                      style={{
                        paddingLeft: indentPx(rad.level),
                        borderLeft: rad.level > 1 ? '1px solid var(--ax-border-neutral-subtle)' : 'none',
                        marginLeft: rad.level > 1 ? 4 : 0,
                      }}
                    >
                      <HStack gap="2" align="center" wrap={false}>
                        <BodyShort as="span" style={{ fontWeight: 600 }}>
                          {rad.behandlingCode}
                        </BodyShort>
                        {rad.level === 1 && <BodyShort size={'small'}>(Denne behandlingen)</BodyShort>}
                      </HStack>
                    </div>
                  </Table.DataCell>

                  <Table.DataCell>
                    <BodyShort>{ratio(rad.ferdig, rad.totalt)}</BodyShort>
                  </Table.DataCell>

                  <Table.DataCell>
                    <VStack gap="1">
                      <VStack align={'end'}>
                        <BodyShort size="small">{rowPct} %</BodyShort>
                      </VStack>
                      <ProgressBar value={rowPct} aria-label={`Fremdrift ${rad.behandlingCode}`} />
                    </VStack>
                  </Table.DataCell>

                  <Table.DataCell>
                    <HStack gap="2" wrap>
                      {antallEtterStatus
                        .filter((it) => it.antall > 0 && rad.level > 1)
                        .map((it) => (
                          <StatusTag
                            key={`${rad.behandlingCode}:${rad.level}:${it.status}`}
                            type={rad.behandlingCode}
                            status={it.status}
                            antall={it.antall}
                            level={rad.level}
                          ></StatusTag>
                        ))}
                    </HStack>
                  </Table.DataCell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </Box.New>
    </VStack>
  )
}
