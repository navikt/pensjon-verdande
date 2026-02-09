import { ArrowCirclepathReverseIcon, FilterIcon } from '@navikt/aksel-icons'
import {
  Button,
  DatePicker,
  HStack,
  Modal,
  Pagination,
  Select,
  type SortState,
  Switch,
  TextField,
  useRangeDatepicker,
  VStack,
} from '@navikt/ds-react'
import { useMemo, useRef } from 'react'
import { useLoaderData, useSearchParams } from 'react-router'
import invariant from 'tiny-invariant'
import { AuditGroupedTable } from '~/audit/AuditGroupedTable'
import { AuditTable } from '~/audit/AuditTable'
import styles from '~/audit/audit.module.css'
import type { BehandlingAuditDTO, BehandlingAuditGroupedDTO, PageDTO } from '~/audit/audit.types'
import { apiGet } from '~/services/api.server'
import type { Route } from './+types/behandling.$behandlingId.audit'

export async function loader({ params, request }: Route.LoaderArgs) {
  const { behandlingId } = params

  invariant(behandlingId, 'Missing behandlingId param')

  const url = new URL(request.url)
  const searchParams = url.searchParams

  const view = (searchParams.get('view') === 'grouped' ? 'grouped' : 'raw') as 'raw' | 'grouped'
  if (!searchParams.has('page')) searchParams.set('page', '0')
  if (!searchParams.has('size')) searchParams.set('size', '20')
  if (!searchParams.has('sort')) {
    searchParams.set('sort', view === 'grouped' ? 'sisteTidspunkt,desc' : 'tidspunkt,desc')
  }

  searchParams.set('behandlingId', behandlingId)

  const page: PageDTO<BehandlingAuditGroupedDTO> | PageDTO<BehandlingAuditDTO> =
    view === 'grouped'
      ? await apiGet<PageDTO<BehandlingAuditGroupedDTO>>(
          `/api/behandling/audit/grouped${searchParams ? `?${searchParams.toString()}` : ''}`,
          request,
        )
      : await apiGet<PageDTO<BehandlingAuditDTO>>(
          `/api/behandling/audit${searchParams ? `?${searchParams.toString()}` : ''}`,
          request,
        )

  return {
    page,
    view,
  }
}

function isGroupedPage(
  p: PageDTO<BehandlingAuditGroupedDTO> | PageDTO<BehandlingAuditDTO>,
): p is PageDTO<BehandlingAuditGroupedDTO> {
  return p.content.length > 0 && 'antall' in p.content[0]
}

