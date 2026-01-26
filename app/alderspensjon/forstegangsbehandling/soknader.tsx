import { CalendarIcon, ClockDashedIcon, ExternalLinkIcon, FilterIcon } from '@navikt/aksel-icons'
import {
  Bleed,
  BodyShort,
  Box,
  Button,
  Chips,
  CopyButton,
  Detail,
  ErrorMessage,
  Heading,
  HStack,
  Link,
  List,
  Loader,
  Modal,
  Page,
  Pagination,
  ReadMore,
  Select,
  Tag,
  ToggleGroup,
  VStack,
} from '@navikt/ds-react'
import { sub } from 'date-fns'
import type React from 'react'
import { useMemo, useRef } from 'react'
import { NavLink, useLoaderData, useNavigation, useSearchParams } from 'react-router'
import {
  type KildeOppsummering,
  KildeOppsummeringVisning,
} from '~/alderspensjon/forstegangsbehandling/KildeOppsummeringVisning'
import type { AlderspensjonssoknadDto, BehandlingStatus } from '~/alderspensjon/forstegangsbehandling/types'
import { fmtDateTime, formatBehandlingstid, formatIsoDate, relativeFromNow, toIsoDate } from '~/common/date'
import { decodeAldeBehandlingStatus, decodeBehandlingstype } from '~/common/decode'
import { decodeAktivitet } from '~/common/decodeBehandling'
import { replaceTemplates } from '~/common/replace-templates'
import { subdomain } from '~/common/utils'
import { apiGet } from '~/services/api.server'
import { env, isAldeLinkEnabled } from '~/services/env.server'
import type { PageResponse } from '~/types'
import css from './soknader.module.css'

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 20)

  const ferdig = (url.searchParams.get('ferdig') ?? 'alle') as 'alle' | 'uferdige' | 'ferdige'
  const statusCsv = url.searchParams.get('status') ?? ''
  const sort = url.searchParams.get('sort') ?? 'opprettet,desc'

  const now = new Date()

  const fomDato = url.searchParams.get('fomDato') || toIsoDate(sub(now, { days: 30 }))
  const tomDato = url.searchParams.get('tomDato') || toIsoDate(now)

  const qs = new URLSearchParams({
    page: String(page),
    size: String(size),
    ferdig,
    status: statusCsv,
    sort,
  })

  const dateRangeSearchParams = new URLSearchParams()
  dateRangeSearchParams.set('fomDato', fomDato)
  dateRangeSearchParams.set('tomDato', tomDato)

  const data = await apiGet<PageResponse<AlderspensjonssoknadDto>>(
    `/api/alderspensjon/forstegangsbehandling/behandling?${qs.toString()}`,
    request,
  )

  const kildeOppsummering = await apiGet<KildeOppsummering[]>(
    `/api/alderspensjon/forstegangsbehandling/kilde-oppsummering?${dateRangeSearchParams.toString()}`,
    request,
  )

  const nowIso = new Date().toISOString()

  return {
    aldeBehandlingUrlTemplate: isAldeLinkEnabled
      ? replaceTemplates(env.aldeBehandlingUrlTemplate, { subdomain: subdomain(url) })
      : undefined,
    nowIso,
    page: data,
    pageIndex: page,
    pageSize: size,
    psakSakUrlTemplate: replaceTemplates(env.psakSakUrlTemplate, { subdomain: subdomain(url) }),
    kildeOppsummering,
    fomDato,
    tomDato,
  }
}

type SortField = 'opprettet' | 'sisteKjoring' | 'ferdig'
type SortDir = 'asc' | 'desc'

function parseSortParam(sp: URLSearchParams): { field: SortField; dir: SortDir } {
  const raw = sp.get('sort') ?? 'opprettet,desc'
  const [field, dir] = raw.split(',')
  const f: SortField = (['opprettet', 'sisteKjoring', 'ferdig'].includes(field) ? field : 'opprettet') as SortField
  const d: SortDir = dir === 'asc' || dir === 'desc' ? dir : 'desc'
  return { field: f, dir: d }
}

function buildSortParam(field: SortField, dir: SortDir) {
  return `${field},${dir}`
}

