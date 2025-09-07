import type React from 'react'
import { Team } from '~/common/decodeTeam'
import { Select } from '@navikt/ds-react'

export interface Props {
  ansvarligTeam: Team | string | null
  onAnsvarligTeamChange: (team: Team) => void
}

export default function AnsvarligTeamSelector(props: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    props.onAnsvarligTeamChange(event.target.value as Team)
  }

  return (
    <Select
      label="Velg ansvarlig team"
      hideLabel
      value={props.ansvarligTeam || ''}
      onChange={handleChange}
    >
      <option value="" disabled>
        Velg et alternativ
      </option>

      {(Object.entries(Team) as [keyof typeof Team, string][]).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </Select>
  )
}
