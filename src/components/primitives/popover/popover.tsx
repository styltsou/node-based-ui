import { createContext, useContext, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';

import { getPopoverPosition } from './utils';
import styles from './styles.module.scss';

import type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverContextType,
  PopoverComponent,
} from './types';

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

  const { x, y } = getPopoverPosition(triggerRef, position, offset);

  const variants = {
    initial: { x, y, opacity: 0, scale: 0.95 },
    animate: { x, y, opacity: 1, scale: 1 },
    exit: { x, y, opacity: 0, scale: 0.95 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          className={`${styles.popoverContent} ${className || ''}`}
          data-position={position}
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
    </AnimatePresence>
  );
}

// Attach components as static properties
Popover.Trigger = Trigger;
Popover.Content = Content;

// Export the compound component
export default Popover;
