import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button, Link } from '@navikt/ds-react'
import { NavLink } from 'react-router'

export type Props = {
  row: {
    behandlingId: number
    aktivitetId?: number | null
  }
}

export function AuditTableActionMenu({ row }: Props) {
  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button variant="tertiary-neutral" icon={<MenuElipsisVerticalIcon title="Saksmeny" />} size="small" />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.Group label={`Behandling ${row.behandlingId}`}>
          <ActionMenu.Item>
            <Link as={NavLink} to={`/behandling/${row.behandlingId}`}>
              Åpne behandling
            </Link>
          </ActionMenu.Item>
        </ActionMenu.Group>
        {row.aktivitetId && (
          <ActionMenu.Group label={`Aktivitet ${row.aktivitetId}`}>
            <ActionMenu.Item>
              <Link as={NavLink} to={`/behandling/${row.behandlingId}/aktivitet/${row.aktivitetId}`}>
                Åpne aktivitet
              </Link>
            </ActionMenu.Item>
          </ActionMenu.Group>
        )}
      </ActionMenu.Content>
    </ActionMenu>
  )
}
