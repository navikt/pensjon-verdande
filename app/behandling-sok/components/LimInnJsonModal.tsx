import { Button, Modal, Textarea, VStack } from '@navikt/ds-react'
import { useState } from 'react'
import type { Kriterium } from '../lib/kriterier'
import { erKjentKriterieType } from '../lib/kriterier'
import type { Aggregering, Tidsdimensjon, Visning } from '../lib/url-state'

export type Snapshot = {
  schemaVersion?: string
  behandlingType: string | null
  visning?: Visning
  aggregering?: Aggregering
  tidsdimensjon?: Tidsdimensjon
  kriterier: Kriterium[]
}

type Props = {
  open: boolean
  onClose: () => void
  onApply: (snapshot: Snapshot) => void
}

export function LimInnJsonModal({ open, onClose, onApply }: Props) {
  const [text, setText] = useState('')
  const [feil, setFeil] = useState<string | null>(null)

  function håndterApply() {
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed !== 'object' || parsed === null) throw new Error('Forventet objekt')
      const kriterier = Array.isArray(parsed.kriterier) ? parsed.kriterier : []
      for (const k of kriterier) {
        if (!k || typeof k !== 'object' || !('type' in k) || !erKjentKriterieType(String(k.type))) {
          throw new Error(`Ukjent kriterium-type: ${JSON.stringify(k)}`)
        }
      }
      onApply(parsed as Snapshot)
      setText('')
      setFeil(null)
      onClose()
    } catch (e) {
      setFeil(e instanceof Error ? e.message : 'Ugyldig JSON')
    }
  }

  return (
    <Modal open={open} onClose={onClose} header={{ heading: 'Lim inn JSON-søk' }} width={600}>
      <Modal.Body>
        <VStack gap="space-12">
          <Textarea
            label="Lim inn et tidligere kopiert JSON-søk"
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={feil ?? undefined}
            minRows={10}
            resize
          />
        </VStack>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={håndterApply}>
          Bruk søk
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Avbryt
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
