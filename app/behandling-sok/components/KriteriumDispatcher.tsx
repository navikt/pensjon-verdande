import { BodyShort, Box, Button, Heading, HStack, VStack } from '@navikt/ds-react'
import type { Kriterium } from '../lib/kriterier'
import { KRITERIE_DEFINISJONER, type Valideringsfeil } from '../lib/kriterier'
import type { BehandlingMetadata } from '../metadata-cache.server'
import { CheckboxEditor } from './editors/CheckboxEditor'
import { MultiSelectEditor } from './editors/MultiSelectEditor'
import { MultiSelectMedOperatorEditor } from './editors/MultiSelectMedOperatorEditor'
import { MultiTallEditor } from './editors/MultiTallEditor'
import { PeriodeEditor } from './editors/PeriodeEditor'
import { TagInputEditor } from './editors/TagInputEditor'
import { TallEditor } from './editors/TallEditor'
import { ToggleEditor } from './editors/ToggleEditor'
import { UuidEditor } from './editors/UuidEditor'
import { ValgfriDatoEditor } from './editors/ValgfriDatoEditor'

type Props = {
  kriterium: Kriterium
  indeks: number
  metadata: BehandlingMetadata | null
  feilForKriterium: Valideringsfeil[]
  onChange: (k: Kriterium) => void
  onFjern: () => void
}

/**
 * Dispatcher fra `Kriterium['type']` til riktig editor-komponent.
 * Renderer en fieldset med visningsnavn + fjern-knapp + selve editoren.
 */
export function KriteriumDispatcher({ kriterium, indeks, metadata, feilForKriterium, onChange, onFjern }: Props) {
  const def = KRITERIE_DEFINISJONER[kriterium.type]
  const feilString = feilForKriterium.map((f) => f.melding).join(', ') || undefined

  return (
    <Box as="section" id={`kriterium-${indeks}`} background="raised" borderRadius="4" padding="space-16" tabIndex={-1}>
      <VStack gap="space-12">
        <HStack justify="space-between" align="center">
          <Heading level="3" size="xsmall">
            {def.visningsnavn}
          </Heading>
          <Button variant="tertiary" size="small" onClick={onFjern}>
            Fjern
          </Button>
        </HStack>
        {renderEditor(kriterium, metadata, feilString, onChange)}
      </VStack>
    </Box>
  )
}

