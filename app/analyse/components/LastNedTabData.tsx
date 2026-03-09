import { DownloadIcon } from '@navikt/aksel-icons'
import { Button, HStack } from '@navikt/ds-react'
import { useCallback } from 'react'

interface Props {
  data: unknown
  filnavn: string
  label?: string
}

export function flattenForCsv(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((item) => item != null && typeof item === 'object')
  if (data != null && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    for (const val of Object.values(obj)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') return val
    }
    return [obj]
  }
  return []
}

export function toCsv(data: unknown): string {
  const rows = flattenForCsv(data)
  if (rows.length === 0) return ''

  const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
  const escapeCsv = (v: unknown) => {
    const s = v == null ? '' : String(v)
    // Neutralize spreadsheet formula injection (=, +, -, @, tab, CR)
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return safe.includes(';') || safe.includes('"') || safe.includes('\n') ? `"${safe.replace(/"/g, '""')}"` : safe
  }

  const lines = [headers.map(escapeCsv).join(';')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsv(row[h])).join(';'))
  }
  return lines.join('\n')
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function LastNedTabData({ data, filnavn, label = 'Last ned data' }: Props) {
  const handleJson = useCallback(() => {
    const json = JSON.stringify(data, null, 2)
    const name = filnavn.endsWith('.json') ? filnavn : `${filnavn}.json`
    downloadBlob(json, name, 'application/json')
  }, [data, filnavn])

  const handleCsv = useCallback(() => {
    const csv = toCsv(data)
    if (!csv) return
    const name = `${filnavn.replace(/\.json$/, '')}.csv`
    downloadBlob(csv, name, 'text/csv;charset=utf-8')
  }, [data, filnavn])

  return (
    <HStack gap="space-8">
      <Button size="small" variant="tertiary" icon={<DownloadIcon aria-hidden />} onClick={handleCsv}>
        {label} (CSV)
      </Button>
      <Button size="small" variant="tertiary" icon={<DownloadIcon aria-hidden />} onClick={handleJson}>
        {label} (JSON)
      </Button>
    </HStack>
  )
}
