import React from 'react'
import { Team } from '~/common/decodeTeam'
import { Select } from '@navikt/ds-react'
import { getEnumValueByKey } from '~/common/utils'

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
      id="team-select"
      value={props.ansvarligTeam || ''}
      onChange={handleChange}
    >
      <option value="" disabled>
        Velg et alternativ
      </option>

      {Object.keys(Team).map((teamKey: string) => (
        <option key={teamKey} value={teamKey}>
          {getEnumValueByKey(Team, teamKey)}
        </option>
      ))}
    </Select>
  )
}
