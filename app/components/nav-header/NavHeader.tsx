import { ActionMenu, InternalHeader, Spacer } from '@navikt/ds-react'
import { BarChartIcon, BookIcon, ExternalLinkIcon, MenuGridIcon, PersonIcon } from '@navikt/aksel-icons'
import { NavLink } from 'react-router'
import { MeResponse } from '~/types/brukere'

export type Props = {
  erProduksjon: boolean,
  env: string,
  me: MeResponse,
}

export default function NavHeader(props: Props) {
  return (
    <InternalHeader className={props.erProduksjon ? 'navds-tag--error-filled' : ''}>
      <InternalHeader.Title as='h1'>
        Verdande
        {!props.erProduksjon ? (
          <span className="header-environment-postscript">
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
              fontSize="1.5rem"
              title="Systemer og oppslagsverk"
            />
          </InternalHeader.Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Group label="Verdande">
            <ActionMenu.Item onSelect={console.info} icon={<PersonIcon />}>
              <NavLink
                to={`/brukere/me`}
                style={{ textDecoration: "none", color: "black" }}
              >
                Brukeroversikt
              </NavLink>
            </ActionMenu.Item>
          </ActionMenu.Group>
          <ActionMenu.Divider />
          <ActionMenu.Group label="Behandlingsløsningen">
            <ActionMenu.Item
              icon={<BookIcon />}
            >
              <a
                target="_blank"
                href={"https://pensjon-dokumentasjon.ansatt.dev.nav.no/pen/Behandlingsloesningen/Behandlingslosningen.html"}
                style={{ textDecoration: "none", color: "black" }}
              >
                Dokumentasjon
              </a>
              <ExternalLinkIcon/>

            </ActionMenu.Item>
            <ActionMenu.Item
              icon={<BarChartIcon />}
            >
              <a
                target="_blank"
                href={"https://grafana.nav.cloud.nais.io/goto/mgXUC1LHg?orgId=1"}
                style={{ textDecoration: "none", color: "black" }}
              >
                Grafanadashboard
              </a>
              <ExternalLinkIcon/>
            </ActionMenu.Item>
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>

      <InternalHeader.User name={props.me ? props.me.fornavn + ' ' + props.me.etternavn : ''} />
    </InternalHeader>
  )
}
