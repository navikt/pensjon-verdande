import { Button, HStack, InlineMessage } from '@navikt/ds-react'
import { isRouteErrorResponse, useRevalidator } from 'react-router'

/**
 * Felles feilvisning for analyse-faner.
 * Viser en brukervennlig melding ved timeout (504) med anbefaling om kortere periode.
 * Inkluderer retry-knapp for alle feiltyper.
 */
export function AnalyseErrorAlert({ error, label }: { error: unknown; label: string }) {
  const revalidator = useRevalidator()
  const isTimeout = isRouteErrorResponse(error) && (error.status === 504 || error.status === 408)

  if (isTimeout) {
    return (
      <HStack gap="space-16" align="center" wrap>
        <InlineMessage status="warning">
          Analysen tok for lang tid å kjøre. Prøv å velge en kortere tidsperiode eller et grovere tidsintervall.
        </InlineMessage>
        <Button
          size="small"
          variant="secondary"
          onClick={() => revalidator.revalidate()}
          loading={revalidator.state === 'loading'}
        >
          Prøv igjen
        </Button>
      </HStack>
    )
  }

  const message = isRouteErrorResponse(error)
    ? `${error.status}: ${typeof error.data === 'string' ? error.data : (error.data?.message ?? JSON.stringify(error.data))}`
    : String(error)

  return (
    <HStack gap="space-16" align="center" wrap>
      <InlineMessage status="error">
        Kunne ikke laste {label}: {message}
      </InlineMessage>
      <Button
        size="small"
        variant="secondary"
        onClick={() => revalidator.revalidate()}
        loading={revalidator.state === 'loading'}
      >
        Prøv igjen
      </Button>
    </HStack>
  )
}
