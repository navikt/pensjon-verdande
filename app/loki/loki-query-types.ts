/** Label-sett i Loki (LogQL) */
export type LabelSet = Record<string, string>

/** Retning for sortering av logglinjer i svar fra streams */
export type LokiDirection = 'forward' | 'backward'

/** Enkelt vektorpunkt for metric-spørringer (instant vector) */
export interface LokiVectorSample {
  metric: LabelSet
  /** [unix epoch (sekunder), verdi som streng] */
  value: [number, string]
}

/** Stream-resultat (logglinjer) for en gitt label-sett */
export interface LokiStream {
  stream: LabelSet
  /** [unix epoch (nanosekunder) som streng, logglinje] */
  values: [string, string][]
}

/** Statistikk: ingester-del */
export interface LokiStatsIngester {
  compressedBytes: number
  decompressedBytes: number
  decompressedLines: number
  headChunkBytes: number
  headChunkLines: number
  totalBatches: number
  totalChunksMatched: number
  totalDuplicates: number
  totalLinesSent: number
  totalReached: number
}

/** Statistikk: store-del */
export interface LokiStatsStore {
  compressedBytes: number
  decompressedBytes: number
  decompressedLines: number
  chunksDownloadTime: number // sekunder (float)
  totalChunksRef: number
  totalChunksDownloaded: number
  totalDuplicates: number
}

/** Statistikk: summary-del */
export interface LokiStatsSummary {
  bytesProcessedPerSecond: number
  execTime: number // sekunder (float)
  linesProcessedPerSecond: number
  queueTime: number // sekunder (float)
  totalBytesProcessed: number
  totalLinesProcessed: number
}

/** Full statistikkblokk. Feltene kan mangle avhengig av query/type. */
export interface LokiQueryStats {
  ingester?: LokiStatsIngester
  store?: LokiStatsStore
  summary?: LokiStatsSummary
}

/** Discriminated union for datafeltet i query-responsen */
export type LokiInstantQueryData =
  | {
      resultType: 'vector'
      result: LokiVectorSample[]
      stats?: LokiQueryStats
    }
  | {
      resultType: 'streams'
      result: LokiStream[]
      stats?: LokiQueryStats
    }

/** Standard Loki response-wrapper */
export type LokiResponse<TData> =
  | { status: 'success'; data: TData }
  | {
      status: 'error'
      errorType?: string
      error?: string
      // Loki kan også returnere 'data' ved noen feil, la den være valgfri
      data?: Partial<TData>
    }

/** Respons for GET /loki/api/v1/query */
export type LokiInstantQueryResponse = LokiResponse<LokiInstantQueryData>

/** Forespørselsparametre for GET /loki/api/v1/query (instant query) */
export interface LokiInstantQueryParams {
  /** LogQL-spørring */
  query: string
  /** Maks antall linjer (kun relevant for streams). Default 100 */
  limit?: number
  /** Evaluerings-tid: nanosekund-epoch, RFC3339, eller float-seconds */
  time?: string | number
  /** Sorteringsretning for logglinjer i streams. Default 'backward' */
  direction?: LokiDirection
}

/** Type guards for enkel branching på resultType */
export function isVector(data: LokiInstantQueryData): data is Extract<LokiInstantQueryData, { resultType: 'vector' }> {
  return data.resultType === 'vector'
}

export function isStreams(
  data: LokiInstantQueryData,
): data is Extract<LokiInstantQueryData, { resultType: 'streams' }> {
  return data.resultType === 'streams'
}
