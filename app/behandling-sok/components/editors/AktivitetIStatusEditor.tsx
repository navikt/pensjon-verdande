import { BodyShort, ErrorMessage, VStack } from '@navikt/ds-react'
import type { Kriterium } from '../../lib/kriterier'
import { DatoInput } from './DatoInput'
import { MultiSelectEditor } from './MultiSelectEditor'

type Props = {
  kriterium: Extract<Kriterium, { type: 'HAR_AKTIVITET_I_STATUS' }>
  aktivitetTyper: string[]
  historiskeAktivitetTyper?: string[]
  aktivitetStatuser: string[]
  onChange: (k: Props['kriterium']) => void
  feil?: string
}

/**
 * Sammensatt editor: aktivitetstype + aktivitetstatus + valgfri periode.
 *
 * De tre delene hører sammen i ett kriterium fordi backend krever at de gjelder SAMME
 * aktivitetsrad. Splittes de i separate kriterier, kan status matche én aktivitet og
 * perioden en annen på samme behandling — stille gale treff.
 */
export function AktivitetIStatusEditor({
  kriterium,
  aktivitetTyper,
  historiskeAktivitetTyper = [],
  aktivitetStatuser,
  onChange,
  feil,
}: Props) {
  return (
    <VStack gap="space-12">
      <MultiSelectEditor
        label="Aktivitetstype"
        alternativer={aktivitetTyper}
        historiske={historiskeAktivitetTyper}
        valgte={kriterium.aktivitetTyper}
        onChange={(nye) => onChange({ ...kriterium, aktivitetTyper: nye })}
      />
      <MultiSelectEditor
        label="Aktivitetstatus"
        alternativer={aktivitetStatuser}
        valgte={kriterium.statuser}
        onChange={(nye) => onChange({ ...kriterium, statuser: nye })}
      />
      <BodyShort size="small" textColor="subtle">
        Perioden gjelder når aktiviteten ble opprettet, ikke behandlingen. La begge feltene stå tomme for å søke uten
        tidsavgrensning.
      </BodyShort>
      <div style={{ display: 'flex', gap: 'var(--ax-space-12)' }}>
        <DatoInput
          label="Aktivitet opprettet fra og med"
          value={kriterium.fom ?? ''}
          onChange={(v) => onChange({ ...kriterium, fom: v })}
        />
        <DatoInput
          label="Aktivitet opprettet til og med"
          value={kriterium.tom ?? ''}
          onChange={(v) => onChange({ ...kriterium, tom: v })}
        />
      </div>
      {feil && <ErrorMessage size="small">{feil}</ErrorMessage>}
    </VStack>
  )
}
