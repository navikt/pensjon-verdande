export function formatIsoTimestamp(
  isoDate: string | undefined | null,
  includeMillis: boolean = false,
) {
  if (isoDate) {
    let date = new Date(isoDate)
    if (includeMillis) {
      return date.toLocaleString('no-NO') + '.' + date.getMilliseconds()
    } else {
      return date.toLocaleString('no-NO')
    }
  }
}


export function formatIsoDate(
  isoDate: string | undefined | null,
) {
  if (isoDate) {
    let date = new Date(isoDate)
      return date.toLocaleDateString('no-NO')
  }
}
