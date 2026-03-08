import { Box, Button, Table } from '@navikt/ds-react'
import { useState } from 'react'
import { formaterPeriodeLabel } from '../utils/formattering'

/**
 * Generisk show/hide datatabell for diagram.
 * Viser en knapp som åpner en tabell med de underliggende dataene.
 */
export function ChartDataTable<T extends Record<string, unknown>>({
  data,
  columns,
  maxRows = 50,
}: {
  data: T[]
  columns: { key: keyof T & string; label: string; format?: (value: unknown) => string }[]
  maxRows?: number
}) {
  const [open, setOpen] = useState(false)

  if (data.length === 0) return null

  const rows = data.slice(0, maxRows)

  return (
    <Box marginBlock="space-4 space-0">
      <Button size="xsmall" variant="tertiary" onClick={() => setOpen((v) => !v)}>
        {open ? 'Skjul datatabell' : 'Vis datatabell'}
      </Button>
      {open && (
        <div style={{ maxHeight: '400px', overflow: 'auto', marginTop: 'var(--ax-space-4)' }}>
          <Table size="small" zebraStripes>
            <Table.Header>
              <Table.Row>
                {columns.map((col) => (
                  <Table.ColumnHeader key={col.key}>{col.label}</Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: tabellrader har ikke unik nøkkel
                <Table.Row key={i}>
                  {columns.map((col) => (
                    <Table.DataCell key={col.key}>
                      {col.format ? col.format(row[col.key]) : String(row[col.key] ?? '')}
                    </Table.DataCell>
                  ))}
                </Table.Row>
              ))}
              {data.length > maxRows && (
                <Table.Row>
                  <Table.DataCell colSpan={columns.length}>… og {data.length - maxRows} rader til</Table.DataCell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      )}
    </Box>
  )
}

export const formatPeriode = (v: unknown) => formaterPeriodeLabel(String(v ?? ''))
export const formatTall = (v: unknown) => (v != null ? Number(v).toLocaleString('nb-NO') : '–')
export const formatSekunder = (v: unknown) => {
  if (v == null) return '–'
  const s = Number(v)
  if (s < 60) return `${s.toFixed(0)}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
  return `${Math.floor(s / 3600)}t ${Math.round((s % 3600) / 60)}m`
}
export const formatDager = (v: unknown) => (v != null ? `${Number(v).toFixed(1)} d` : '–')
export const formatProsent = (v: unknown) => (v != null ? `${Number(v).toFixed(1)}%` : '–')
export const formatRatio = (v: unknown) => (v != null ? `${(Number(v) * 100).toFixed(1)}%` : '–')
