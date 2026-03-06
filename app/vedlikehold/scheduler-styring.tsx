import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Chips,
  Detail,
  Dialog,
  Heading,
  HStack,
  Search,
  Select,
  type SortState,
  Switch,
  Table,
  Tabs,
  VStack,
} from '@navikt/ds-react'
import { useMemo, useState } from 'react'
import { useFetcher } from 'react-router'
import { decodeStyringHandling } from '~/common/decode'
import { decodeBehandling } from '~/common/decodeBehandling'
import { toNormalizedError } from '~/common/error'
import { apiDelete, apiGet, apiPut } from '~/services/api.server'
import type { BehandlingSchedulerStyringAuditDto, BehandlingSchedulerStyringDto, SchedulerStyringDto } from '~/types'
import type { Route } from './+types/scheduler-styring'

export function meta(): Route.MetaDescriptors {
  return [{ title: 'Scheduler-styring | Verdande' }]
}

async function loadSchedulerStyring(request: Request) {
  const [schedulerStyring, typeStyringer, audit] = await Promise.all([
    apiGet<SchedulerStyringDto>('/api/behandling/styring/global', request),
    apiGet<BehandlingSchedulerStyringDto[]>('/api/behandling/styring', request),
    apiGet<BehandlingSchedulerStyringAuditDto[]>('/api/behandling/styring/audit', request),
  ])
  return { schedulerStyring, typeStyringer, audit }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await loadSchedulerStyring(request)
}

export const action = async ({ request }: Route.ActionArgs) => {
  let data: Record<string, unknown>
  try {
    data = await request.json()
  } catch {
    return { error: 'Ugyldig forespørsel: kunne ikke lese request-body' }
  }

  const operation = data?.operation

  if (typeof operation !== 'string') {
    return { error: 'Ugyldig forespørsel: mangler operation' }
  }

  try {
    switch (operation) {
      case 'setGlobal':
        if (typeof data.enabled !== 'boolean') return { error: 'Ugyldig verdi for enabled' }
        await apiPut('/api/behandling/styring/global', { enabled: data.enabled }, request)
        break
      case 'setType':
        if (typeof data.behandlingCode !== 'string') return { error: 'Ugyldig behandlingCode' }
        if (typeof data.enabled !== 'boolean') return { error: 'Ugyldig verdi for enabled' }
        await apiPut(
          `/api/behandling/styring/${encodeURIComponent(data.behandlingCode)}/enabled`,
          { enabled: data.enabled },
          request,
        )
        break
      case 'setMaksSamtidige':
        if (typeof data.behandlingCode !== 'string') return { error: 'Ugyldig behandlingCode' }
        if (data.maksSamtidige !== null && (typeof data.maksSamtidige !== 'number' || data.maksSamtidige < 1))
          return { error: 'Ugyldig verdi for maksSamtidige' }
        await apiPut(
          `/api/behandling/styring/${encodeURIComponent(data.behandlingCode)}/maks-samtidige`,
          { maksSamtidige: data.maksSamtidige },
          request,
        )
        break
      case 'resetAlleTyper':
        await apiDelete('/api/behandling/styring/typer', request)
        break
      default:
        return { error: `Ukjent operasjon: ${operation}` }
    }
  } catch (e) {
    const normalized = toNormalizedError(e)
    return { error: normalized?.message ?? normalized?.detail ?? 'Noe gikk galt' }
  }

  try {
    const result = await loadSchedulerStyring(request)
    return { ...result, error: undefined }
  } catch {
    return { error: 'Endringen ble utført, men lasting av oppdatert data feilet. Last siden på nytt.' }
  }
}

