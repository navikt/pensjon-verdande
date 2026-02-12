import { Box, UNSAFE_Combobox } from '@navikt/ds-react'
import type { ComboboxOption } from 'node_modules/@navikt/ds-react/esm/form/combobox/types'

interface OmregningBrevCheckboxProps {
  navn: string
  skalVises: boolean
  tekst: string
  selectedBrevKode: ComboboxOption | undefined
  setselectedBrevKode: React.Dispatch<React.SetStateAction<ComboboxOption | undefined>>
  optionBatchbrevtyper: ComboboxOption[]
}

export default function OmregningBrevCheckbox(props: OmregningBrevCheckboxProps) {
  const defaultbatchbrevtypeOption: ComboboxOption = { value: 'not set', label: 'Ikke angitt' }

  return (
    <Box hidden={!props.skalVises}>
      <UNSAFE_Combobox
        label={props.tekst}
        options={props.optionBatchbrevtyper}
        isMultiSelect={false}
        selectedOptions={props.selectedBrevKode ? [props.selectedBrevKode] : []}
        onToggleSelected={(option) => {
          const newOption = props.optionBatchbrevtyper.find((opt) => opt.value === option)
          if (newOption === props.selectedBrevKode || newOption === undefined) {
            props.setselectedBrevKode(defaultbatchbrevtypeOption)
          } else {
            props.setselectedBrevKode(newOption)
          }
        }}
        name="brevkode"
        shouldAutocomplete={true}
        size={'small'}
      />
      <input hidden={true} name={props.navn} value={props.selectedBrevKode?.value} readOnly={true} />
    </Box>
  )
}
