export function decodeTeam(team: string | null): string | null {
  if (team === 'PESYS_ALDER') {
    return 'Alder'
  } else if (team === 'PESYS_FELLES') {
    return 'Felles'
  } else if (team === 'PESYS_UFORE') {
    return 'Uføre'
  } else {
    return team
  }
}
