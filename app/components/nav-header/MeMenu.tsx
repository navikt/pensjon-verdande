import { PersonIcon } from '@navikt/aksel-icons'
import { ActionMenu, BodyShort, Detail, InternalHeader, Theme } from '@navikt/ds-react'
import { Link as ReactRouterLink } from 'react-router'
import type { MeResponse } from '~/brukere/brukere'
import { ThemeSwitchActionMenuItem, useTheme } from '~/components/theme-switch'

export default function MeMenu({ meResponse }: { meResponse: MeResponse }) {
  const theme = useTheme()

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <InternalHeader.UserButton name={`${meResponse.fornavn} ${meResponse.etternavn}`} />
      </ActionMenu.Trigger>
      <Theme theme={theme}>
        <ActionMenu.Content align="end">
          <ActionMenu.Label>
            <dl style={{ margin: '4px 0' }}>
              <BodyShort as="dt" size="small">
                {`${meResponse.fornavn} ${meResponse.etternavn}`}
              </BodyShort>
              <Detail as="dd">{meResponse.brukernavn}</Detail>
            </dl>
          </ActionMenu.Label>
          <ActionMenu.Divider />
          <ActionMenu.Group aria-label="Handlinger">
            <ActionMenu.Item as={ReactRouterLink} to="/brukere/me" icon={<PersonIcon />}>
              Brukeroversikt
            </ActionMenu.Item>
          </ActionMenu.Group>
          <ActionMenu.Divider />
          <ActionMenu.Group label="Velg fargetema">
            <ThemeSwitchActionMenuItem variant="dark" />
            <ThemeSwitchActionMenuItem variant="light" />
          </ActionMenu.Group>
        </ActionMenu.Content>
      </Theme>
    </ActionMenu>
  )
}
