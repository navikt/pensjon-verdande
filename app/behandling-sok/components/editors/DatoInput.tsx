import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  description?: ReactNode
  id?: string
}

/**
 * Native <input type="date"> wrapped i Aksel-aktig label/error-styling.
 * Brukes fordi Aksel TextField type ikke aksepterer "date".
 */
export function DatoInput({ label, value, onChange, error, description, id }: Props) {
  const inputId = id ?? `dato-${Math.random().toString(36).slice(2, 8)}`
  return (
    <div className="navds-form-field navds-form-field--small" style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={inputId} className="navds-form-field__label navds-label navds-label--small">
        {label}
      </label>
      {description && (
        <div className="navds-form-field__description navds-body-short navds-body-short--small">{description}</div>
      )}
      <input
        id={inputId}
        type="date"
        className="navds-text-field__input navds-body-short navds-body-short--small"
        value={value}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight: 32, padding: '0 var(--ax-space-8)', borderRadius: 4 }}
      />
      {error && <div className="navds-form-field__error navds-error-message">{error}</div>}
    </div>
  )
}
