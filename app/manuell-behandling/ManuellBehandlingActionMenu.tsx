import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
import { useSearchParams } from 'react-router'

export function ManuellBehandlingActionMenu() {
  const [searchParams] = useSearchParams()

  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button variant="tertiary-neutral" icon={<MenuElipsisVerticalIcon title="Kjøringmeny" />} size="small" />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.Item
          as="a"
          href={`/manuell-behandling-uttrekk?${searchParams.toString()}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Last ned json-uttrekk
        </ActionMenu.Item>
      </ActionMenu.Content>
    </ActionMenu>
  )
}
