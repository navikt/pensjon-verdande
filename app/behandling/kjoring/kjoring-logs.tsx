import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
  FilesIcon,
  LinkIcon,
  MenuElipsisVerticalIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  XMarkIcon,
} from '@navikt/aksel-icons'
import type { TagProps } from '@navikt/ds-react'
import {
  ActionMenu,
  BodyShort,
  Button,
  Chips,
  CopyButton,
  Heading,
  HStack,
  Label,
  Link,
  Table,
  Tag,
  Tooltip,
  VStack,
} from '@navikt/ds-react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { type LoaderFunctionArgs, Link as ReactRouterLink, useLoaderData } from 'react-router'
import invariant from 'tiny-invariant'
import { finnAktivitet } from '~/behandling/behandling.$behandlingId.aktivitet.$aktivitetId'
import copy from '~/common/clipboard'
import { formatIsoTimestamp } from '~/common/date'
import { decodeAktivitet, decodeBehandling } from '~/common/decodeBehandling'
import { tidsbruk } from '~/components/kjoringer-table/BehandlingKjoringerTable'
import { fetchPenLogs, tempoUrl } from '~/loki/loki.server'
import {
  isStreams,
  type LokiInstantQueryData,
  type LokiInstantQueryResponse,
  type LokiStream,
} from '~/loki/loki-query-types'
import { apiGet } from '~/services/api.server'
import type { BehandlingDto, HalLink } from '~/types'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { behandlingId, kjoringId } = params

  invariant(behandlingId, 'Missing behandlingId param')
  invariant(kjoringId, 'Missing kjoringId param')

  const behandling = await apiGet<BehandlingDto>(`/api/behandling/${behandlingId}`, request)

  const kjoring = behandling.behandlingKjoringer.find((it) => it.behandlingKjoringId.toString() === params.kjoringId)
  if (!kjoring) {
    throw new Response('Not Found', { status: 404 })
  }

  const aktivitet = kjoring.aktivitetId && finnAktivitet(behandling, kjoring.aktivitetId)

  const response: LokiInstantQueryResponse = await fetchPenLogs(
    kjoring.startet,
    kjoring.avsluttet,
    kjoring.correlationId,
  )

  const data = response.data as LokiInstantQueryData

  const result: LokiStream[] = response.status === 'success' && isStreams(data) ? (data.result as LokiStream[]) : []
  const traceId = result.length > 0 ? result[0].stream.trace_id : undefined

  const sp = new URL(request.url).searchParams
  const urlCols = sp.get('cols')
  const urlFilters = sp.get('filters')

  const initialSelectedCols = urlCols
    ? urlCols
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : ['_timestamp', 'level', 'message']

  let initialFilters: { key: string; value: string; mode: 'in' | 'out' }[] = []
  try {
    if (urlFilters) {
      const parsed = JSON.parse(decodeURIComponent(urlFilters))
      if (Array.isArray(parsed)) initialFilters = parsed
    }
  } catch {}

  return {
    response,
    behandling,
    aktivitet,
    kjoring,
    traceId: traceId,
    tempoUrl: traceId && tempoUrl(kjoring.startet, kjoring.avsluttet, traceId),
    initialSelectedCols,
    initialFilters,
    urlProvidedCols: Boolean(urlCols),
    urlProvidedFilters: Boolean(urlFilters),
  }
}