function clampFerdig(val: string): 'alle' | 'uferdige' | 'ferdige' {
  if (val === 'alle' || val === 'uferdige' || val === 'ferdige') {
    return val
  }
  return 'alle'
}

const statusConfig: Record<
  BehandlingStatus,
  {
    label: string
    variant: React.ComponentProps<typeof Tag>['variant']
  }
> = {
  OPPRETTET: { label: 'Opprettet', variant: 'info' },
  UNDER_BEHANDLING: { label: 'Under behandling', variant: 'alt1' },
  FULLFORT: { label: 'Fullført', variant: 'success' },
  STOPPET: { label: 'Stoppet', variant: 'warning' },
  DEBUG: { label: 'Debug', variant: 'neutral' },
  FEILENDE: { label: 'Feilende', variant: 'error' },
}

function activeFilterSummary(sp: URLSearchParams) {
  const parts: string[] = []
  const ferdig = sp.get('ferdig')
  if (ferdig && ferdig !== 'alle') {
    parts.push(ferdig === 'ferdige' ? 'Ferdige' : 'Uferdige')
  }
  const status = (sp.get('status') ?? '').split(',').filter(Boolean)
  if (status.length > 0) parts.push(`Status: ${status.join(', ')}`)
  return parts
}

export default function Alderspensjonssoknader() {
  const {
    aldeBehandlingUrlTemplate,
    nowIso,
    page,
    pageIndex,
    pageSize,
    psakSakUrlTemplate,
    kildeOppsummering,
    fomDato,
    tomDato,
  } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigation = useNavigation()
  const { field: sortField, dir: sortDir } = parseSortParam(searchParams)
  const summary = useMemo(() => activeFilterSummary(searchParams), [searchParams])
  const ref = useRef<HTMLDialogElement>(null)

  const totalPages = page.totalPages

  function updateParams(mutator: (p: URLSearchParams) => void) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        mutator(next)
        return next
      },
      { preventScrollReset: true },
    )
  }

  function updateParam(key: string, value?: string) {
    updateParams((p) => {
      if (!value) p.delete(key)
      else p.set(key, value)
    })
  }

  function onToggleFerdig(next: 'alle' | 'uferdige' | 'ferdige') {
    updateParam('ferdig', next)
  }

  function onToggleStatus(next: BehandlingStatus, checked: boolean) {
    const current = new Set((searchParams.get('status')?.split(',') ?? []).filter(Boolean))
    if (checked) current.add(next)
    else current.delete(next)
    updateParam('status', Array.from(current).join(','))
  }

  function onChangePage(p: number) {
    // Aksel teller fra 1, Spring teller fra 0
    updateParam('page', String(p - 1))
  }

  function onChangeSortField(field: SortField) {
    updateParams((p) => {
      p.set('sort', buildSortParam(field, sortDir))
      p.set('page', '0')
    })
  }

  function onChangeSortDir(dir: SortDir) {
    updateParams((p) => {
      p.set('sort', buildSortParam(sortField, dir))
      p.set('page', '0')
    })
  }

  function onChangeSize(sz: number) {
    updateParams((p) => {
      p.set('size', String(sz))
      p.set('page', '0')
    })
  }

  return (
    <Page.Block>
      <Bleed marginInline={'12 12'} marginBlock={'space-16'} asChild>
        <Box>
          <Heading className={css.topBanner} level={'1'} size={'large'} style={{ marginTop: 0 }}>
            <div className={css.topBannerContent}>
              <div className={css.topBannerText}>Førstegangsbehandling alderspensjon</div>
              <div className={css.topBannerImgContainer}>
                <img src="/alderspensjon.svg" className={css.illustration} alt="" />
              </div>
            </div>
          </Heading>
        </Box>
      </Bleed>

      <VStack gap="space-6" paddingBlock={'space-8'}>
        <KildeOppsummeringVisning data={kildeOppsummering} fomDato={fomDato} tomDato={tomDato} />

        <HStack justify="space-between" wrap>
          {summary.length > 0 ? (
            <Chips size="small">
              {summary.map((s) => (
                <Chips.Removable
                  key={s}
                  onClick={() => {
                    updateParams((p) => {
                      p.delete('status')
                      p.set('ferdig', 'alle')
                      p.set('page', '0')
                    })
                  }}
                >
                  {s}
                </Chips.Removable>
              ))}
            </Chips>
          ) : (
            <div></div>
          )}

          <Button
            icon={<FilterIcon aria-hidden />}
            size="small"
            variant="secondary"
            onClick={() => ref.current?.showModal()}
          >
            Søkefilter
          </Button>
        </HStack>

        {navigation.state === 'loading' ? (
          <HStack justify="center">
            <Loader size="xlarge" />
          </HStack>
        ) : page.content.length === 0 ? (
          <EmptyState />
        ) : (
          <VStack gap="space-3">
            {page.content.map((b) => (
              <BehandlingCard
                key={b.uuid}
                b={b}
                aldeBehandlingUrlTemplate={aldeBehandlingUrlTemplate}
                nowIso={nowIso}
                psakSakUrlTemplate={psakSakUrlTemplate}
              />
            ))}
          </VStack>
        )}

        <HStack justify="center" style={{ paddingTop: 16 }}>
          <Pagination page={(pageIndex ?? 0) + 1} count={totalPages} onPageChange={onChangePage} prevNextTexts />
        </HStack>
      </VStack>
      <Modal ref={ref} header={{ heading: 'Søkefilter' }}>
        <Modal.Body>
          {' '}
          <VStack gap="space-6">
            <FilterBar
              ferdig={clampFerdig(searchParams.get('ferdig') ?? 'alle')}
              status={(searchParams.get('status')?.split(',').filter(Boolean) as BehandlingStatus[]) ?? []}
              onToggleFerdig={(val) => {
                onToggleFerdig(val) /* setFiltersOpen(false) om ønskelig */
              }}
              onToggleStatus={(s, checked) => {
                onToggleStatus(s, checked) /* setFiltersOpen(false) */
              }}
              pageSize={pageSize}
              onChangeSize={(sz) => {
                onChangeSize(sz) /* setFiltersOpen(false) */
              }}
              totalElements={page.totalElements}
              sortField={sortField}
              sortDir={sortDir}
              onChangeSortField={(f) => {
                onChangeSortField(f) /* setFiltersOpen(false) */
              }}
              onChangeSortDir={(d) => {
                onChangeSortDir(d) /* setFiltersOpen(false) */
              }}
            />
          </VStack>
        </Modal.Body>
      </Modal>
    </Page.Block>
  )
}

