import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'feilanalyse', label: 'Feilanalyse' },
  { value: 'gjenforsok', label: 'Gjenforsøk' },
  { value: 'stoppet', label: 'Stoppede' },
  { value: 'kontrollpunkter', label: 'Kontrollpunkter' },
  { value: 'manuelle', label: 'Manuelle oppgaver' },
] as const

export default function KvalitetLayout() {
  return <SectionTabLayout sectionPath="kvalitet" faner={faner} />
}
