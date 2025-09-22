export const formatNumber = (number: number, opts: Intl.NumberFormatOptions = {}) =>
  Intl.NumberFormat('nb', opts).format(number)
