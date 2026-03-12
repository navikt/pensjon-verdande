import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'nokkeltall', label: 'Nøkkeltall' },
  { value: 'statustrend', label: 'Statustrend' },
  { value: 'varighet', label: 'Varighet' },
  { value: 'ko', label: 'Gjennomstrømning' },
  { value: 'automatisering', label: 'Automatisering' },
  { value: 'ende-til-ende', label: 'Ende-til-ende' },
] as const

export default function YtelseLayout() {
  return <SectionTabLayout sectionPath="ytelse" faner={faner} />
}
