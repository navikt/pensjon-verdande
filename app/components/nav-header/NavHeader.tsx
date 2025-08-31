import { ActionMenu, Box, HStack, InternalHeader, Search, Spacer } from '@navikt/ds-react'
import {
  BarChartIcon,
  BookIcon,
  ExternalLinkIcon, MenuGridIcon,
  MenuHamburgerIcon,
} from '@navikt/aksel-icons'
import { useEffect, useState } from 'react'
import MeMenu from '~/components/nav-header/MeMenu'
import type { MeResponse } from '~/brukere/brukere'

export type Props = {
  erProduksjon: boolean,
  env: string,
  me: MeResponse,
  darkmode: boolean,
  setDarkmode: React.Dispatch<React.SetStateAction<boolean>>
}

export default function NavHeader(props: Props) {
  const [oppdaterVenstremeny, setoppdaterVenstremeny] = useState(false)

  useEffect(() => {
    const updateVenstremenyWidth = (checked: boolean) => {
      const venstreMeny = document.getElementById('venstre-meny') as HTMLElement | null
      if (venstreMeny) {
          venstreMeny.classList.toggle('kun-ikoner', checked)
      }
    }
    updateVenstremenyWidth(oppdaterVenstremeny)
  }, [oppdaterVenstremeny])

  function harTilgang(operasjon: string) {
    return props.me.tilganger.find(it => it == operasjon)
  }

  return (
    <InternalHeader className={props.erProduksjon ? 'nav-header-production' : ''}>
      <Box.New style={{ display: 'flex', alignItems: 'center', paddingLeft: '0.5rem' }}>
        <label htmlFor={'menu-toggle'}>
          <MenuHamburgerIcon color={'white'} title='Vis/skjul sidemeny' fontSize='2rem' display={'flex'} />
        </label>
        <input type={'checkbox'} id={'menu-toggle'} hidden
               onChange={(event) => setoppdaterVenstremeny(event.target.checked)} />
      </Box.New>

      <InternalHeader.Title
        as="a"
        href="/"
        style={{
          textDecoration: 'none',
          color: 'var(--ax-text-neutral)',
        }}
      >
        Verdande
        {!props.erProduksjon ? (
          <span className='header-environment-postscript'>
            {props.env.toUpperCase()}
          </span>
        ) : (<></>)
        }
      </InternalHeader.Title>
      {props.erProduksjon ? (
        <InternalHeader.Title
          style={{
            textDecoration: 'none',
            color: 'var(--ax-text-neutral)',
          }}
        >
          P R O D U K S J O N !
        </InternalHeader.Title>
      ) : (<></>)
      }

      <Spacer />
      {
        harTilgang('SE_BEHANDLINGER') &&
          <HStack
            as="form"
            paddingInline="space-20"
            align="center"
            method='get'
            action={"/sok"}
          >
            <Search
              label="InternalHeader søk"
              size="small"
              variant="simple"
              name="query"
              placeholder="Søk"
            />
          </HStack>
      }

      <ActionMenu>
        <ActionMenu.Trigger>
          <InternalHeader.Button>
            <MenuGridIcon
              fontSize='1.5rem'
              title='Systemer og oppslagsverk'
            />
          </InternalHeader.Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Group label='Behandlingsløsningen'>
            <ActionMenu.Item
              icon={<BookIcon />}
            >
              <a
                target='_blank'
                href={'https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html'}
                style={{ textDecoration: "none", color: "var(--ax-text-neutral)" }}
              >
                Dokumentasjon
              </a>
              <ExternalLinkIcon />

            </ActionMenu.Item>
            <ActionMenu.Item
              icon={<BarChartIcon />}
            >
              <a
                target='_blank'
                href={'https://grafana.nav.cloud.nais.io/goto/mgXUC1LHg?orgId=1'}
                style={{ textDecoration: "none", color: "var(--ax-text-neutral)" }}
              >
                Grafanadashboard
              </a>
              <ExternalLinkIcon />
            </ActionMenu.Item>
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>

      <MeMenu meResponse={props.me} isDarkmode={props.darkmode} setIsDarkmode={props.setDarkmode}/>
    </InternalHeader>
  )
}
