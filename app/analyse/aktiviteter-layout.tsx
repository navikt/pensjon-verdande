import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'aktivitetsvarighet', label: 'Flaskehals' },
  { value: 'kalendertid', label: 'Kalendertid' },
  { value: 'aktiviteter', label: 'Aktiviteter' },
  { value: 'tidspunkt', label: 'Tidspunkt' },
  { value: 'planlagt', label: 'Planlegging' },
] as const

export default function AktiviteterLayout() {
  return <SectionTabLayout sectionPath="aktiviteter-og-tid" faner={faner} />
}
