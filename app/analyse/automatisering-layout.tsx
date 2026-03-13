import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'oversikt', label: 'Oversikt' },
  { value: 'kontrollpunkter', label: 'Kontrollpunkter' },
  { value: 'manuelle', label: 'Manuelle oppgaver' },
] as const

export default function AutomatiseringLayout() {
  return <SectionTabLayout sectionPath="automatisering" faner={faner} />
}