function FilterBar({
  ferdig,
  status,
  onToggleFerdig,
  onToggleStatus,
  pageSize,
  onChangeSize,
  sortField,
  sortDir,
  onChangeSortField,
  onChangeSortDir,
}: {
  ferdig: 'alle' | 'uferdige' | 'ferdige'
  status: BehandlingStatus[]
  onToggleFerdig: (next: 'alle' | 'uferdige' | 'ferdige') => void
  onToggleStatus: (next: BehandlingStatus, checked: boolean) => void
  pageSize: number
  onChangeSize: (size: number) => void
  totalElements: number
  sortField: SortField
  sortDir: SortDir
  onChangeSortField: (field: SortField) => void
  onChangeSortDir: (dir: SortDir) => void
}) {
  const allStatuses: BehandlingStatus[] = ['OPPRETTET', 'UNDER_BEHANDLING', 'FULLFORT', 'STOPPET', 'DEBUG', 'FEILENDE']

  return (
    <VStack gap="space-3">
      <div>
        <Detail style={{ marginBottom: 8 }}>Fullføringsgrad</Detail>
        <ToggleGroup size="small" onChange={(val) => onToggleFerdig(clampFerdig(val))} value={ferdig}>
          <ToggleGroup.Item value="alle">Alle</ToggleGroup.Item>
          <ToggleGroup.Item value="uferdige">Uferdige</ToggleGroup.Item>
          <ToggleGroup.Item value="ferdige">Ferdige</ToggleGroup.Item>
        </ToggleGroup>
      </div>

      <div>
        <Detail style={{ marginBottom: 8 }}>Status</Detail>
        <Chips size="small">
          {allStatuses.map((s) => {
            const checked = status.includes(s)
            const { label } = statusConfig[s]
            return (
              <Chips.Toggle key={s} selected={checked} onClick={() => onToggleStatus(s, !checked)}>
                {label}
              </Chips.Toggle>
            )
          })}
        </Chips>
      </div>

      <div>
        <Detail style={{ marginBottom: 8 }}>Sortering</Detail>

        <HStack gap="space-2" wrap>
          <Select
            label="Felt"
            size="small"
            value={sortField}
            onChange={(e) => onChangeSortField(e.target.value as SortField)}
          >
            <option value="opprettet">Opprettet</option>
            <option value="sisteKjoring">Siste kjøring</option>
            <option value="ferdig">Ferdig</option>
          </Select>

          <ToggleGroup
            label="Retning"
            size="small"
            value={sortDir}
            onChange={(val) => onChangeSortDir((val as SortDir) ?? 'desc')}
          >
            <ToggleGroup.Item value="asc">Stigende</ToggleGroup.Item>
            <ToggleGroup.Item value="desc">Synkende</ToggleGroup.Item>
          </ToggleGroup>
        </HStack>
      </div>

      <HStack gap="space-4" wrap>
        <Select
          label="Elementer per side"
          size="small"
          value={String(pageSize)}
          onChange={(e) => onChangeSize(Number(e.target.value))}
        >
          {[10, 20, 50, 100].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </HStack>
    </VStack>
  )
}

function BehandlingCard({
  aldeBehandlingUrlTemplate,
  b,
  nowIso,
  psakSakUrlTemplate,
}: {
  aldeBehandlingUrlTemplate?: string
  b: AlderspensjonssoknadDto
  nowIso: string
  psakSakUrlTemplate: string
}) {
  const C = statusConfig[b.status]
  const tid = formatBehandlingstid(b.opprettet, b.ferdig, nowIso)

  const enhet = b.enhetId && b.enhetId + (b.enhetsNavn != null ? ` - ${b.enhetsNavn}` : '')

  return (
    <Box.New
      as="article"
      borderWidth="1"
      padding={{ xs: '4', md: '5' }}
      borderRadius={'large'}
      borderColor={'neutral-subtleA'}
    >
      <VStack gap="space-3">
        <HStack justify="space-between" wrap>
          <HStack gap="space-2" align="center">
            <Heading level="3" size="small">
              <Link as={NavLink} to={`/behandling/${b.behandlingId}`}>
                Behandling #{b.behandlingId}
              </Link>
            </Heading>
            <Tag size="small" variant={C.variant}>
              {C.label}
            </Tag>
          </HStack>
          <HStack gap="space-2" align="center">
            <CalendarIcon aria-hidden />
            <Detail title={b.onsketVirkningsdato}>Ønsket virkningsdato: {formatIsoDate(b.onsketVirkningsdato)}</Detail>
          </HStack>
        </HStack>

        <HStack wrap gap="space-6">
          <KV
            label="Siste kjøring"
            value={fmtDateTime(b.sisteKjoring)}
            hint={relativeFromNow(b.sisteKjoring, nowIso)}
            fixedWidthCh={20}
            noWrap
          />
          <KV label="Opprettet" value={fmtDateTime(b.opprettet)} fixedWidthCh={18} noWrap />
          <KV label="Utsatt til" value={fmtDateTime(b.utsattTil)} fixedWidthCh={18} noWrap />
          <KV label="Ferdig" value={fmtDateTime(b.ferdig)} fixedWidthCh={18} noWrap />
          <KV
            label="Behandlingstid"
            value={<span title={tid.title}>{tid.display}</span>}
            hint={b.ferdig ? undefined : 'pågår'}
            fixedWidthCh={20}
            noWrap
          />
          <KV label="Behandlingstype" value={decodeBehandlingstype(b.behandlingstype)} />
          <KV label="Aldestatus" value={decodeAldeBehandlingStatus(b.aldeStatus)} />
          {enhet && <KV label="Enhet" value={enhet} />}
        </HStack>

        {b.nesteAktiviteter.length === 1 ? (
          <div>
            <Detail style={{ marginBottom: 4 }}>Neste aktivitet</Detail>
            <BodyShort size="small">{decodeAktivitet(b.nesteAktiviteter[0])}</BodyShort>
          </div>
        ) : b.nesteAktiviteter.length > 1 ? (
          <div>
            <Detail style={{ marginBottom: 4 }}>Neste aktiviteter</Detail>
            <List as="ul" size="small">
              {b.nesteAktiviteter.map((a) => (
                <List.Item key={a}>{decodeAktivitet(a)}</List.Item>
              ))}
            </List>
          </div>
        ) : null}

        {b.kontrollpunkter.length === 1 ? (
          <div>
            <Detail style={{ marginBottom: 4 }}>Kontrollpunkt</Detail>
            <BodyShort size="small">{b.kontrollpunkter[0].type}</BodyShort>
          </div>
        ) : b.kontrollpunkter.length > 1 ? (
          <div>
            <Detail style={{ marginBottom: 4 }}>Kontrollpunkter</Detail>
            <List as="ul" size="small">
              {b.kontrollpunkter.map((a) => (
                <List.Item key={a.type}>{a.type}</List.Item>
              ))}
            </List>
          </div>
        ) : null}

        {b.feilmelding && (
          <VStack gap="space-2">
            <KV label="Feilmelding" value={<ErrorMessage size="small">{b.feilmelding}</ErrorMessage>} />

            {b.stackTrace && (
              <ReadMore size={'small'} header="Vis stack trace">
                <HStack align="center" style={{ marginBottom: 8 }}>
                  <Detail>Stack trace</Detail>
                  <CopyButton size="small" copyText={b.stackTrace} />
                </HStack>
                <pre className={css.pre}>{b.stackTrace}</pre>
              </ReadMore>
            )}
          </VStack>
        )}

        <HStack justify="space-between" wrap>
          <HStack align="center">
            <Detail>Sak {b.sakId}</Detail>
            <CopyButton size={'small'} copyText={`${b.sakId}`} />
          </HStack>
          <HStack gap="space-2">
            <Button size="small" variant="tertiary">
              <Link
                href={replaceTemplates(psakSakUrlTemplate, { sakId: b.sakId })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Åpne i Psak
                <ExternalLinkIcon title={'Åpne i Psak'} />
              </Link>
            </Button>
            {aldeBehandlingUrlTemplate && (b.erAldeBehandling || b.erMuligAldeBehandling) && (
              <Button size="small" variant="tertiary">
                <Link
                  href={replaceTemplates(aldeBehandlingUrlTemplate, { behandlingId: b.behandlingId })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Åpne i Alde
                  <ExternalLinkIcon title={'Åpne i Alde'} />
                </Link>
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box.New>
  )
}

function KV({
  label,
  value,
  hint,
  fixedWidthCh,
  noWrap,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  fixedWidthCh?: number
  noWrap?: boolean
}) {
  const style =
    fixedWidthCh != null
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          width: `${fixedWidthCh}ch`,
          whiteSpace: noWrap ? 'nowrap' : undefined,
        }
      : undefined

  return (
    <VStack gap="space-1" className={css.kv}>
      <Detail>{label}</Detail>
      <HStack gap="space-2" style={style}>
        <BodyShort as={'div'}>{value}</BodyShort>
        {hint && (
          <Detail className={css.hint}>
            <ClockDashedIcon aria-hidden className={css.iconAlign} />
            {hint}
          </Detail>
        )}
      </HStack>
    </VStack>
  )
}

function EmptyState() {
  return (
    <Box.New
      borderWidth="1"
      padding={{ xs: '8' }}
      borderRadius={'large'}
      style={{ textAlign: 'center' }}
      borderColor={'neutral-subtleA'}
    >
      <VStack gap="space-2" align="center">
        <Heading level="2" size="small">
          Ingen søknader matcher filtrene
        </Heading>
        <BodyShort>Juster filtrene eller tilbakestill for å se flere.</BodyShort>
      </VStack>
    </Box.New>
  )
}
