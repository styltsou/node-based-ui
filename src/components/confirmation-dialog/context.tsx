import { createContext, useState, useCallback } from 'react';
import { useModal } from '../primitives/modal/use-modal';

import {
  CONFIRMATION_MODAL_ID,
  ConfirmationDialog,
} from './confirmation-dialog';

type ConfirmationOptions = {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmationContextType = {
  options: ConfirmationOptions | null;
  showConfirmation: (options: ConfirmationOptions) => void;
  closeConfirmation: () => void;
};

export const ConfirmationContext =
  createContext<ConfirmationContextType | null>(null);

export function ConfirmationDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, close } = useModal();
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);

  const showConfirmation = useCallback(
    (options: ConfirmationOptions) => {
      setOptions(options);
      open(CONFIRMATION_MODAL_ID);
    },
    [open]
  );

  const closeConfirmation = useCallback(() => {
    close(CONFIRMATION_MODAL_ID);
    setOptions(null);
  }, [close]);

  return (
    <ConfirmationContext.Provider
      value={{ options, showConfirmation, closeConfirmation }}
    >
      {children}
      <ConfirmationDialog />
    </ConfirmationContext.Provider>
  );
}
