import { Box, Skeleton, Tabs, VStack } from '@navikt/ds-react'
import React from 'react'
import { Outlet, useLocation, useNavigate, useNavigation } from 'react-router'

interface TabDefinition {
  readonly value: string
  readonly label: string
}

interface SectionTabLayoutProps {
  readonly sectionPath: string
  readonly faner: readonly TabDefinition[]
}

export default function SectionTabLayout({ sectionPath, faner }: SectionTabLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const [debouncedLoading, setDebouncedLoading] = React.useState(false)

  const pathParts = location.pathname.split('/')
  const currentTab = pathParts[pathParts.length - 1] || faner[0].value
  const isLoading = navigation.state === 'loading'

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setDebouncedLoading(true), 200)
      return () => clearTimeout(timer)
    }
    setDebouncedLoading(false)
  }, [isLoading])

  function onTabChange(tab: string) {
    navigate(`/analyse/${sectionPath}/${tab}${location.search}`)
  }

  return (
    <VStack gap="space-16">
      <Tabs value={currentTab} onChange={onTabChange}>
        <Tabs.List>
          {faner.map((f) => (
            <Tabs.Tab key={f.value} value={f.value} label={f.label} />
          ))}
        </Tabs.List>
      </Tabs>

      <Box padding="space-24" style={{ overflowX: 'auto' }}>
        {debouncedLoading ? (
          <VStack gap="space-16">
            <Skeleton variant="rounded" height={28} width="60%" />
            <Skeleton variant="rounded" height={300} width="100%" />
            <Skeleton variant="rounded" height={20} width="40%" />
          </VStack>
        ) : (
          <Outlet />
        )}
      </Box>
    </VStack>
  )
}
