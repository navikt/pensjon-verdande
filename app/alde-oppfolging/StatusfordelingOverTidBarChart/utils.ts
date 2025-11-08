import type { AldeFordelingStatusOverTidDto } from '../types'

export const statusLabels: Record<string, string> = {
  FULLFORT: 'Fullført',
  UNDER_BEHANDLING: 'Under behandling',
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
}

export const parseToChartData = (data: AldeFordelingStatusOverTidDto[]): [string[], ChartOutput[]] => {
  if (data.length === 0) {
    return [[], []]
  }

  const dates = data.map((d) => d.dato).sort()
  const startDate = new Date(dates[0])
  const endDate = new Date(dates[dates.length - 1])

  const allDates: string[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    allDates.push(dateStr)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const dataMap = new Map(data.map((d) => [d.dato, d.fordeling]))

  const fordeling = allDates.reduce<ChartOutput>(
    (acc, date) => {
      const dayData = dataMap.get(date)

      if (dayData) {
        const dayMap = new Map(dayData.map((item) => [item.status, item.antall]))

        acc.AVBRUTT.push(dayMap.get('AVBRUTT') || 0)
        acc.DEBUG.push(dayMap.get('DEBUG') || 0)
        acc.FEILENDE.push(dayMap.get('FEILENDE') || 0)
        acc.FULLFORT.push(dayMap.get('FULLFORT') || 0)
        acc.STOPPET.push(dayMap.get('STOPPET') || 0)
        acc.UNDER_BEHANDLING.push(dayMap.get('UNDER_BEHANDLING') || 0)
      } else {
        acc.AVBRUTT.push(0)
        acc.DEBUG.push(0)
        acc.FEILENDE.push(0)
        acc.FULLFORT.push(0)
        acc.STOPPET.push(0)
        acc.UNDER_BEHANDLING.push(0)
      }

      return acc
    },
    {
      AVBRUTT: [],
      DEBUG: [],
      FEILENDE: [],
      FULLFORT: [],
      STOPPET: [],
      UNDER_BEHANDLING: [],
    },
  )

  return [allDates, [fordeling]]
}
