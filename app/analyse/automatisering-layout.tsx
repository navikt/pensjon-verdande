import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'oversikt', label: 'Oversikt' },
  { value: 'stoppet', label: 'Stoppede' },
  { value: 'feilanalyse', label: 'Feilanalyse' },
  { value: 'gjenforsok', label: 'Gjenforsøk' },
  { value: 'kontrollpunkter', label: 'Kontrollpunkter' },
  { value: 'manuelle', label: 'Manuelle oppgaver' },
] as const

export default function AutomatiseringLayout() {
  return <SectionTabLayout sectionPath="automatisering" faner={faner} />
}
