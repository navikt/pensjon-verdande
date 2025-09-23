export function findCommonAktivitetPrefix(words: string[]) {
  if (!words[0] || words.length === 1) return ''

  let i = 0
  while (words[0][i] && (words[0][i] < '0' || words[0][i] > '9') && words.every((w) => w[i] === words[0][i])) i++

  if (i > 0 && words[0][i - 1] === 'A') {
    i -= 1
  }

  return words[0].substring(0, i)
}

export function findCommonAktivitetPrefixLength(words: string[]) {
  return findCommonAktivitetPrefix(words).length
}