function renderEditor(
  kriterium: Kriterium,
  metadata: BehandlingMetadata | null,
  feil: string | undefined,
  onChange: (k: Kriterium) => void,
) {
  switch (kriterium.type) {
    case 'OPPRETTET_I_PERIODE':
    case 'FULLFORT_I_PERIODE':
    case 'STOPPET_I_PERIODE':
    case 'SIST_KJORT_I_PERIODE':
      return <PeriodeEditor kriterium={kriterium} onChange={onChange} />

    case 'HAR_STATUS':
      return (
        <MultiSelectEditor
          label="Behandlingsstatus"
          alternativer={metadata?.behandlingStatuser ?? []}
          valgte={kriterium.statuser}
          onChange={(nye) => onChange({ ...kriterium, statuser: nye })}
          feil={feil}
        />
      )

    case 'KRAVHODE_HAR_STATUS':
      return (
        <MultiSelectEditor
          label="Kravstatus"
          alternativer={metadata?.kravStatuser ?? []}
          valgte={kriterium.statuser}
          onChange={(nye) => onChange({ ...kriterium, statuser: nye })}
          feil={feil}
        />
      )

    case 'HAR_ANSVARLIG_TEAM':
      return (
        <MultiSelectEditor
          label="Ansvarlig team"
          alternativer={metadata?.ansvarligeTeam ?? []}
          valgte={kriterium.team}
          onChange={(nye) => onChange({ ...kriterium, team: nye })}
          feil={feil}
        />
      )

    case 'KRAV_GJELDER':
      return (
        <MultiSelectEditor
          label="Krav gjelder"
          alternativer={metadata?.kravGjelderKoder ?? []}
          valgte={kriterium.koder}
          onChange={(nye) => onChange({ ...kriterium, koder: nye })}
          feil={feil}
        />
      )

    case 'SAK_HAR_TYPE':
      return (
        <MultiSelectEditor
          label="Sakstype"
          alternativer={metadata?.sakstyper ?? []}
          valgte={kriterium.sakstyper}
          onChange={(nye) => onChange({ ...kriterium, sakstyper: nye })}
          feil={feil}
        />
      )

    case 'KRAV_HAR_EIERENHET':
      return (
        <MultiSelectEditor
          label="Eierenhet"
          alternativer={metadata?.eierenheter ?? []}
          valgte={kriterium.eierenheter}
          onChange={(nye) => onChange({ ...kriterium, eierenheter: nye })}
          feil={feil}
        />
      )

    case 'HAR_AKTIVITET_AV_TYPE': {
      const supported = metadata?.supportedAktivitetTyper ?? []
      const observed = metadata?.observedAktivitetTyper ?? []
      const historiske = observed.filter((o) => !supported.includes(o))
      return (
        <MultiSelectMedOperatorEditor
          label="Aktivitetstype"
          alternativer={supported}
          historiske={historiske}
          valgte={kriterium.aktivitetTyper}
          operator={kriterium.operator}
          onChange={({ valgte, operator }) => onChange({ ...kriterium, aktivitetTyper: valgte, operator })}
          feil={feil}
        />
      )
    }

    case 'KRAVHODE_HAR_KONTROLLPUNKT': {
      const koder = (metadata?.kontrollpunktTyper ?? []).map((k) => k.kode)
      return (
        <MultiSelectMedOperatorEditor
          label="Kontrollpunkt"
          alternativer={koder}
          valgte={kriterium.kontrollpunktTyper}
          operator={kriterium.operator}
          onChange={({ valgte, operator }) => onChange({ ...kriterium, kontrollpunktTyper: valgte, operator })}
          feil={feil}
        />
      )
    }

    case 'OPPRETTET_AV':
      return (
        <TagInputEditor
          label="NAV-identer"
          identer={kriterium.identer}
          onChange={(nye) => onChange({ ...kriterium, identer: nye })}
          feil={feil}
        />
      )

    case 'TILHORER_BEHANDLINGSSERIE':
      return (
        <UuidEditor
          label="Behandlingsserie-UUID"
          uuid={kriterium.uuid}
          onChange={(uuid) => onChange({ ...kriterium, uuid })}
          feil={feil}
        />
      )

    case 'HAR_PRIORITET':
      return (
        <MultiTallEditor
          label="Prioritet(er)"
          prioriteter={kriterium.prioriteter}
          onChange={(nye) => onChange({ ...kriterium, prioriteter: nye })}
          feil={feil}
        />
      )

    case 'AKTIVITET_KJORT_FLERE_GANGER_ENN':
      return (
        <TallEditor
          label="Antall kjøringer"
          verdi={kriterium.terskel}
          onChange={(n) => onChange({ ...kriterium, terskel: n })}
          feil={feil}
        />
      )

    case 'ER_BATCH':
      return (
        <ToggleEditor
          label="Er batch-behandling"
          verdi={kriterium.verdi}
          onChange={(v) => onChange({ ...kriterium, verdi: v })}
        />
      )

    case 'HAR_FEILET_KJORING':
      return (
        <ValgfriDatoEditor
          label="Siden (valgfritt)"
          verdi={kriterium.siden}
          onChange={(v) => onChange({ ...kriterium, siden: v })}
          feil={feil}
        />
      )

    case 'HAR_AAPEN_MANUELL_BEHANDLING':
      return <CheckboxEditor beskrivelse="Filtrerer på behandlinger som har en åpen manuell behandling-aktivitet." />
    case 'HAR_AAPEN_BREVBESTILLING':
      return <CheckboxEditor beskrivelse="Filtrerer på behandlinger som har en åpen brevbestilling-aktivitet." />
    case 'KONTROLLPUNKT_ER_KRITISK':
      return <CheckboxEditor beskrivelse="Filtrerer på krav med minst ett kritisk kontrollpunkt." />

    default: {
      // exhaustive check
      const _exhaustive: never = kriterium
      return <BodyShort>{`Ukjent kriterium: ${JSON.stringify(_exhaustive)}`}</BodyShort>
    }
  }
}
