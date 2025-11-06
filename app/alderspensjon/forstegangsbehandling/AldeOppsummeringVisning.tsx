import type { AldeOppsummeringDto } from './types'

interface AldeOppsummeringProps {
  data: AldeOppsummeringDto
  fomDato: string
  tomDato: string
}

export const AldeOppsummeringVisning: React.FC<AldeOppsummeringProps> = ({ data }) => {
  return (
    <div>
      <p>Antall behandlinger: {data.antallBehandlinger}</p>
      <p>Antall alde behandlinger: {data.antallAldeBehandlinger}</p>
      <p>Antall alde behandlinger under behandling: {data.aldeBehandlingerUnderBehandling}</p>
      <p>Antall alde fullførte behandlinger: {data.fullforteAldeBehandlinger}</p>
      <p>Antall alde avbrutte behandlinger: {data.avbrutteAldeBehandlingr}</p>
    </div>
  )
}