export default function Behandling() {
  const { response, behandling, aktivitet, kjoring, traceId, tempoUrl, initialSelectedCols, initialFilters } =
    useLoaderData<typeof loader>()

  const data = response.data as LokiInstantQueryData

  const result = data.result as LokiStream[]

  const showStackTrace = false

  const DEFAULT_COLS = ['_timestamp', 'level', 'message'] as const
  const [selectedCols, setSelectedCols] = useState<string[]>(initialSelectedCols ?? [...DEFAULT_COLS])

  const addColumn = (key: string) => {
    setSelectedCols((prev) => (prev.includes(key) ? prev : [...prev, key]))
  }

  const removeColumn = (key: string) => {
    setSelectedCols((prev) => prev.filter((c) => c !== key))
  }

  const moveColumn = (col: string, dir: 'left' | 'right') => {
    setSelectedCols((prev) => {
      const idx = prev.indexOf(col)
      if (idx === -1) return prev
      const target = dir === 'left' ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const isSelected = (key: string) => selectedCols.includes(key)

  const HIDE_IN_DETAILS = new Set(['stack_trace'])

  type FilterMode = 'in' | 'out'
  type ActiveFilter = { key: string; value: string; mode: FilterMode }
  const [filters, setFilters] = useState<ActiveFilter[]>(initialFilters ?? [])

  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('cols', selectedCols.join(','))
      if (filters.length > 0) {
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)))
      } else {
        url.searchParams.delete('filters')
      }
      const next = url.toString()
      setShareUrl(next)
      window.history.replaceState({}, '', next)
    } catch {
      // ignore
    }
  }, [selectedCols, filters])

  const addFilter = (mode: FilterMode, key: string, value: string) => {
    setFilters((prev) =>
      prev.some((f) => f.key === key && f.value === value && f.mode === mode) ? prev : [...prev, { key, value, mode }],
    )
  }
  const removeFilter = (idx: number) => setFilters((prev) => prev.filter((_, i) => i !== idx))

  const visibleResult = useMemo(() => {
    if (filters.length === 0) return result
    return result.filter((s) => {
      return filters.every((f) => (f.mode === 'in' ? s.stream[f.key] === f.value : s.stream[f.key] !== f.value))
    })
  }, [result, filters])

  return (
    <VStack gap="4">
      <Heading size={'small'}>Kjøring</Heading>

      <section aria-labelledby="overview-heading">
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            columnGap: '1rem',
            rowGap: '0.5rem',
            margin: 0,
            alignItems: 'center',
            gridAutoRows: '2rem',
          }}
        >
          <dt>
            <Label as="span">Behandling</Label>
          </dt>
          <dd>
            <Link as={ReactRouterLink} to={`/behandling/${kjoring.behandlingId}`}>
              {kjoring.behandlingId} - {decodeBehandling(behandling.type)}
            </Link>
          </dd>
          {aktivitet && (
            <>
              <dt>
                <Label as="span">Aktivitet</Label>
              </dt>
              <dd>
                <Link
                  as={ReactRouterLink}
                  to={`/behandling/${kjoring.behandlingId}/aktivitet/${aktivitet.aktivitetId}`}
                >
                  {aktivitet.aktivitetId} - {decodeAktivitet(aktivitet.type)}
                </Link>
              </dd>
            </>
          )}

          <dt>
            <Label as="span">Start</Label>
          </dt>
          <dd>
            <BodyShort>{formatIsoTimestamp(kjoring.startet, true)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Slutt</Label>
          </dt>
          <dd>
            <BodyShort>{formatIsoTimestamp(kjoring.avsluttet, true)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Tidsbruk</Label>
          </dt>
          <dd>
            <BodyShort>{tidsbruk(kjoring)}</BodyShort>
          </dd>

          <dt>
            <Label as="span">Korrelasjonsid</Label>
          </dt>
          <dd>
            <HStack gap="2" align="center">
              <BodyShort>{kjoring.correlationId}</BodyShort>
              <Tooltip content="Kopier korrelasjonsid">
                <CopyButton copyText={kjoring.correlationId} iconPosition="right" size="small" />
              </Tooltip>
            </HStack>
          </dd>

          {traceId && (
            <>
              <dt>
                <Label as="span">TraceId</Label>
              </dt>
              <dd>
                <HStack gap="2" align="center">
                  <BodyShort>{traceId}</BodyShort>
                  <Tooltip content="Kopier TraceId">
                    <CopyButton copyText={traceId} iconPosition="right" size="small" />
                  </Tooltip>
                </HStack>
              </dd>
            </>
          )}

          <dt>
            <Label as="span">Status</Label>
          </dt>
          <dd>
            <BodyShort>
              {kjoring.feilmelding ? (
                <Tag size="small" variant="error">
                  Feilet
                </Tag>
              ) : (
                <Tag size="small" variant="success">
                  OK
                </Tag>
              )}
            </BodyShort>
          </dd>

          {kjoring.feilmelding && (
            <>
              <dt>
                <Label as="span">Feilmelding</Label>
              </dt>
              <dd>
                <BodyShort>{kjoring.feilmelding}</BodyShort>
              </dd>
            </>
          )}
        </dl>
      </section>

      <HStack>
        {kjoring._links?.kibana && (
          <Button
            as={ReactRouterLink}
            to={(kjoring._links.kibana as HalLink).href}
            size="small"
            variant="tertiary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Se logger i Kibana
            <ExternalLinkIcon title={'Se logger i Kibana'} />
          </Button>
        )}
        {tempoUrl && (
          <Button
            as={ReactRouterLink}
            size="small"
            variant="tertiary"
            to={tempoUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Se trace i Tempo
            <ExternalLinkIcon title={'Se trace i Tempo'} />
          </Button>
        )}
        {kjoring.stackTrace && (
          <CopyButton
            size="small"
            iconPosition="right"
            copyText={kjoring.stackTrace}
            text="Kopier stack trace"
            activeText="Kopiert stack trace"
          />
        )}
        <CopyButton
          size="small"
          iconPosition="right"
          copyText={shareUrl}
          text="Kopier lenke"
          activeText="Kopiert lenke"
          icon={<LinkIcon />}
        />
      </HStack>

      <HStack gap="2" align="center" wrap>
        {filters.length > 0 && (
          <Chips>
            {filters.map((f, i) => (
              <Chips.Removable
                key={`flt|${f.mode}|${f.key}|${f.value}`}
                onClick={() => removeFilter(i)}
                style={{ color: 'var(--ax-text-contrast)' }}
              >
                {`${f.mode === 'in' ? 'inkluder' : 'ekskluder'}: ${f.key}=${f.value}`}
              </Chips.Removable>
            ))}
          </Chips>
        )}
      </HStack>

      <HStack gap="2" align="center" justify="end">
        <Button
          size="xsmall"
          variant="tertiary"
          onClick={() => setSelectedCols([...DEFAULT_COLS])}
          aria-label="Nullstill kolonner til standard"
        >
          Nullstill kolonner
        </Button>
      </HStack>

      <Table size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell aria-label="Detaljer" />
            {selectedCols.map((col) => (
              <Table.HeaderCell key={`head|${col}`} colSpan={2}>
                <HStack justify="space-between" align="center" gap="2">
                  <BodyShort>
                    {col === '_timestamp'
                      ? 'Tidspunkt'
                      : col === 'level'
                        ? 'Nivå'
                        : col === 'message'
                          ? 'Melding'
                          : col}
                  </BodyShort>

                  <ActionMenu>
                    <ActionMenu.Trigger>
                      <Button
                        variant="tertiary-neutral"
                        icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                        size="small"
                      />
                    </ActionMenu.Trigger>
                    <ActionMenu.Content>
                      {(() => {
                        const pos = selectedCols.indexOf(col)
                        const canMoveLeft = pos > 0
                        const canMoveRight = pos > -1 && pos < selectedCols.length - 1
                        return (
                          <>
                            <ActionMenu.Item
                              onSelect={() => moveColumn(col, 'left')}
                              disabled={!canMoveLeft}
                              icon={<ArrowLeftIcon />}
                            >
                              Flytt til venstre
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onSelect={() => moveColumn(col, 'right')}
                              disabled={!canMoveRight}
                              icon={<ArrowRightIcon />}
                            >
                              Flytt til høyre
                            </ActionMenu.Item>
                            <ActionMenu.Item onSelect={() => removeColumn(col)} icon={<XMarkIcon />}>
                              Fjern
                            </ActionMenu.Item>
                          </>
                        )
                      })()}
                    </ActionMenu.Content>
                  </ActionMenu>
                </HStack>
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleResult.map((s) => {
            return (
              <Table.ExpandableRow
                key={`logline|${s.stream._timestamp}`}
                content={
                  <VStack gap="16">
                    {showStackTrace && s.stream.stack_trace && <pre>{s.stream.stack_trace}</pre>}

                    <Table size="small">
                      <Table.Body>
                        {Object.entries(s.stream)
                          .sort((a, b) => a[0].localeCompare(b[0], 'nb', { sensitivity: 'base' }))
                          .map(([key, value]) => {
                            const selected = isSelected(key)
                            return (
                              <Table.Row key={`details|${s.stream._timestamp}|${key}`}>
                                <Table.HeaderCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                                  <BodyShort>{key}</BodyShort>
                                </Table.HeaderCell>
                                <Table.HeaderCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                                  {!HIDE_IN_DETAILS.has(key) && (
                                    <ActionMenu>
                                      <ActionMenu.Trigger>
                                        <Button
                                          variant="tertiary-neutral"
                                          icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                                          size="small"
                                        />
                                      </ActionMenu.Trigger>
                                      <ActionMenu.Content>
                                        {(() => {
                                          return (
                                            <>
                                              <ActionMenu.Item
                                                onSelect={() => addColumn(key)}
                                                disabled={selected}
                                                icon={<PlusIcon />}
                                              >
                                                Legg til
                                              </ActionMenu.Item>
                                              <ActionMenu.Item
                                                onSelect={() => removeColumn(key)}
                                                disabled={!selected}
                                                icon={<XMarkIcon />}
                                              >
                                                Fjern
                                              </ActionMenu.Item>
                                            </>
                                          )
                                        })()}
                                      </ActionMenu.Content>
                                    </ActionMenu>
                                  )}
                                </Table.HeaderCell>
                                <Table.DataCell style={{ verticalAlign: 'top', width: 'auto' }}>
                                  <BodyShort style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                    {String(value)}
                                  </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}>
                                  <ActionMenu>
                                    <ActionMenu.Trigger>
                                      <Button
                                        variant="tertiary-neutral"
                                        icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                                        size="small"
                                      />
                                    </ActionMenu.Trigger>
                                    <ActionMenu.Content>
                                      <ActionMenu.Item
                                        onSelect={() => addFilter('in', key, String(value))}
                                        icon={<PlusCircleIcon />}
                                      >
                                        Inkluder verdi
                                      </ActionMenu.Item>
                                      <ActionMenu.Item
                                        onSelect={() => addFilter('out', key, String(value))}
                                        icon={<MinusCircleIcon />}
                                      >
                                        Ekskluder verdi
                                      </ActionMenu.Item>
                                      <ActionMenu.Item onSelect={() => copy(String(value))} icon={<FilesIcon />}>
                                        Kopier
                                      </ActionMenu.Item>
                                    </ActionMenu.Content>
                                  </ActionMenu>
                                </Table.DataCell>
                              </Table.Row>
                            )
                          })}
                      </Table.Body>
                    </Table>
                  </VStack>
                }
              >
                {selectedCols.map((col) => (
                  <Fragment key={`fragment|${s.stream._timestamp}|${col}`}>
                    <Table.DataCell key={`cell|${s.stream._timestamp}|${col}`}>
                      {col === '_timestamp'
                        ? (() => {
                            const iso = String(s.stream[col] ?? '')
                            const d = new Date(iso)
                            if (Number.isNaN(d.getTime())) return iso
                            const pad = (n: number, w = 2) => String(n).padStart(w, '0')
                            const ms = String(d.getMilliseconds()).padStart(3, '0')
                            const txt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`
                            return <BodyShort>{txt}</BodyShort>
                          })()
                        : col === 'level'
                          ? (() => {
                              const lvl = String(s.stream[col] ?? '').toLowerCase()
                              const variant: TagProps['variant'] =
                                lvl === 'error'
                                  ? 'error'
                                  : lvl === 'warn' || lvl === 'warning'
                                    ? 'warning'
                                    : lvl === 'info'
                                      ? 'info'
                                      : 'neutral'
                              return (
                                <Tag size="small" variant={variant}>
                                  {s.stream[col] ?? ''}
                                </Tag>
                              )
                            })()
                          : String(s.stream[col] ?? '')}
                    </Table.DataCell>
                    <Table.DataCell
                      key={`cell|${s.stream._timestamp}|${col}|menu`}
                      style={{ verticalAlign: 'top', whiteSpace: 'nowrap', width: '1%' }}
                    >
                      <ActionMenu>
                        <ActionMenu.Trigger>
                          <Button
                            variant="tertiary-neutral"
                            icon={<MenuElipsisVerticalIcon title="Saksmeny" />}
                            size="small"
                          />
                        </ActionMenu.Trigger>
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onSelect={() => addFilter('in', col, String(s.stream[col] ?? ''))}
                            icon={<PlusCircleIcon />}
                          >
                            Inkluder verdi
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onSelect={() => addFilter('out', col, String(s.stream[col] ?? ''))}
                            icon={<MinusCircleIcon />}
                          >
                            Ekskluder verdi
                          </ActionMenu.Item>
                          <ActionMenu.Item onSelect={() => copy(String(s.stream[col] ?? ''))} icon={<FilesIcon />}>
                            Kopier
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </Table.DataCell>
                  </Fragment>
                ))}
              </Table.ExpandableRow>
            )
          })}
        </Table.Body>
      </Table>
    </VStack>
  )
}
