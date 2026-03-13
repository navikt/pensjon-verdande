import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'stoppet', label: 'Stoppede' },
  { value: 'feilanalyse', label: 'Feilanalyse' },
  { value: 'gjenforsok', label: 'Gjenforsøk' },
] as const

export default function KvalitetLayout() {
  return <SectionTabLayout sectionPath="kvalitet" faner={faner} />
}
