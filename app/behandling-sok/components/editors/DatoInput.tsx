import { DatePicker, useDatepicker } from '@navikt/ds-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

type Props = {
  label: string
  /** ISO `YYYY-MM-DD` eller tom streng for ingen verdi. */
  value: string
  /** Ny ISO-streng (`YYYY-MM-DD`) eller tom streng når brukeren tømmer feltet. */
  onChange: (v: string) => void
  error?: string
  description?: ReactNode
  id?: string
}

function parseISO(value: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return undefined
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return undefined
  return date
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Aksel DatePicker.Input wrapper som tar/gir ISO-streng (`YYYY-MM-DD`).
 * Tomt felt → onChange('').
 */
export function DatoInput({ label, value, onChange, error, description, id }: Props) {
  const initialDate = parseISO(value)
  const { datepickerProps, inputProps, setSelected } = useDatepicker({
    defaultSelected: initialDate,
    onDateChange: (d) => onChange(d ? toISO(d) : ''),
  })

  // Hold input synkronisert hvis ekstern state endres (f.eks. preset-knapp eller "Lim inn JSON").
  const setSelectedRef = useRef(setSelected)
  setSelectedRef.current = setSelected
  useEffect(() => {
    setSelectedRef.current(parseISO(value))
  }, [value])

  return (
    <DatePicker {...datepickerProps}>
      <DatePicker.Input {...inputProps} id={id} label={label} description={description} size="small" error={error} />
    </DatePicker>
  )
}
