import { Modal } from '../primitives/modal';
import styles from './styles.module.scss';
import { useContext } from 'react';
import { ConfirmationContext } from './context';

export const CONFIRMATION_MODAL_ID = 'confirmation-modal';

export function ConfirmationDialog() {
  const context = useContext(ConfirmationContext);
  if (!context) return null;

  const { options, closeConfirmation } = context;

  const handleConfirm = () => {
    options?.onConfirm();
    closeConfirmation();
  };

  return (
    <Modal
      id={CONFIRMATION_MODAL_ID}
      position="top"
      className={styles.confirmationModal}
    >
      <div className={styles.content}>
        <p>{options?.message}</p>
        <div className={styles.actions}>
          <button onClick={closeConfirmation}>
            {options?.cancelText || 'Cancel'}
            {/* <span>{options?.cancelText || 'Cancel'}</span> */}
          </button>
          <button onClick={handleConfirm}>
            {options?.confirmText || 'Confirm'}
            {/* <span>{options?.confirmText || 'Confirm'}</span> */}
          </button>
        </div>
      </div>
    </Modal>
  );
}
