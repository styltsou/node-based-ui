import { ReactNode } from 'react';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  children: ReactNode;
  position?: PopoverPosition;
  offset?: number;
}

export interface PopoverTriggerProps {
  children: ReactNode;
}

export interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  style?: Omit<React.CSSProperties, 'transform'>;
}

export interface PopoverContextType {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLDivElement>;
  setIsOpen: (value: boolean) => void;
  position: PopoverPosition;
  offset: number;
}

// Type helper for compound components
export interface PopoverComponent extends React.FC<PopoverProps> {
  Trigger: React.FC<PopoverTriggerProps>;
  Content: React.FC<PopoverContentProps>;
}
