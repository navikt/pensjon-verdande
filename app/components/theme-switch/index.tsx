import { parseWithZod } from '@conform-to/zod/v4'
import { CheckmarkIcon, MoonIcon, SunIcon } from '@navikt/aksel-icons'
import { ActionMenu, HStack } from '@navikt/ds-react'
import { useFetcher, useRouteLoaderData } from 'react-router'
import type { action } from '~/api/theme-switch'
import type { loader as rootLoader } from '~/root'
import { ThemeFormSchema } from './schema'

const FETCHER_KEY = 'theme-switch'

/**
 * Hent gjeldende tema.
 *
 * Ved initial innlastning av appen, vil dette være verdien fra root loaderen. Når brukeren bytter theme, vil den
 * optimistisk returnere det nye temaet basert på innsendt data.
 */
export function useTheme() {
  const data = useRouteLoaderData<typeof rootLoader>('root')
  const fetcher = useFetcher<typeof action>({ key: FETCHER_KEY })

  if (!data?.theme) {
    return 'light'
  }

  if (fetcher.formData) {
    const submission = parseWithZod(fetcher.formData, {
      schema: ThemeFormSchema,
    })

    if (submission.status === 'success') {
      return submission.value.theme
    }
  }

  return data.theme
}

export function ThemeSwitchActionMenuItem({ variant }: { variant: 'light' | 'dark' }) {
  const fetcher = useFetcher<typeof action>({ key: FETCHER_KEY })
  const theme = useTheme()

  return (
    <ActionMenu.Item
      aria-selected={theme === variant}
      onSelect={() => fetcher.submit({ theme: variant }, { method: 'POST', action: '/api/theme-switch' })}
      icon={variant === 'light' ? <SunIcon /> : <MoonIcon />}
    >
      <HStack gap="space-24" align="center" justify="space-between" flexGrow="1">
        {variant === 'light' ? 'Lyst' : 'Mørkt'}
        {theme === variant && <CheckmarkIcon aria-hidden fontSize="1.25rem" />}
      </HStack>
    </ActionMenu.Item>
  )
}
