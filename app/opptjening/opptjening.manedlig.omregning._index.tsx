import ManedligOmregningUttrekk from '~/opptjening/ManedligOmregningUttrekk'
import { useLoaderData } from 'react-router'
import ManedligOmregningKategoriserBruker from '~/opptjening/ManedligOmregningKategoriserBruker'

export const loader = async () => {
  const now = new Date()
  const denneBehandlingsmaneden = now.getFullYear() * 100 + now.getMonth() + 1

  return {
    denneBehandlingsmaneden
  }
}


export default function OpprettEndretOpptjeningRoute() {
  const { denneBehandlingsmaneden } = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</h1>
      <div>
        <table width="100%">
          <tr>
            <td><ManedligOmregningUttrekk denneBehandlingsmaneden={denneBehandlingsmaneden}/></td>
            <td><ManedligOmregningKategoriserBruker denneBehandlingsmaneden={denneBehandlingsmaneden}/></td>
          </tr>
        </table>
      </div>
    </div>
  )
}
