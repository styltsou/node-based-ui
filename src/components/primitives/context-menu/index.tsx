import React, { createContext, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';
// import { useScrollLock } from "@/app/_hooks/useScrollLock";
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
  open: (e: React.MouseEvent<HTMLElement>) => void;
  close: () => void;
}>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export const ContextMenu: React.FC<{
  onOpen?: () => void;
  onClose?: () => void;
  content: React.ReactElement;
  children: React.ReactNode;
}> = ({ onOpen, onClose, content, children }) => {
  const menuRef = useRef(null);
  // Keep a copy of them menu always mounted so I can caclulate its size
  // const menuCopyRef = useRef<HTMLDivElement>(null);

  // const { lock, unlock } = useScrollLock({
  //   autoLock: false,
  // });

  const [isActive, setIsActive] = useState<boolean>(false);

  const [menuSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Menu position
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(0);

  // Viewport quadrant where the menu was opened
  const [viewportQuadrant, setViewportQuadrant] =
    useState<ViewportQuadrant>('top-left');

  const openContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    // if (isActive) {
    //   setIsActive(false);
    //   return;
    // }

    console.log('opened');
    // lock();
    // Add this to trigger presence animations every time
    setIsActive(false);

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

    setX(e.clientX + menuOffset.x);
    setY(e.clientY + menuOffset.y);

    if (typeof onOpen === 'function') onOpen();
    setIsActive(true);
  };

  const closeContextMenu = () => {
    console.log('should close');
    if (typeof onClose === 'function') onClose();
    setIsActive(false);
    // unlock();
  };

  // Close menu on Esc
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isActive) closeContextMenu();
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
        isOpen: isActive,
        open: openContextMenu,
        close: closeContextMenu,
      }}
    >
      <div onContextMenu={openContextMenu}>
        {children}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              ref={menuRef}
              className={cn(styles.menu, styles[viewportQuadrant])}
              initial={animationVariants.initial}
              animate={animationVariants.enter}
              exit={animationVariants.exit}
              style={{ x, y }}
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
