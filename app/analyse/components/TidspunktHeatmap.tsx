import { BodyShort, Box, Detail, HStack } from '@navikt/ds-react'
import { useMemo } from 'react'
import type { TidspunktDatapunkt } from '../types'

const UKEDAGER = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']
const TIMER = Array.from({ length: 24 }, (_, i) => i)

function getColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#f5f5f5'
  const intensity = value / max
  if (intensity < 0.1) return '#e3f2fd'
  if (intensity < 0.25) return '#90caf9'
  if (intensity < 0.5) return '#42a5f5'
  if (intensity < 0.75) return '#1e88e5'
  return '#0d47a1'
}

function getTextColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#666'
  const intensity = value / max
  return intensity > 0.4 ? '#fff' : '#333'
}

interface Props {
  data: TidspunktDatapunkt[]
}

export default function TidspunktHeatmap({ data }: Props) {
  const { grid, maxValue } = useMemo(() => {
    // Build 7×24 grid (ukedag 1-7, time 0-23)
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    let mv = 0

    for (const dp of data) {
      const dayIdx = dp.ukedag - 1
      if (dayIdx >= 0 && dayIdx < 7 && dp.time >= 0 && dp.time < 24) {
        g[dayIdx][dp.time] = dp.antall
        if (dp.antall > mv) mv = dp.antall
      }
    }

    return { grid: g, maxValue: mv }
  }, [data])

  if (data.length === 0) {
    return (
      <Box padding="space-32" style={{ textAlign: 'center' }}>
        <BodyShort>Ingen data i valgt tidsrom</BodyShort>
      </Box>
    )
  }

  const cellSize = 36

  return (
    <div style={{ overflowX: 'auto' }} role="img" aria-label="Varmekart: Behandlinger fordelt på ukedag og time">
      <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', textAlign: 'left' }}>
              <Detail>Ukedag \ Time</Detail>
            </th>
            {TIMER.map((hour) => (
              <th
                key={`h-${hour}`}
                style={{ width: cellSize, minWidth: cellSize, textAlign: 'center', padding: '4px 2px' }}
              >
                <Detail>{hour.toString().padStart(2, '0')}</Detail>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UKEDAGER.map((dag, dayIdx) => (
            <tr key={dag}>
              <td style={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
                <Detail weight="semibold">{dag}</Detail>
              </td>
              {TIMER.map((hour) => {
                const val = grid[dayIdx][hour]
                return (
                  <td
                    key={`${dag}-${hour}`}
                    title={`${dag} kl. ${hour.toString().padStart(2, '0')}: ${val.toLocaleString('nb-NO')} behandlinger`}
                    style={{
                      width: cellSize,
                      minWidth: cellSize,
                      height: cellSize,
                      textAlign: 'center',
                      backgroundColor: getColor(val, maxValue),
                      color: getTextColor(val, maxValue),
                      border: '1px solid var(--ax-border-neutral-subtleA)',
                      fontSize: '0.7rem',
                      cursor: 'default',
                    }}
                  >
                    {val > 0 ? val.toLocaleString('nb-NO') : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <HStack gap="space-8" align="center" style={{ marginTop: 'var(--ax-space-12)' }}>
        <Detail>Lav</Detail>
        {['#f5f5f5', '#e3f2fd', '#90caf9', '#42a5f5', '#1e88e5', '#0d47a1'].map((c) => (
          <div
            key={c}
            style={{
              width: 20,
              height: 14,
              backgroundColor: c,
              border: '1px solid var(--ax-border-neutral-subtleA)',
              borderRadius: 2,
            }}
          />
        ))}
        <Detail>Høy</Detail>
      </HStack>
    </div>
  )
}
