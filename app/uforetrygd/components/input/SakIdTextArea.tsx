import { Textarea } from '@navikt/ds-react'

export function parseSakIds(sakIds: FormDataEntryValue | null): number[] {
  if (!sakIds || typeof sakIds !== 'string') return []

  return sakIds
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '')
    .map((id) => {
      const parsed = Number(id)
      if (Number.isNaN(parsed)) {
        throw new Error(`Ugyldig sak ID: "${id}"`)
      }
      return parsed
    })
}

interface Props {
  fieldName: string
}

export function SakIdTextArea({ fieldName }: Props) {
  return (
    <Textarea
      label="Kommaseparert liste med sak-id'er som skal behandles (tomt betyr alle):"
      aria-label="sakIds"
      name={fieldName}
      minRows={3}
      maxRows={10}
    />
  )
}