export default function SchedulerStyringPage({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>()
  const isSubmitting = fetcher.state === 'submitting'

  const data = fetcher.data && 'typeStyringer' in fetcher.data ? fetcher.data : loaderData
  const schedulerStyring = data.schedulerStyring
  const typeStyringer = data.typeStyringer ?? []
  const audit = data.audit ?? []
  const error = fetcher.data && 'error' in fetcher.data ? fetcher.data.error : undefined

  const [confirmation, setConfirmation] = useState<{
    title: string
    text: string
    onOk: () => void
    okLabel: string
    danger?: boolean
  } | null>(null)

  function submitAction(payload: Record<string, unknown>) {
    fetcher.submit(JSON.stringify(payload), { method: 'POST', encType: 'application/json' })
  }

  function withConfirmation(title: string, text: string, okLabel: string, action: () => void, danger?: boolean) {
    setConfirmation({ title, text, onOk: action, okLabel, danger })
  }

  return (
    <VStack gap="space-24">
      <VStack gap="space-8">
        <Heading size="large">Scheduler-styring</Heading>
        <BodyLong>
          Styr behandlingsløsningen ved å slå den av og på globalt, deaktivere enkeltbehandlinger, eller begrense antall
          samtidige prosesseringer per type.
        </BodyLong>
      </VStack>

      {error && (
        <Alert variant="error" inline>
          {error}
        </Alert>
      )}

      <Tabs defaultValue="global">
        <Tabs.List>
          <Tabs.Tab value="global" label="Global styring" />
          <Tabs.Tab value="behandlingstyper" label="Behandlingstyper" />
          <Tabs.Tab value="endringslogg" label="Endringslogg" />
        </Tabs.List>
        <Tabs.Panel value="global">
          <VStack paddingBlock="space-16 space-0">
            <GlobalSection
              globalEnabled={schedulerStyring.erAktiv}
              endretAv={schedulerStyring.endretAv ?? null}
              endretDato={schedulerStyring.endretDato ?? null}
              onToggle={(enabled) => {
                if (!enabled) {
                  withConfirmation(
                    'Stopp behandlingsløsningen',
                    'Ingen behandlinger vil bli prosessert.',
                    'Stopp behandlingsløsningen',
                    () => submitAction({ operation: 'setGlobal', enabled: false }),
                    true,
                  )
                } else {
                  withConfirmation(
                    'Start behandlingsløsningen',
                    'Alle aktive behandlingstyper vil begynne å prosessere.',
                    'Start behandlingsløsningen',
                    () => submitAction({ operation: 'setGlobal', enabled: true }),
                  )
                }
              }}
              isSubmitting={isSubmitting}
            />
          </VStack>
        </Tabs.Panel>
        <Tabs.Panel value="behandlingstyper">
          <VStack gap="space-24" paddingBlock="space-16 space-0">
            <TypeSection
              typeStyringer={typeStyringer}
              onToggleType={(code, enabled) => {
                if (!enabled) {
                  withConfirmation(
                    `Deaktiver ${decodeBehandling(code)}`,
                    `${decodeBehandling(code)} vil ikke lenger bli prosessert.`,
                    'Deaktiver',
                    () => submitAction({ operation: 'setType', behandlingCode: code, enabled: false }),
                    true,
                  )
                } else {
                  submitAction({ operation: 'setType', behandlingCode: code, enabled: true })
                }
              }}
              onSetMaksSamtidige={(code, maksSamtidige) => {
                const decoded = decodeBehandling(code)
                const description =
                  maksSamtidige === null
                    ? `Fjerne begrensning på samtidige prosesseringer for ${decoded}?`
                    : `Sette maks ${maksSamtidige} samtidige prosesseringer per pod for ${decoded}?`
                const title = maksSamtidige === null ? `Fjern begrensning for ${decoded}` : `Begrens ${decoded}`
                const okLabel = maksSamtidige === null ? 'Fjern begrensning' : `Sett maks ${maksSamtidige}`
                withConfirmation(title, description, okLabel, () =>
                  submitAction({ operation: 'setMaksSamtidige', behandlingCode: code, maksSamtidige }),
                )
              }}
              onResetAlleTyper={() => {
                withConfirmation(
                  'Nullstill alle behandlingstyper',
                  'Alle behandlingstyper blir aktivert og eventuelle begrensninger på maks samtidige fjernes.',
                  'Nullstill alle',
                  () => submitAction({ operation: 'resetAlleTyper' }),
                )
              }}
              isSubmitting={isSubmitting}
            />
          </VStack>
        </Tabs.Panel>
        <Tabs.Panel value="endringslogg">
          <VStack paddingBlock="space-16 space-0">
            <AuditSection audit={audit} />
          </VStack>
        </Tabs.Panel>
      </Tabs>

      <StyringBekreftDialog
        confirmation={confirmation}
        onOk={() => {
          confirmation?.onOk()
          setConfirmation(null)
        }}
        onCancel={() => setConfirmation(null)}
      />
    </VStack>
  )
}

function StyringBekreftDialog({
  confirmation,
  onOk,
  onCancel,
}: {
  confirmation: { title: string; text: string; okLabel: string; danger?: boolean } | null
  onOk: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={confirmation !== null} onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>{confirmation?.title ?? 'Bekreft handling'}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>{confirmation?.text}</Dialog.Body>
        <Dialog.Footer>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary" size="small">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
          <Button
            type="button"
            size="small"
            onClick={onOk}
            {...(confirmation?.danger ? { 'data-color': 'danger' } : {})}
          >
            {confirmation?.okLabel ?? 'Fortsett'}
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}

function formatDato(dato: string): string {
  return new Date(dato).toLocaleString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function GlobalSection({
  globalEnabled,
  endretAv,
  endretDato,
  onToggle,
  isSubmitting,
}: {
  globalEnabled: boolean
  endretAv: string | null
  endretDato: string | null
  onToggle: (enabled: boolean) => void
  isSubmitting: boolean
}) {
  return (
    <VStack gap="space-12">
      <VStack gap="space-4">
        <Heading size="medium">Global styring</Heading>
        <BodyShort size="small">Stopper eller starter all automatisk behandling på tvers av alle typer.</BodyShort>
      </VStack>
      <Switch checked={globalEnabled} onChange={(e) => onToggle(e.target.checked)} disabled={isSubmitting}>
        Behandlingsløsningen er {globalEnabled ? 'aktiv' : 'stoppet'}
      </Switch>
      {!globalEnabled && (
        <Alert variant="warning" inline>
          Behandlingsløsningen er stoppet. Ingen behandlinger vil bli prosessert.
          {endretAv && endretDato && ` Avslått av ${endretAv} den ${formatDato(endretDato)}.`}
        </Alert>
      )}
    </VStack>
  )
}

type FilterChip = 'deaktivert' | 'begrenset'

interface TypeSortState extends SortState {
  orderBy: 'behandlingCode' | 'erAktiv' | 'maksSamtidige'
}

function TypeSection({
  typeStyringer,
  onToggleType,
  onSetMaksSamtidige,
  onResetAlleTyper,
  isSubmitting,
}: {
  typeStyringer: BehandlingSchedulerStyringDto[]
  onToggleType: (code: string, enabled: boolean) => void
  onSetMaksSamtidige: (code: string, maksSamtidige: number | null) => void
  onResetAlleTyper: () => void
  isSubmitting: boolean
}) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterChip[]>([])
  const [sort, setSort] = useState<TypeSortState>({ orderBy: 'behandlingCode', direction: 'ascending' })

  const handleSort = (sortKey: string) => {
    const key = sortKey as TypeSortState['orderBy']
    setSort(
      sort.orderBy === key && sort.direction === 'ascending'
        ? { orderBy: key, direction: 'descending' }
        : { orderBy: key, direction: 'ascending' },
    )
  }

  const toggleFilter = (filter: FilterChip) => {
    setFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const filteredAndSorted = useMemo(() => {
    let result = typeStyringer

    if (search) {
      const lower = search.toLowerCase()
      result = result.filter(
        (k) =>
          k.behandlingCode.toLowerCase().includes(lower) ||
          decodeBehandling(k.behandlingCode).toLowerCase().includes(lower),
      )
    }

    if (filters.includes('deaktivert')) {
      result = result.filter((k) => !k.erAktiv)
    }
    if (filters.includes('begrenset')) {
      result = result.filter((k) => k.maksSamtidige !== null)
    }

    const comparator = (a: BehandlingSchedulerStyringDto, b: BehandlingSchedulerStyringDto) => {
      const dir = sort.direction === 'ascending' ? 1 : -1
      switch (sort.orderBy) {
        case 'behandlingCode':
          return dir * decodeBehandling(a.behandlingCode).localeCompare(decodeBehandling(b.behandlingCode), 'nb')
        case 'erAktiv':
          return dir * (Number(a.erAktiv) - Number(b.erAktiv))
        case 'maksSamtidige':
          return dir * ((a.maksSamtidige ?? Number.MAX_SAFE_INTEGER) - (b.maksSamtidige ?? Number.MAX_SAFE_INTEGER))
        default:
          return 0
      }
    }

    return [...result].sort(comparator)
  }, [typeStyringer, search, filters, sort])

  const hasOverrides = typeStyringer.some((s) => !s.erAktiv || s.maksSamtidige !== null)

  return (
    <VStack gap="space-12">
      <HStack gap="space-12" align="end" wrap>
        <VStack gap="space-4" style={{ flex: 1 }}>
          <Heading size="medium">Behandlingstyper</Heading>
          <BodyShort size="small">
            Deaktiver enkelttyper for å stoppe prosessering av dem. Sett maks samtidige for å begrense hvor mange som
            prosesseres parallelt per pod.
          </BodyShort>
        </VStack>
        {hasOverrides && (
          <Button variant="secondary" size="small" onClick={onResetAlleTyper} disabled={isSubmitting}>
            Nullstill alle
          </Button>
        )}
      </HStack>

      <HStack gap="space-12" align="end">
        <Search
          label="Søk på behandlingstype"
          size="small"
          variant="simple"
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          style={{ maxWidth: '20rem' }}
        />
        <Chips size="small">
          <Chips.Toggle selected={filters.includes('deaktivert')} onClick={() => toggleFilter('deaktivert')}>
            Avslått
          </Chips.Toggle>
          <Chips.Toggle selected={filters.includes('begrenset')} onClick={() => toggleFilter('begrenset')}>
            Har begrensning
          </Chips.Toggle>
        </Chips>
      </HStack>

      <Table sort={sort} onSortChange={handleSort}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortKey="behandlingCode" sortable>
              Behandlingstype
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="erAktiv" sortable>
              Aktiv
            </Table.ColumnHeader>
            <Table.ColumnHeader sortKey="maksSamtidige" sortable>
              Maks samtidige
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredAndSorted.map((styring) => (
            <TypeRow
              key={styring.behandlingCode}
              styring={styring}
              onToggle={(enabled) => onToggleType(styring.behandlingCode, enabled)}
              onSetMaksSamtidige={(maksSamtidige) => onSetMaksSamtidige(styring.behandlingCode, maksSamtidige)}
              isSubmitting={isSubmitting}
            />
          ))}
        </Table.Body>
      </Table>

      {filteredAndSorted.length === 0 && (
        <BodyShort size="small">Ingen behandlingstyper matcher søket eller filteret.</BodyShort>
      )}
    </VStack>
  )
}

function TypeRow({
  styring,
  onToggle,
  onSetMaksSamtidige,
  isSubmitting,
}: {
  styring: BehandlingSchedulerStyringDto
  onToggle: (enabled: boolean) => void
  onSetMaksSamtidige: (maksSamtidige: number | null) => void
  isSubmitting: boolean
}) {
  return (
    <Table.Row>
      <Table.DataCell>
        {decodeBehandling(styring.behandlingCode)}
        {!styring.erAktiv && styring.endretAv && styring.endretDato && (
          <Detail>
            Avslått av {styring.endretAv} den {formatDato(styring.endretDato)}
          </Detail>
        )}
      </Table.DataCell>
      <Table.DataCell>
        <Switch
          size="small"
          checked={styring.erAktiv}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={isSubmitting}
          hideLabel
        >
          {styring.erAktiv ? 'Aktiv' : 'Deaktivert'}
        </Switch>
      </Table.DataCell>
      <Table.DataCell>
        <Select
          size="small"
          label="Maks samtidige"
          hideLabel
          value={styring.maksSamtidige != null ? String(styring.maksSamtidige) : ''}
          onChange={(e) => {
            const value = e.target.value
            onSetMaksSamtidige(value === '' ? null : Number(value))
          }}
          disabled={isSubmitting}
          style={{ width: '10rem' }}
        >
          <option value="">Ubegrenset</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </Select>
      </Table.DataCell>
    </Table.Row>
  )
}

function AuditSection({ audit }: { audit: BehandlingSchedulerStyringAuditDto[] }) {
  if (audit.length === 0) {
    return <BodyShort>Ingen endringer er logget ennå.</BodyShort>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
          <Table.HeaderCell>Bruker</Table.HeaderCell>
          <Table.HeaderCell>Behandlingstype</Table.HeaderCell>
          <Table.HeaderCell>Handling</Table.HeaderCell>
          <Table.HeaderCell>Fra</Table.HeaderCell>
          <Table.HeaderCell>Til</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {audit.map((entry, i) => (
          <Table.Row key={`${entry.utfortDato}-${entry.behandlingCode}-${i}`}>
            <Table.DataCell>
              <BodyShort size="small">{new Date(entry.utfortDato).toLocaleString('nb-NO')}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
              <BodyShort size="small">{entry.utfortAv}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
              <BodyShort size="small">{decodeBehandling(entry.behandlingCode)}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
              <BodyShort size="small">{decodeStyringHandling(entry.handling)}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
              <BodyShort size="small">{entry.gammelVerdi ?? '-'}</BodyShort>
            </Table.DataCell>
            <Table.DataCell>
              <BodyShort size="small">{entry.nyVerdi ?? '-'}</BodyShort>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
