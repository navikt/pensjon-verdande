import type { SortState } from '@navikt/ds-react'

export interface PageDTO<T> {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  sort?: string | null
}

export interface BehandlingAuditDTO {
  id: string
  tidspunkt: string
  navident: string
  handling: string
  handlingDekode: string
  handlingType: string
  behandlingId: number
  behandlingType: string | null
  behandlingStatus: string
  aktivitetId?: number | null
  aktivitetType?: string | null
  aktivitetStatus?: string | null
  kjoringId?: number | null
  begrunnelse?: string | null
  issue?: string | null
}

export interface BehandlingAuditGroupedDTO {
  navident: string
  handling: string
  handlingDecode: string
  handlingType: string
  behandlingId: number
  behandlingType: string
  behandlingStatus: string
  aktivitetId?: number | null
  aktivitetType?: string | null
  aktivitetStatus?: string | null
  kjoringId?: number | null
  antall: number
  forsteTidspunkt: string
  sisteTidspunkt: string
  begrunnelse?: string | null
  issue?: string | null
}

export interface AuditSortState extends SortState {
  orderBy: keyof BehandlingAuditDTO
}

export interface AuditGroupedSortState extends SortState {
  orderBy: keyof BehandlingAuditGroupedDTO
}
