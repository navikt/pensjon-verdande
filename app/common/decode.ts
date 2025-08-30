const STATUS_MAP = {
  DEBUG: "Debug",
  FEILENDE: "Feilende",
  FULLFORT: "Fullført",
  OPPRETTET: "Opprettet",
  STOPPET: "Stoppet",
  UNDER_BEHANDLING: "Under behandling",
} as const;

function makeDecoder<M extends Record<string, string>>(map: M) {
  return (key: string) => map[key as keyof M] ?? key;
}

export const decodeStatus = makeDecoder(STATUS_MAP);
