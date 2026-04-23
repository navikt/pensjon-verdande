import { Chips, TextField } from '@navikt/ds-react'
import { useState } from 'react'
import { NAV_IDENT_REGEX } from '../../lib/kriterier'

type Props = {
  label: string
  identer: string[]
  onChange: (nye: string[]) => void
  feil?: string
}

/**
 * Chip-input for NAV-identer — én ident per chip. Trykk Enter eller komma for å legge til.
 * Validerer regex per ident og avviser ugyldige (uten å miste tekst-input).
 */
export function TagInputEditor({ label, identer, onChange, feil }: Props) {
  const [input, setInput] = useState('')
  const [lokalFeil, setLokalFeil] = useState<string | null>(null)

  function leggTil(ident: string) {
    const trimmed = ident.trim()
    if (!trimmed) return
    if (!NAV_IDENT_REGEX.test(trimmed)) {
      setLokalFeil(`Ugyldig ident "${trimmed}" (kun A-Z, 0-9, _, ., maks 32 tegn)`)
      return
    }
    if (identer.includes(trimmed)) {
      setLokalFeil(`Ident "${trimmed}" er allerede lagt til`)
      return
    }
    onChange([...identer, trimmed])
    setInput('')
    setLokalFeil(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-8)' }}>
      <TextField
        label={label}
        size="small"
        description="Trykk Enter eller skriv komma for å legge til. Maks 100."
        value={input}
        onChange={(e) => {
          const v = e.target.value
          if (v.endsWith(',')) {
            leggTil(v.slice(0, -1))
          } else {
            setInput(v)
            setLokalFeil(null)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            leggTil(input)
          }
        }}
        error={lokalFeil ?? feil}
      />
      {identer.length > 0 && (
        <Chips>
          {identer.map((ident) => (
            <Chips.Removable key={ident} onClick={() => onChange(identer.filter((x) => x !== ident))}>
              {ident}
            </Chips.Removable>
          ))}
        </Chips>
      )}
    </div>
  )
}
