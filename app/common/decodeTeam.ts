export enum Team {
  PESYS_ALDER = "Alder",
  PESYS_FELLES = "Felles",
  PESYS_UFORE = "Uføre",
}

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
