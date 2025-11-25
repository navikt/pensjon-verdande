import type { AldeFordelingStatusOverTidDto } from '../types'

export const statusLabels: Record<string, string> = {
  FULLFORT: 'Fullført',
  UNDER_BEHANDLING: 'Under behandling',
  UNDER_ATTESTERING: 'Under attestering',
  AVBRUTT: 'Avbrutt',
  DEBUG: 'Debug',
  FEILENDE: 'Feilende',
  STOPPET: 'Stoppet',
}

export const statusColors: Record<string, { backgroundColor: string; borderColor: string }> = {
  FULLFORT: {
    backgroundColor: 'rgba(153, 222, 173, 0.5)', // green-200 with opacity
    borderColor: 'rgba(42, 167, 88, 1)', // green-400
  },
  UNDER_BEHANDLING: {
    backgroundColor: 'rgba(204, 225, 255, 0.5)', // blue-100 with opacity
    borderColor: 'rgba(51, 134, 224, 1)', // blue-400
  },
  UNDER_ATTESTERING: {
    backgroundColor: 'rgba(255, 236, 179, 0.7)', // gulaktig
    borderColor: 'rgba(255, 193, 7, 1)', // gul
  },
  AVBRUTT: {
    backgroundColor: 'rgba(255, 194, 194, 0.5)', // red-100 with opacity
    borderColor: 'rgba(195, 0, 0, 1)', // red-500
  },
  DEBUG: {
    backgroundColor: 'rgba(192, 178, 210, 0.5)', // purple-200 with opacity
    borderColor: 'rgba(130, 105, 162, 1)', // purple-400
  },
  FEILENDE: {
    backgroundColor: 'rgba(255, 193, 102, 0.5)', // orange-300 with opacity
    borderColor: 'rgba(199, 115, 0, 1)', // orange-600
  },
  STOPPET: {
    backgroundColor: 'rgba(236, 243, 153, 0.5)', // limegreen-200 with opacity
    borderColor: 'rgba(127, 137, 0, 1)', // limegreen-700
  },
}

export type ChartOutput = {
  AVBRUTT: number[]
  DEBUG: number[]
  FEILENDE: number[]
  FULLFORT: number[]
  STOPPET: number[]
  UNDER_BEHANDLING: number[]
  UNDER_ATTESTERING: number[]
}

export const parseToChartData = (
  data: AldeFordelingStatusOverTidDto[],
  attesteringData?: AldeFordelingStatusOverTidDto[],
): [string[], ChartOutput[]] => {
  if (data.length === 0 && (!attesteringData || attesteringData.length === 0)) {
    return [[], []]
  }

  // Merge all dates from both datasets
  const allDatesSet = new Set<string>()
  data.forEach((d) => {
    allDatesSet.add(d.dato)
  })
  if (attesteringData)
    attesteringData.forEach((d) => {
      allDatesSet.add(d.dato)
    })
  const allDates = Array.from(allDatesSet).sort()

  const dataMap = new Map(data.map((d) => [d.dato, d.fordeling]))
  const attesteringMap = attesteringData ? new Map(attesteringData.map((d) => [d.dato, d.fordeling])) : new Map()

  const fordeling = allDates.reduce<ChartOutput>(
    (acc, date) => {
      const dayData = dataMap.get(date)
      const attesteringDayData = attesteringMap.get(date)
      const dayMap = new Map((dayData || []).map((item) => [item.status, item.antall]))
      // Add UNDER_ATTESTERING from attesteringDayData
      let attesteringCount = 0
      if (attesteringDayData) {
        attesteringDayData.forEach((item: { status: string; antall: number }) => {
          if (item.status === 'UNDER_BEHANDLING') attesteringCount += item.antall
        })
      }
      acc.AVBRUTT.push(dayMap.get('AVBRUTT') || 0)
      acc.DEBUG.push(dayMap.get('DEBUG') || 0)
      acc.FEILENDE.push(dayMap.get('FEILENDE') || 0)
      acc.FULLFORT.push(dayMap.get('FULLFORT') || 0)
      acc.STOPPET.push(dayMap.get('STOPPET') || 0)
      const underBehandlingOriginal = dayMap.get('UNDER_BEHANDLING') || 0
      const underBehandlingAdjusted = Math.max(underBehandlingOriginal - attesteringCount, 0)
      acc.UNDER_BEHANDLING.push(underBehandlingAdjusted)
      acc.UNDER_ATTESTERING.push(attesteringCount)
      return acc
    },
    {
      AVBRUTT: [],
      DEBUG: [],
      FEILENDE: [],
      FULLFORT: [],
      STOPPET: [],
      UNDER_BEHANDLING: [],
      UNDER_ATTESTERING: [],
    },
  )

  return [allDates, [fordeling]]
}
