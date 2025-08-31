import BehandlingerTable from '~/components/behandlinger-table/BehandlingerTable'
import type { BehandlingerPage } from '~/types'

export interface Props {
  avhengigeBehandlinger: BehandlingerPage
}

export default function AvhengigeBehandlingerElement(props: Props) {
  return (
    <BehandlingerTable visStatusSoek={true} behandlingerResponse={props.avhengigeBehandlinger} />
  )
}