export default function AuditIndexPage() {
  const { page, view: initialView } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const filterModalRef = useRef<HTMLDialogElement>(null)

  const view = (searchParams.get('view') ?? initialView ?? 'raw') as 'raw' | 'grouped'

  const initialFrom = searchParams.get('from')?.slice(0, 10) ?? ''
  const initialTo = searchParams.get('to')?.slice(0, 10) ?? ''

  const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
    defaultSelected: initialFrom && initialTo ? { from: new Date(initialFrom), to: new Date(initialTo) } : undefined,
    allowTwoDigitYear: false,
  })

  const updateSearchParams = (name: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams)

    if (value && value.trim().length > 0) next.set(name, value)
    else next.delete(name)

    setSearchParams(next)
  }

  const clearAll = () => {
    const base = new URLSearchParams()
    setSearchParams(base)
    filterModalRef.current?.close()
  }

  const sortState = useMemo<SortState>(() => {
    const [key, dir] = (
      searchParams.get('sort') ?? (view === 'grouped' ? 'sisteTidspunkt,desc' : 'tidspunkt,desc')
    ).split(',', 2)
    return {
      orderBy: key,
      direction: dir?.toLowerCase() === 'asc' ? 'ascending' : 'descending',
    }
  }, [searchParams, view])

  const onSortChange = (next: string) => {
    const dir = sortState.direction === 'ascending' ? 'desc' : 'asc'
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('sort', `${next},${dir}`)
    nextParams.set('page', '0')
    setSearchParams(nextParams)
  }

  const onChangeView = (val: string) => {
    const v = val === 'grouped' ? 'grouped' : 'raw'
    const next = new URLSearchParams(searchParams)
    next.set('view', v)
    next.set('page', '0')
    next.set('sort', v === 'grouped' ? 'sisteTidspunkt,desc' : 'tidspunkt,desc')
    setSearchParams(next)
  }

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  const resetFilters = () => {
    const next = new URLSearchParams()
    next.set('view', view)
    next.set('page', '0')
    next.set('size', searchParams.get('size') ?? '20')
    next.set('sort', view === 'grouped' ? 'sisteTidspunkt,desc' : 'tidspunkt,desc')
    setSearchParams(next)
  }

  return (
    <div>
      <VStack align="end">
        <Switch
          value="grouped"
          checked={view === 'grouped'}
          onChange={(e) => onChangeView(e.target.checked ? 'grouped' : 'raw')}
        >
          Gruppert visning
        </Switch>
        <HStack gap="2" align="center">
          <Button
            icon={<FilterIcon aria-hidden />}
            size="small"
            variant="secondary"
            onClick={() => filterModalRef.current?.showModal()}
            title="Vis søkefiltre"
          >
            Søkefilter
          </Button>
          <Button
            icon={<ArrowCirclepathReverseIcon aria-hidden />}
            onClick={resetFilters}
            variant="secondary"
            size="small"
            title="Nullstill filtre"
          >
            Nullstill
          </Button>
        </HStack>
      </VStack>

      {isGroupedPage(page) && <AuditGroupedTable page={page} sort={sortState} onSortChange={onSortChange} />}
      {!isGroupedPage(page) && <AuditTable page={page} sort={sortState} onSortChange={onSortChange} />}

      <div className={styles.pageTopMargin}>
        <Pagination page={page.number + 1} onPageChange={(p) => goToPage(p - 1)} count={page.totalPages} />
      </div>

      <Modal ref={filterModalRef} onClose={() => filterModalRef.current?.close()} header={{ heading: 'Filtrer audit' }}>
        <Modal.Body>
          <VStack gap="6">
            <HStack gap="4" wrap>
              <TextField
                label="BehandlingId"
                inputMode="numeric"
                value={searchParams.get('behandlingId') ?? ''}
                onChange={(e) => updateSearchParams('behandlingId', e.target.value)}
              />
              <TextField
                label="Navident"
                value={searchParams.get('navident') ?? ''}
                onChange={(e) => updateSearchParams('navident', e.target.value)}
              />
              <Select
                label="Handlingtype"
                value={searchParams.get('handlingType') ?? ''}
                onChange={(e) => updateSearchParams('handlingType', e.target.value)}
              >
                <option value="">Alle</option>
                <option value="LES">Les</option>
                <option value="SKRIV">Skriv</option>
              </Select>
              <TextField
                label="Fritekst (begrunnelse/issue)"
                value={searchParams.get('q') ?? ''}
                onChange={(e) => updateSearchParams('q', e.target.value)}
              />
            </HStack>

            <fieldset className={styles.filterFieldset}>
              <legend className={styles.filterLegend}>Tidsrom</legend>
              <HStack gap="6" align="start" wrap>
                <DatePicker {...datepickerProps}>
                  <HStack wrap gap="space-16" justify="center">
                    <DatePicker.Input size="small" {...fromInputProps} label="Fra" />
                    <DatePicker.Input size="small" {...toInputProps} label="Til" />
                  </HStack>
                </DatePicker>
              </HStack>
            </fieldset>
          </VStack>
        </Modal.Body>
        <Modal.Footer>
          <HStack gap="2">
            <Button type="button" variant="secondary" onClick={clearAll}>
              Nullstill
            </Button>
            <Button type="button" variant="primary" onClick={() => filterModalRef.current?.close()}>
              Lukk
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
