export function formatEnhet(enhetId?: string | null, enhetNavn?: string | null): string {
  return [enhetId, enhetNavn].filter(Boolean).join(' - ')
}
