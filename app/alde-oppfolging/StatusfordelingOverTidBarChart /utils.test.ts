import { describe, expect, it } from 'vitest'
import { parseToChartData } from './utils'

describe('utils', () => {
  const testData = [
    {
      dato: '2025-10-13',
      fordeling: [
        {
          status: 'DEBUG',
          antall: 1,
        },
        {
          status: 'FULLFORT',
          antall: 2,
        },
      ],
    },
    {
      dato: '2025-10-14',
      fordeling: [
        {
          status: 'AVBRUTT',
          antall: 1,
        },
        {
          status: 'DEBUG',
          antall: 2,
        },
        {
          status: 'FULLFORT',
          antall: 4,
        },
        {
          status: 'UNDER_BEHANDLING',
          antall: 1,
        },
      ],
    },
    {
      dato: '2025-10-15',
      fordeling: [
        {
          status: 'FULLFORT',
          antall: 2,
        },
        {
          status: 'UNDER_BEHANDLING',
          antall: 3,
        },
      ],
    },
    {
      dato: '2025-10-16',
      fordeling: [
        {
          status: 'DEBUG',
          antall: 1,
        },
      ],
    },
    {
      dato: '2025-10-17',
      fordeling: [
        {
          status: 'AVBRUTT',
          antall: 1,
        },
        {
          status: 'DEBUG',
          antall: 1,
        },
        {
          status: 'FULLFORT',
          antall: 4,
        },
        {
          status: 'UNDER_BEHANDLING',
          antall: 1,
        },
      ],
    },
    {
      dato: '2025-10-20',
      fordeling: [
        {
          status: 'AVBRUTT',
          antall: 1,
        },
        {
          status: 'FULLFORT',
          antall: 1,
        },
        {
          status: 'UNDER_BEHANDLING',
          antall: 1,
        },
      ],
    },
  ]

  it('should bucket fordeling status on dato', () => {
    const expected = [
      ['2025-10-13', '2025-10-14', '2025-10-15', '2025-10-16', '2025-10-17', '2025-10-18', '2025-10-19', '2025-10-20'],
      [
        {
          AVBRUTT: [0, 1, 0, 0, 1, 0, 0, 1],
          DEBUG: [1, 2, 0, 1, 1, 0, 0, 0],
          FEILENDE: [0, 0, 0, 0, 0, 0, 0, 0],
          FULLFORT: [2, 4, 2, 0, 4, 0, 0, 1],
          STOPPET: [0, 0, 0, 0, 0, 0, 0, 0],
          UNDER_BEHANDLING: [0, 1, 3, 0, 1, 0, 0, 1],
        },
      ],
    ]

    const actual = parseToChartData(testData)
    expect(actual).toEqual(expected)
  })
})
