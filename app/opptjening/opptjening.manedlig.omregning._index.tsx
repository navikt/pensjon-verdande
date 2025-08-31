import EndretOpptjeningManedligUttrekk from '~/opptjening/opptjening.manedlig.uttrekk._index'
import BatchOpprett_index from '~/opptjening/opptjening.kategoriserBruker._index'

export default function OpprettEndretOpptjeningRoute() {
  return (
    <div>
      <h1>Månedlig omregning av ytelse ved oppdaterte opptjeningsopplysninger</h1>
      <div>
        <table width="100%">
          <tr>
            <td><EndretOpptjeningManedligUttrekk /></td>
            <td><BatchOpprett_index /></td>
          </tr>
        </table>
      </div>
    </div>
  )
}
