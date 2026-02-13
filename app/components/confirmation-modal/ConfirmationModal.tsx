import { Button, Dialog } from '@navikt/ds-react'

export function ConfirmationModal(props: { text: string; open: boolean; onOk: () => void; onCancel: () => void }) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onCancel()}>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title>Er du sikker?</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>{props.text}</Dialog.Body>
        <Dialog.Footer>
          <Button type="button" onClick={props.onOk} size="small">
            Fortsett
          </Button>
          <Dialog.CloseTrigger>
            <Button type="button" variant="secondary" size="small">
              Avbryt
            </Button>
          </Dialog.CloseTrigger>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog>
  )
}
