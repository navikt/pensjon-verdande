import type { Kriterium } from '../../lib/kriterier'
import { DatoInput } from './DatoInput'

type Props = {
  kriterium: Extract<
    Kriterium,
    { type: 'OPPRETTET_I_PERIODE' | 'FULLFORT_I_PERIODE' | 'STOPPET_I_PERIODE' | 'SIST_KJORT_I_PERIODE' }
  >
  onChange: (k: Props['kriterium']) => void
  feil?: { fom?: string; tom?: string }
}

export function PeriodeEditor({ kriterium, onChange, feil }: Props) {
  return (
    <div style={{ display: 'flex', gap: 'var(--ax-space-12)' }}>
      <DatoInput
        label="Fra og med"
        value={kriterium.fom}
        onChange={(v) => onChange({ ...kriterium, fom: v })}
        error={feil?.fom}
      />
      <DatoInput
        label="Til og med"
        value={kriterium.tom}
        onChange={(v) => onChange({ ...kriterium, tom: v })}
        error={feil?.tom}
      />
    </div>
  )
}
