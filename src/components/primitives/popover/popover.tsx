import { createContext, useContext, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';

import styles from './styles.module.scss';
import { getPopoverPosition } from './utils';
import { useKeybindings } from '../../../hooks/use-keybindings';
import { keyboardKeys } from '../../../constants';

import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverContextType,
  PopoverComponent,
} from './types';
import Portal from '../Portal';

const PopoverContext = createContext<PopoverContextType | null>(null);

const Popover: PopoverComponent = ({
  children,
  position = 'bottom',
  offset = 12,
}: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <PopoverContext.Provider
      value={{ isOpen, triggerRef, setIsOpen, position, offset }}
    >
      <div style={{ position: 'relative', zIndex: 100 }}>{children}</div>
    </PopoverContext.Provider>
  );
};

function Trigger({ children }: PopoverTriggerProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('Popover.Trigger must be used within Popover');
  const { triggerRef, setIsOpen, isOpen } = context;

  return (
    <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
      {children}
    </div>
  );
}

function Content({ children, className, style }: PopoverContentProps) {
  const context = useContext(PopoverContext);
  if (!context) throw new Error('Popover.Content must be used within Popover');
  const { isOpen, triggerRef, setIsOpen, position, offset } = context;

  const contentRef = useRef<HTMLDivElement>(null);

  useOnClickOutside([contentRef, triggerRef], () => {
    if (isOpen) setIsOpen(false);
  });

  useKeybindings([
    {
      cmd: [keyboardKeys.Escape],
      callback: () => setIsOpen(false),
    },
  ]);

  const { x, y } = getPopoverPosition(triggerRef, contentRef, position, offset);

  const variants = {
    initial: (position: PopoverProps['position']) => ({
      x: position === 'right' ? x - 5 : position === 'left' ? x + 5 : x,
      y: position === 'bottom' ? y - 5 : position === 'top' ? y + 5 : y,
      opacity: 0,
      scale: 0.97,
    }),
    animate: {
      x,
      y,
      opacity: 1,
      scale: 1,
    },
    exit: (position: PopoverProps['position']) => ({
      x: position === 'right' ? x - 5 : position === 'left' ? x + 5 : x,
      y: position === 'bottom' ? y - 5 : position === 'top' ? y + 5 : y,
      opacity: 0,
      scale: 0.97,
    }),
  };

  return (
    <Portal containerId={`group-popover-portal`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="popover-content"
            className={`${styles.popoverContent} ${className || ''}`}
            data-position={position}
            custom={position}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.1 }}
            style={style}
          >
            {children}
          </motion.div>
        )}
        <div
          key="popover-content-hidden"
          ref={contentRef}
          className={`${styles.popoverContent} ${className || ''}`}
          data-position={position}
          style={{
            ...style,
            position: 'fixed',
            top: 0,
            left: 0,
            visibility: 'hidden',
            zIndex: -1000,
          }}
        >
          {children}
        </div>
      </AnimatePresence>
    </Portal>
  );
}

// Attach components as static properties
Popover.Trigger = Trigger;
Popover.Content = Content;

// Export the compound component
export default Popover;
