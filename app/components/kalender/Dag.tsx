import { isSameDay } from '~/common/date'
import { PlanlagtOppgave } from '~/components/kalender/types'
import { getWeek } from '~/common/weeknumber'

export type Props = {
  highlightMaaned: Date,
  dato: Date,
  planlagteOppgaver: PlanlagtOppgave[],
  visKlokkeSlett: boolean,
}

export default function Dag(props: Props) {
  let dagLabel: string
  if (props.dato.getDate() === 1) {
    dagLabel = props.dato.getDate() + '. ' +  props.dato.toLocaleDateString('no-NO', { month: 'long' })
  } else {
    dagLabel = props.dato.getDate().toString()
  }

  let textColor: string
  if (props.dato.getFullYear() === props.highlightMaaned.getFullYear() && props.dato.getMonth() === props.highlightMaaned.getMonth()) {
    textColor = 'black'
  } else {
    textColor = 'gray'
  }

  function dayRow() {
    if (props.dato.getDay() === 1) {
      return(
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ textAlign: 'left', color: 'gray', fontSize: '0.9em' }}>{getWeek(props.dato)}</span>
            <span style={{ textAlign: 'right', color: textColor }}>{dagLabel}</span>
          </div>
      );

    } else {
      return(
        <div style={{color: textColor, textAlign: 'right'}}>{dagLabel}</div>
      );
    }
  }

  function dagensOppgaver() {
    return props.planlagteOppgaver
      .filter((oppgave) => isSameDay(oppgave.tidspunkt, props.dato))
      .map((oppgave, idx) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8em' }}>
          <span style={{ textAlign: 'left', color: textColor }}>{oppgave.type}</span>
          {props.visKlokkeSlett && <span style={{ textAlign: 'right', color: textColor }}>{oppgave.tidspunkt.getHours().toString().padStart(2, '0') + ':' + oppgave.tidspunkt.getMinutes().toString().padStart(2, '0')}</span>}
        </div>
      ));
  }

  return(
    <td key={props.dato.toISOString()} style={{ border: "1px solid #ddd"}}>
      <table style={{width: '100%'}}>
        <thead>
        <tr>
          {dayRow()}
        </tr>
        </thead>
        <tbody>
        <tr>{dagensOppgaver()}</tr>
        </tbody>
      </table>
    </td>
  );

}