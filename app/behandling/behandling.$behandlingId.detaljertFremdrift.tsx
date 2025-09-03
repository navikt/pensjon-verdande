import {
  BodyShort,
  Box,
  Button,
  Heading,
  HStack,
  ProgressBar,
  Select,
  Switch,
  Table,
  Tag,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { useMemo, useState } from 'react'
import { type LoaderFunctionArgs, useLoaderData, useRevalidator } from 'react-router'
import invariant from 'tiny-invariant'
import { requireAccessToken } from '~/services/auth.server'
import { getDetaljertFremdrift } from '~/services/behandling.server'
import type { BehandlingDetaljertFremdriftDTO } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  invariant(params.behandlingId, 'Missing behandlingId param')

  const accessToken = await requireAccessToken(request)

  const detaljertFremdrift = await getDetaljertFremdrift(accessToken, +params.behandlingId)

  invariant(detaljertFremdrift, 'Behandlingen hadde ikke en detaljertFremdrift')

  return {
    detaljertFremdrift: detaljertFremdrift,
  }
}

const pct = (ferdig: number, totalt: number) => (totalt > 0 ? Math.round((ferdig / totalt) * 100) : 0)

const ratio = (a: number, b: number) => `${a.toLocaleString('nb-NO')} / ${b.toLocaleString('nb-NO')}`

const indentPx = (level: number) => Math.max(0, (level - 1) * 16)

type SortKey = 'level' | 'code' | 'progress' | 'errors'
const sorters: Record<SortKey, (a: BehandlingDetaljertFremdriftDTO, b: BehandlingDetaljertFremdriftDTO) => number> = {
  level: (a, b) => a.level - b.level || a.behandlingCode.localeCompare(b.behandlingCode),
  code: (a, b) => a.behandlingCode.localeCompare(b.behandlingCode),
  progress: (a, b) => pct(b.ferdig, b.totalt) - pct(a.ferdig, a.totalt),
  errors: (a, b) => b.feilende - a.feilende,
}

const StatusTags: React.FC<{
  fullfort: number
  underBehandling: number
  feilende: number
  stoppet: number
  debug: number
  opprettet: number
}> = ({ fullfort, underBehandling, feilende, stoppet, debug, opprettet }) => (
  <HStack gap="2" wrap>
    {fullfort > 0 && <Tag variant="success">Fullført: {fullfort}</Tag>}
    {underBehandling > 0 && <Tag variant="info">Under behandling: {underBehandling}</Tag>}
    {feilende > 0 && <Tag variant="error">Feilende: {feilende}</Tag>}
    {stoppet > 0 && <Tag variant="warning">Stoppet: {stoppet}</Tag>}
    {debug > 0 && <Tag variant="neutral">Debug: {debug}</Tag>}
    {opprettet > 0 && <Tag variant="neutral">Opprettet: {opprettet}</Tag>}
  </HStack>
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
    <VStack gap="6" className="p-4">
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
              <option value="level">Nivå (tre)</option>
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
                      </HStack>
                    </div>
                  </Table.DataCell>

                  <Table.DataCell>
                    <BodyShort>{ratio(rad.ferdig, rad.totalt)}</BodyShort>
                  </Table.DataCell>

                  <Table.DataCell>
                    <VStack gap="1">
                      <BodyShort size="small">{rowPct}%</BodyShort>
                      <ProgressBar value={rowPct} aria-label={`Fremdrift ${rad.behandlingCode}`} />
                    </VStack>
                  </Table.DataCell>

                  <Table.DataCell>
                    <StatusTags
                      fullfort={rad.fullfort}
                      underBehandling={rad.underBehandling}
                      feilende={rad.feilende}
                      stoppet={rad.stoppet}
                      debug={rad.debug}
                      opprettet={rad.opprettet}
                    />
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
