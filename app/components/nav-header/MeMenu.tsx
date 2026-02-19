import { MoonIcon, PersonIcon, SunIcon } from '@navikt/aksel-icons'
import { ActionMenu, BodyShort, Detail, InternalHeader, Link } from '@navikt/ds-react'
import { Link as ReactRouterLink } from 'react-router'
import type { MeResponse } from '~/brukere/brukere'

export default function MeMenu({
  meResponse,
  isDarkmode,
  setIsDarkmode,
}: {
  meResponse: MeResponse
  isDarkmode: boolean
  setIsDarkmode: React.Dispatch<React.SetStateAction<boolean>>
}) {
  function setDarkmode(darkmode: boolean) {
    setIsDarkmode(darkmode)
    // biome-ignore lint/suspicious/noDocumentCookie: Ønsker å sette en cookie, har foreløpig valgt å ikke bruke et tredjepartsbibliotek
    document.cookie = `darkmode=${encodeURIComponent(btoa(darkmode.toString()))}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
  }

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <InternalHeader.UserButton name={`${meResponse.fornavn} ${meResponse.etternavn}`} />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <dl>
          <BodyShort as="dt" size="small">
            {`${meResponse.fornavn} ${meResponse.etternavn}`}
          </BodyShort>
          <Detail as="dd">{`${meResponse.brukernavn}`}</Detail>
        </dl>
        <ActionMenu.Item icon={<PersonIcon />}>
          <Link
            as={ReactRouterLink}
            to={`/brukere/me`}
            style={{ textDecoration: 'none', color: 'var(--ax-text-neutral)' }}
          >
            Brukeroversikt
          </Link>
        </ActionMenu.Item>
        <ActionMenu.Divider />
        <ActionMenu.Item disabled={!isDarkmode} icon={<SunIcon />} onClick={() => setDarkmode(false)}>
          Bytt til lys modus
        </ActionMenu.Item>
        <ActionMenu.Item disabled={isDarkmode} icon={<MoonIcon />} onClick={() => setDarkmode(true)}>
          Bytt til mørk modus
        </ActionMenu.Item>
      </ActionMenu.Content>
    </ActionMenu>
  )
}
