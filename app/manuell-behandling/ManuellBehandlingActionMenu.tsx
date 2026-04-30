import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'

type Props = {
  uttrekkHref: string
}

export function ManuellBehandlingActionMenu({ uttrekkHref }: Props) {
  return (
    <ActionMenu>
      <ActionMenu.Trigger>
        <Button
          data-color="neutral"
          variant="tertiary"
          icon={<MenuElipsisVerticalIcon title="Kjøringmeny" />}
          size="small"
        />
      </ActionMenu.Trigger>
      <ActionMenu.Content>
        <ActionMenu.Item as="a" href={uttrekkHref} target="_blank" rel="noopener noreferrer">
          Last ned json-uttrekk
        </ActionMenu.Item>
      </ActionMenu.Content>
    </ActionMenu>
  )
}
