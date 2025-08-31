import { Button, Modal } from '@navikt/ds-react'
import { useRef } from 'react'


export function ConfirmationModal(props: {
  text: string;
  showModal: boolean;
  onOk: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  if (props.showModal) {
    ref.current?.showModal();
  } else {
    ref.current?.close();
  }

  return (
    <div>
      <Modal
        ref={ref}
        header={{ heading: "Er du sikker?", closeButton: false }}
        onClose={props.onCancel}
      >
        <Modal.Body>
          {props.text}
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={props.onOk} size="small">
            Fortsett
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={props.onCancel}
            size="small"
          >
            Avbryt
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}