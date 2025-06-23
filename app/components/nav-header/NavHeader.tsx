import { ActionMenu, Box, InternalHeader, Link, Spacer } from '@navikt/ds-react'
import {
  BarChartIcon,
  BookIcon,
  ExternalLinkIcon,
  MenuGridIcon,
  MenuHamburgerIcon, MoonIcon,
  PersonIcon, SunIcon,
} from '@navikt/aksel-icons'
import { Link as ReactRouterLink } from 'react-router'
import { MeResponse } from '~/types/brukere'
import { useEffect, useState } from 'react'
import MeMenu from '~/components/nav-header/MeMenu'

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

  return (
    <InternalHeader className={props.erProduksjon ? 'navds-tag--error-filled' : ''}>
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
        <InternalHeader.Title as='h1'>
          P R O D U K S J O N !
        </InternalHeader.Title>
      ) : (<></>)
      }

      <Spacer />

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
