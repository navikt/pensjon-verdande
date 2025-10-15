import { isRouteErrorResponse } from 'react-router'
import type { NormalizedError } from '~/services/api.server'

declare class DataWithResponseInit<D> {
  type: string
  data: D
  init: ResponseInit | null
  constructor(data: D, init?: ResponseInit)
}
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

export function isDataWithResponseInit<D = unknown>(value: unknown): value is DataWithResponseInit<D> {
  if (!isRecord(value)) return false
  const t = value.type
  const hasData = 'data' in value
  const init = (value as { init?: unknown }).init
  return t === 'DataWithResponseInit' && hasData && (init === null || typeof init === 'object' || init === undefined)
}

function isNormalizedError(value: unknown): value is NormalizedError {
  if (!isRecord(value)) return false
  return (
    typeof value.status === 'number' &&
    (value.title === undefined || typeof value.title === 'string') &&
    (value.message === undefined || typeof value.message === 'string') &&
    (value.detail === undefined || typeof value.detail === 'string')
  )
}

export function isDataWithNormalizedError(value: unknown): value is DataWithResponseInit<NormalizedError> {
  if (!isDataWithResponseInit<unknown>(value)) return false
  return isNormalizedError((value as DataWithResponseInit<unknown>).data)
}

export function toNormalizedError(err: unknown): NormalizedError | null {
  // Case 1: our structured DataWithResponseInit<NormalizedError>
  if (isDataWithNormalizedError(err)) return err.data

  // Case 2: React Router ErrorResponse (thrown via throw json()/Response)
  if (isRouteErrorResponse(err)) {
    const { status, statusText, data } = err
    const d = (isRecord(data) ? data : {}) as Record<string, unknown>
    return {
      status,
      title: typeof d.title === 'string' ? d.title : statusText,
      message: typeof d.message === 'string' ? d.message : undefined,
      detail: typeof d.detail === 'string' ? d.detail : undefined,
      raw: data,
    }
  }

  // Case 3: plain Error
  if (err instanceof Error) {
    return { status: 500, title: 'Error', message: err.message, raw: err }
  }

  // Unknown shape
  return null
}
