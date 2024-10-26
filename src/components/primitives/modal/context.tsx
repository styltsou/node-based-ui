import { createContext, useState, useCallback } from 'react';

type ModalContextType = {
  isOpen: (id: string) => boolean;
  open: (id: string) => void;
  close: (id: string) => void;
};

export const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [openModals, setOpenModals] = useState<Set<string>>(new Set());

  const isOpen = useCallback((id: string) => openModals.has(id), [openModals]);

  const open = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.add(modalId);
      return next;
    });
  }, []);

  const close = useCallback((modalId: string) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}
