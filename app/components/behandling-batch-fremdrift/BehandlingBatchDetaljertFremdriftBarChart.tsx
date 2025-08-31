import { Bar } from 'react-chartjs-2'

import type { DetaljertFremdriftDTO } from '~/types'
import 'chart.js/auto'

type Props = {
  detaljertFremdrift: DetaljertFremdriftDTO
}

export function BehandlingBatchDetaljertFremdriftBarChart(props: Props) {
  return (
    <Bar
      data={{
        labels: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => `${it.level} ${it.behandlingCode}`),
        datasets: [
          {
            label: 'OPPRETTET',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.opprettet),
            borderWidth: 1,
          },
          {
            label: 'UNDER_BEHANDLING',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.underBehandling),
            borderWidth: 1,
          },
          {
            label: 'FEILENDE',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.feilende),
            borderWidth: 1,
          },
          {
            label: 'STOPPET',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.stoppet),
            borderWidth: 1,
          },
          {
            label: 'DEBUG',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.debug),
            borderWidth: 1,
          },
          {
            label: 'FULLFORT',
            data: props.detaljertFremdrift.behandlingerDetaljertFremdrift.map((it) => it.fullfort),
            borderWidth: 1,
          },
        ],
      }}
      options={{
        responsive: true,
      }}
    />
  )
}
