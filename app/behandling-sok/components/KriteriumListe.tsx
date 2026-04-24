import { ActionMenu, Button, VStack } from '@navikt/ds-react'
import type { KriterieGruppe, KriterieType, Kriterium, Valideringsfeil } from '../lib/kriterier'
import { ALLE_KRITERIE_TYPER, KRITERIE_DEFINISJONER } from '../lib/kriterier'
import type { BehandlingMetadata } from '../metadata-cache.server'
import { KriteriumDispatcher } from './KriteriumDispatcher'

type Props = {
  kriterier: Kriterium[]
  metadata: BehandlingMetadata | null
  feil: Valideringsfeil[]
  onChange: (nye: Kriterium[]) => void
}

const GRUPPE_REKKEFOLGE: KriterieGruppe[] = ['Tid', 'Behandling', 'Aktiviteter', 'Krav & sak']

export function KriteriumListe({ kriterier, metadata, feil, onChange }: Props) {
  function leggTil(type: KriterieType) {
    const defaultVerdi = KRITERIE_DEFINISJONER[type].defaultVerdi()
    onChange([...kriterier, defaultVerdi])
  }

  function endre(idx: number, k: Kriterium) {
    onChange(kriterier.map((eks, i) => (i === idx ? k : eks)))
  }

  function fjern(idx: number) {
    onChange(kriterier.filter((_, i) => i !== idx))
  }

  return (
    <VStack gap="space-12">
      {kriterier.map((k, idx) => (
        <KriteriumDispatcher
          key={`${k.type}-${idx}`}
          kriterium={k}
          indeks={idx}
          metadata={metadata}
          feilForKriterium={feil.filter((f) => f.kriterieIndeks === idx)}
          onChange={(ny) => endre(idx, ny)}
          onFjern={() => fjern(idx)}
        />
      ))}

      <ActionMenu>
        <ActionMenu.Trigger>
          <Button variant="secondary" size="small">
            + Legg til kriterium
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          {GRUPPE_REKKEFOLGE.map((gruppe) => {
            const typerIGruppe = ALLE_KRITERIE_TYPER.filter((t) => KRITERIE_DEFINISJONER[t].gruppe === gruppe)
            return (
              <ActionMenu.Group key={gruppe} label={gruppe}>
                {typerIGruppe.map((type) => (
                  <ActionMenu.Item key={type} onSelect={() => leggTil(type)}>
                    {KRITERIE_DEFINISJONER[type].visningsnavn}
                    {KRITERIE_DEFINISJONER[type].tidsfilter ? ' ★' : ''}
                  </ActionMenu.Item>
                ))}
              </ActionMenu.Group>
            )
          })}
        </ActionMenu.Content>
      </ActionMenu>
    </VStack>
  )
}
