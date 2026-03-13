import { useOutletContext } from 'react-router'
import SectionTabLayout from './SectionTabLayout'

const faner = [
  { value: 'teamytelse', label: 'Team' },
  { value: 'prioritet', label: 'Prioritet' },
  { value: 'gruppe', label: 'Grupper' },
  { value: 'sakstype', label: 'Sakstype' },
  { value: 'kravtype', label: 'Kravtype' },
  { value: 'vedtakstype', label: 'Vedtak' },
  { value: 'auto-brev', label: 'Autobrev' },
] as const

export default function DimensjonerLayout() {
  const { erProd } = useOutletContext<{ erProd: boolean }>()
  return <SectionTabLayout sectionPath="dimensjoner" faner={faner} erProd={erProd} />
}
