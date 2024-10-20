import React, { createContext, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '../../../utils/cn';

import styles from './styles.module.scss';

type ViewportQuadrant =
  | 'top-left'
  | 'bottom-left'
  | 'top-right'
  | 'bottom-right';

const animationVariants = {
  initial: { opacity: 0.5, scale: 0.9 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0.2, scale: 0.9, transition: { duration: 0.08 } },
};

// TODO: FIX THE FUCKING CONTEXT MENU

export const ContextMenuContext = createContext<{
  isOpen: boolean;
  position: { x: number; y: number };
  open: (e: React.MouseEvent<HTMLElement>) => void;
  close: () => void;
}>({
  isOpen: false,
  position: { x: 0, y: 0 },
  open: () => {},
  close: () => {},
});

export const ContextMenu: React.FC<{
  onOpen?: () => void;
  onClose?: () => void;
  content: React.ReactElement;
  children: React.ReactNode;
}> = ({ onOpen, onClose, content, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  // Keep a copy of them menu always mounted so I can caclulate its size
  // const menuCopyRef = useRef<HTMLDivElement>(null);

  // const { lock, unlock } = useScrollLock({
  //   autoLock: false,
  // });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  // const isOpenRef = useRef<boolean>(false);

  const [menuSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Menu position
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Viewport quadrant where the menu was opened
  const [viewportQuadrant, setViewportQuadrant] =
    useState<ViewportQuadrant>('top-left');

  //TODO: Wrap function in a callback
  const openContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (isOpen) return;
    console.log('context menu opened');

    // Calculate the viewport quadrant that way in order to specify
    // the appropriate transform orgin to the menu
    const horizontalOrientation =
      e.clientX <= window.innerWidth / 2 ? 'left' : 'right';
    const verticalOrientation =
      e.clientY <= window.innerHeight / 2 ? 'top' : 'bottom';

    setViewportQuadrant(`${verticalOrientation}-${horizontalOrientation}`);

    const menuOffset = {
      x: horizontalOrientation === 'left' ? 0 : -menuSize.width,
      y: verticalOrientation === 'top' ? 0 : -menuSize.height,
    };

    setPosition({
      x: e.clientX + menuOffset.x,
      y: e.clientY + menuOffset.y,
    });

    console.log('set state');
    console.log('position', position);

    onOpen?.();
    setIsOpen(true);
  };

  // TODO: Wrap function in a callback
  const closeContextMenu = () => {
    if (!isOpen) return;
    console.log('should close');

    onClose?.();
    setIsOpen(false);
  };

  // Close menu on Esc
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        console.log('trigger close');
        closeContextMenu();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useOnClickOutside(menuRef, closeContextMenu);

  return (
    <ContextMenuContext.Provider
      value={{
        isOpen,
        position,
        open: openContextMenu,
        close: closeContextMenu,
      }}
    >
      <div onContextMenu={openContextMenu}>
        {children}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              ref={menuRef}
              className={cn(styles.menu, styles[viewportQuadrant])}
              initial={animationVariants.initial}
              animate={animationVariants.enter}
              exit={animationVariants.exit}
              style={position}
              onContextMenu={e => e.preventDefault()}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContextMenuContext.Provider>
  );
};
